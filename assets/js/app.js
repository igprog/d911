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

    var queryString = location.search;
    var params = queryString.split('&');

    if (params.length > 1) {
        $scope.page = parseInt(params[1].substring(5, 6));
    } else {
        $scope.page = 1;
    }

    var data = {
        loading: false,
        records: [],
        info: null,
        mainGallery: null,
        services: []
    }
    $scope.d = data;

    var getConfig = function () {
        $http.get('../config/config.json')
          .then(function (response) {
              $rootScope.config = response.data;
              $sessionStorage.config = response.data;
              $sessionStorage.lang = response.data.lang.code;
              $rootScope.lang = $sessionStorage.lang;
              /*** lang ***/
              var queryString = location.search;
              if (queryString !== '') {
                  var params = queryString.split('&');
                  if (params.length == 1) {
                      $sessionStorage.lang = params[0].substring(6, 8);
                      $rootScope.lang = $sessionStorage.lang;
                      $translate.use($sessionStorage.lang);
                      $translatePartialLoader.addPart('main');
                  }
              }
              /*** lang ***/
              loadProducts();
              loadInfo();
              loadServices();
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
        $sessionStorage.lang = x.code;
        $rootScope.lang = $sessionStorage.lang;
        $translate.use(x.code);
        $translatePartialLoader.addPart('main');
        window.location.href = window.location.origin + '?lang=' + x.code;
        loadProducts();
        loadInfo();
        loadServices();
    };
    //if (angular.isDefined($sessionStorage.config)) {
    //    $scope.setLang($sessionStorage.lang);
    //}

    var loadProducts = () => {
        $scope.d.loading = true;
        f.post('Products', 'Load', { lang: $sessionStorage.lang }).then((d) => {
            $scope.d.records = d;
            $scope.d.loading = false;
        });
    }

    var loadInfo = () => {
        f.post('Info', 'Load', { lang: $sessionStorage.lang }).then((d) => {
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

    var loadServices = () => {
        debugger;
        f.post('Options', 'Load', { type: 'services' }).then((d) => {
            $scope.d.services = d;
        });
    }

}])


.controller('detailsCtrl', ['$scope', '$http', '$rootScope', 'f', '$sessionStorage', '$translate', function ($scope, $http, $rootScope, f, $sessionStorage, $translate) {
    var queryString = location.search;
    var params = queryString.split('&');
    var id = null;
    $scope.lang = $sessionStorage.lang;
    $scope.loading = false;
    if (params.length > 0) {
        if (params[0].substring(1, 3) === 'id') {
            id = params[0].substring(4);
        }
        if (params.length > 1) {
            /*** lang ***/
            if (params[1].substring(0, 4) === 'lang') {
                $scope.lang = params[1].substring(5, 7);
                $translate.use($scope.lang);
            }
            /*** lang ***/
        }
    }

    var get = (id) => {
        if (id == null) { return false;}
        $scope.loading = true;
        f.post('Products', 'Get', { id: id, lang: $scope.lang }).then((d) => {
            $scope.d = d;
            $scope.loading = false;
        });
    }
    get(id);

}])

.controller('contactCtrl', ['$scope', '$http', '$rootScope', 'f', '$translate', function ($scope, $http, $rootScope, f, $translate) {
    var service = 'Contact';
    $scope.loading = false;
    var init = () => {
        f.post(service, 'Init', {}).then((d) => {
            $scope.d = d;
        });
    }
    init();

    $scope.send = function (d) {
        $scope.loading = true;
        f.post(service, 'Send', { x: d }).then((d) => {
            $scope.d = d;
            $scope.loading = false;
        })
    }

}])

/********** Directives **********/
//.directive('reservationDirective', () => {
//    return {
//        restrict: 'E',
//        scope: {
//            service: '='
//        },
//        templateUrl: './assets/partials/reservation.html'
//    };
//})

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
            gallery: '=',
            options: '='
        },
        templateUrl: './assets/partials/directive/details.html'
    };
})

.directive('navbarDirective', () => {
    return {
        restrict: 'E',
        scope: {
            site: '=',
            lang: '='
        },
        templateUrl: './assets/partials/directive/navbar.html'
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
            showdesc: '=',
            lang: '='
        },
        templateUrl: './assets/partials/directive/card.html'
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
        templateUrl: './assets/partials/directive/loading.html'
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