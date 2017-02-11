(function () {
    'use strict';

    angular.module('app').controller('AppCtrl', AppCtrl);

    AppCtrl.$inject = ['$scope', '$rootScope', 'appConfig'];

    function AppCtrl($scope, $rootScope, appConfig) {

      $scope.pageTransitionOpts = appConfig.pageTransitionOpts;
      $scope.main = appConfig.main;
      $scope.color = appConfig.color;

      $scope.$watch('main', function(newVal, oldVal) {

          if (newVal.menu === 'horizontal' && oldVal.menu === 'vertical') {
            $rootScope.$broadcast('nav:reset');
          }
          if (newVal.fixedHeader === false && newVal.fixedSidebar === true) {
          if (oldVal.fixedHeader === false && oldVal.fixedSidebar === false) {
              $scope.main.fixedHeader = true;
              $scope.main.fixedSidebar = true;
          }
          if (oldVal.fixedHeader === true && oldVal.fixedSidebar === true) {
              $scope.main.fixedHeader = false;
              $scope.main.fixedSidebar = false;
          }
          }
          if (newVal.fixedSidebar === true) {
            $scope.main.fixedHeader = true;
          }
          if (newVal.fixedHeader === false) {
            $scope.main.fixedSidebar = false;
          }
      }, true);
    }
})();