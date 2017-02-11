(function(){
    'use strict';
    angular.module('app').config(function ( $routeProvider) {

        $routeProvider
            .when('/', {
                redirectTo: '/dashboard'
            })
            .when('/dashboard', {
                controller: 'DashboardCtrl',
                controllerAs: 'vm',
                templateUrl: 'pages/dashboard.html'
            })
            .when('/404', {
                templateUrl: 'pages/404.html'
            })
            .otherwise({
                redirectTo: '/404',
            });
    });
})();
