/*!
app.js
(c) 2019 IG PROG, www.igprog.hr
*/
angular.module('admin', ['ngStorage'])
.config(['$httpProvider', ($httpProvider) => {
    //*******************disable catche**********************
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    //*******************************************************
}])

.factory('f', ['$http', ($http) => {
    return {
        post: (service, method, data) => {
            return $http({
                url: './' + service + '.asmx/' + method,
                method: 'POST',
                data: data
            })
            .then((response) => {
                return JSON.parse(response.data.d);
            },
            (response) => {
                return response.data.d;
            });
        }
    }
}])

.controller('adminCtrl', ['$scope', '$http', 'f', '$sessionStorage', ($scope, $http, f, $sessionStorage) => {
    var isLogin = $sessionStorage.islogin !== undefined ? $sessionStorage.islogin : false;
    var service = 'Admin';
    var data = {
        admin: {
            userName: null,
            password: null
        },
        isLogin: isLogin,
        inquiries: null,
        loading: false,
        productGroups: [],
        products: []
    }
    $scope.d = data;

    var getConfig = function () {
        $http.get('../config/config.json')
          .then(function (response) {
              $scope.config = response.data;
          });
    };
    getConfig();

    $scope.toggleTpl = (x) => {
        $scope.tpl = x;
    };

    $scope.f = {
        login: (u) => {
            return login(u);
        },
        logout: () => {
            return logout();
        },
        signup: (u, accept) => {
            return signup(u, accept);
        }
    }

    /********* Login **********/
    var login = (x) => {
        f.post(service, 'Login', { username: x.userName, password: x.password }).then((d) => {
            $scope.d.isLogin = d;
            $sessionStorage.islogin = d;
            if (d === true) {
                $scope.toggleTpl('products');
            }
        });
    }

    var logout = () => {
        $scope.d.isLogin = false;
        $sessionStorage.islogin = null;
        $scope.toggleTpl('login');
    };


    if (isLogin) {
        $scope.toggleTpl('products');
    } else {
        $scope.toggleTpl('login');
    }
    /********* Login **********/

}])

.controller('productGroupsCtrl', ['$scope', '$http', 'f', ($scope, $http, f) => {
        var service = 'ProductGroups';
        var data = {
            loading: false,
            records: []
        }
        $scope.d = data;

        var init = () => {
            f.post(service, 'Init', {}).then((d) => {
                $scope.d.records.push(d);
            });
        }

        var load = () => {
            $scope.d.loading = true;
            f.post(service, 'Load', {}).then((d) => {
                $scope.d.records = d;
                $scope.d.loading = false;
            });
        }
        load();

        var save = (x) => {
            f.post(service, 'Save', { x: x }).then((d) => {
                $scope.d.records = d;
            });
        }

        var remove = (x) => {
            if (confirm('Briši grupu?')) {
                f.post(service, 'Delete', { x: x }).then((d) => {
                    $scope.d.records = d;
                });
            }
        }
        
        $scope.f = {
            init: () => {
                return init();
            },
            save: (x) => {
                return save(x);
            },
            get: () => {
                return get();
            },
            remove: (x) => {
                return remove(x)
            }
        }
}])

