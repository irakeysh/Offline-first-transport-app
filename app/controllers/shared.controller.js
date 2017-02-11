(function () {
  'use strict';
  angular.module('app.header', []).controller('SharedCtrl', SharedCtrl);

  SharedCtrl.$inject = ['$scope', '$rootScope', '$window', '$location', 'idbInit'];

  function SharedCtrl($scope, $rootScope, $window, $location, idbInit) {
    var vm = this;
    //activate();

    function activate() {

    };

    vm.refresh = function(index){
      $rootScope.notifications.splice(index, 1);
    }
  }
})();
