(function () {
  'use strict';

  angular.module('app').factory('jsonFactory', function($http){

    function agency() {
      return new Promise(function(resolve, reject) {
        $http.get('../gtfs/agency.json').success(function(data) {
            resolve(data);
        });
      });
    };

    function stops() {
      return new Promise(function(resolve, reject) {
        $http.get('../gtfs/stops.json').success(function(data) {
            resolve(data);
        });
      });
    };

    function stop_times(){
      return new Promise(function(resolve, reject) {
        $http.get('../gtfs/stop_times.json').success(function(data) {
            resolve(data);
        });
      });
    };

    return {
      agency      : agency,
      stops       : stops,
      stop_times  : stop_times
    };
  });
})();