.controller('productsCtrl', ['$scope', '$http', 'f', ($scope, $http, f) => {
    var service = 'Products';
    var data = {
        loading: false,
        productGroups: [],
        records: []
    }
    $scope.d = data;

    var loadProductGroups = () => {
        $scope.d.loading = true;
        f.post('ProductGroups', 'Load', {}).then((d) => {
            $scope.d.productGroups = d;
            $scope.d.loading = false;
        });
    }
    loadProductGroups();

    var load = () => {
        f.post(service, 'Load', {}).then((d) => {
            $scope.d.records = d;
        });
    }
    load();

    var save = (x) => {
        f.post(service, 'Save', { x: x }).then((d) => {
            $scope.d.records = d;
        });
    }

    var upload = (x, idx) => {
        var content = new FormData(document.getElementById('formUpload_' + x.id));
        $http({
            url: '../UploadHandler.ashx',
            method: 'POST',
            headers: { 'Content-Type': undefined },
            data: content,
        }).then(function (response) {
            loadProductGallery(x);
        },
        function (response) {
            alert(response.data.d);
        });
    }

    var loadProductGallery = (x) => {
        f.post(service, 'LoadProductGallery', { productId: x.id }).then((d) => {
            x.gallery = d;
        });
    }

    var deleteImg = (x, img) => {
        if (confirm('Briši sliku?')) {
            f.post(service, 'DeleteImg', { productId: x.id, img: img }).then((d) => {
                $scope.d.records = d;
            });
        }
    }

    var newProduct = () => {
        f.post(service, 'Init', {}).then((d) => {
            $scope.d.records.push(d);
        });
    }

    var remove = (x) => {
        if (confirm('Briši proizvod?')) {
            f.post(service, 'Delete', { x: x }).then((d) => {
                $scope.d.records.push(d);
            });
        }
    }

    var setMainImg = (x, img) => {
        f.post(service, 'SetMainImg', { productId: x.id, img: img }).then((d) => {
            $scope.d.records = d;
        });
    }

    $scope.f = {
        load: () => {
            return load();
        },
        save: (x) => {
            return save(x)
        },
        upload: (x, idx) => {
            return upload(x, idx);
        },
        deleteImg: (x, img) => {
            return deleteImg(x, img);
        },
        newProduct: () => {
            return newProduct();
        },
        remove: (x) => {
            return remove(x);
        },
        setMainImg: (x, img) => {
            return setMainImg(x, img);
        }
    }
}])

.controller('infoCtrl', ['$scope', '$http', 'f', ($scope, $http, f) => {
    var service = 'Info';

    $scope.save = (x) => {
        f.post(service, 'Save', { x: x }).then((d) => {
            $scope.d = d;
        });
    }

    var load = () => {
        f.post(service, 'Load', {}).then((d) => {
            $scope.d = d;
        });
    }
    load();

    
}])

/********** Directives **********/
.directive('reservationDirective', () => {
    return {
        restrict: 'E',
        scope: {
            service: '='
        },
        templateUrl: './assets/partials/reservation.html'
    };
})

.directive('detailsDirective', () => {
    return {
        restrict: 'E',
        scope: {
            service: '=',
            desc: '=',
            img: '=',
            price: '='
        },
        templateUrl: './assets/partials/details.html'
    };
})

.directive('navbarDirective', () => {
    return {
        restrict: 'E',
        scope: {
            site: '='
        },
        templateUrl: './assets/partials/navbar.html'
    };
})

.directive('cardDirective', () => {
    return {
        restrict: 'E',
        scope: {
            service: '=',
            desc: '=',
            link: '='
        },
        templateUrl: './assets/partials/card.html'
    };
})

.directive('loadingDirective', () => {
    return {
        restrict: 'E',
        scope: {
            btntitle: '=',
            loadingtitle: '=',
            value: '=',
            pdf: '=',
            size: '='
        },
        templateUrl: './assets/partials/loading.html'
    };
})

.directive('allowOnlyNumbers', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs, ctrl) {
            elm.on('keydown', function (event) {
                var $input = $(this);
                var value = $input.val();
                value = value.replace(',', '.');
                $input.val(value);
                if (event.which === 64 || event.which === 16) {
                    return false;
                } else if (event.which >= 48 && event.which <= 57) {
                    return true;
                } else if (event.which >= 96 && event.which <= 105) {
                    return true;
                } else if ([8, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
                    return true;
                } else if (event.which === 110 || event.which === 188 || event.which === 190) {
                    return true;
                } else if (event.which === 46) {
                    return true;
                } else {
                    event.preventDefault();
                    return false;
                }
            });
        }
    }
})
/********** Directives **********/


;