/*!
app.js
(c) 2019 IG PROG, www.igprog.hr
*/
angular.module('app', ['ngStorage', 'pascalprecht.translate'])
.config(['$httpProvider', '$translateProvider', '$translatePartialLoaderProvider', ($httpProvider, $translateProvider, $translatePartialLoaderProvider) => {

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: './assets/json/translations/{lang}/{part}.json'
    });
    $translateProvider.preferredLanguage('hr');
    $translatePartialLoaderProvider.addPart('main');
    $translateProvider.useSanitizeValueStrategy('escape');

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
        },
        setDate: (x) => {
            var day = x.getDate();
            day = day < 10 ? '0' + day : day;
            var mo = x.getMonth();
            mo = mo + 1 < 10 ? '0' + (mo + 1) : mo + 1;
            var yr = x.getFullYear();
            return yr + '-' + mo + '-' + day;
        }
    }
}])

.controller('appCtrl', ['$scope', '$http', '$rootScope', 'f', '$sessionStorage', '$translate', '$translatePartialLoader', function ($scope, $http, $rootScope, f, $sessionStorage, $translate, $translatePartialLoader) {
    var data = {
        loading: false,
        records: [],
        info: null,
        mainGallery: null
    }
    $scope.d = data;

    var getConfig = function () {
        $http.get('../config/config.json')
          .then(function (response) {
              $rootScope.config = response.data;
              $sessionStorage.config = response.data;
              loadProducts();
              loadInfo();
          });
    };
    getConfig();
    //if (!angular.isDefined($sessionStorage.config)) {
    //    getConfig();
    //} else {
    //    $rootScope.config = $sessionStorage.config;
    //    //reloadPage();
    //}

    $scope.year = (new Date).getFullYear();

    $scope.setLang = function (x) {
        $rootScope.config.lang = x;
        $sessionStorage.config.lang = x;
        $translate.use(x.code);
        $translatePartialLoader.addPart('main');
        loadProducts();
        loadInfo();
    };
    //if (angular.isDefined($sessionStorage.config)) {
    //    $scope.setLang($sessionStorage.config.lang);
    //}

    var loadProducts = () => {
        debugger;
        $scope.d.loading = true;
        f.post('Products', 'Load', { lang: $sessionStorage.config.lang.code }).then((d) => {
            $scope.d.records = d;
            $scope.d.loading = false;
        });
    }

    var loadInfo = () => {
        f.post('Info', 'Load', { lang: $sessionStorage.config.lang.code }).then((d) => {
            $rootScope.info = d;
        });
    }
    //loadInfo();

    var loadMainGallery = () => {
        f.post('Info', 'LoadMainGellery', {}).then((d) => {
            $scope.d.mainGallery = d;
        });
    }
    loadMainGallery();

}])


.controller('detailsCtrl', ['$scope', '$http', '$rootScope', 'f', function ($scope, $http, $rootScope, f) {
    var queryString = location.search;
    var params = queryString.split('&');
    var id = null;
    $scope.loadinf = false;
    debugger;
    if (params.length > 0) {
        if (params[0].substring(1, 3) === 'id') {
            id = params[0].substring(4);
        } 
    }

    var get = (id) => {
        if (id == null) { return false;}
        $scope.loading = true;
        f.post('Products', 'Get', { id: id }).then((d) => {
            $scope.d = d;
            $scope.loading = false;
        });
    }
    get(id);

}])

.controller('contactCtrl', ['$scope', '$http', '$rootScope', 'f', function ($scope, $http, $rootScope, f) {
    var webService = 'Contact';
    $scope.loading = false;
    var init = () => {
        f.post(webService, 'Init', {}).then((d) => {
            $scope.d = d;
        });
    }
    init();

    $scope.send = function (d) {
        $scope.loading = true;
        f.post(webService, 'Send', { x: d }).then((d) => {
            $scope.d = d;
            $scope.loading = false;
        })
    }

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
            id: '=',
            product: '=',
            shortdesc: '=',
            longdesc: '=',
            img: '=',
            price: '=',
            gallery: '='
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
            id: '=',
            product: '=',
            shortdesc: '=',
            img: '=',
            link: '=',
            showdesc: '='
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
                if (event.which == 64 || event.which == 16) {
                    return false;
                } else if (event.which >= 48 && event.which <= 57) {
                    return true;
                } else if (event.which >= 96 && event.which <= 105) {
                    return true;
                } else if ([8, 13, 27, 37, 38, 39, 40].indexOf(event.which) > -1) {
                    return true;
                } else if (event.which == 110 || event.which == 188 || event.which == 190) {
                    return true;
                } else if (event.which == 46) {
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