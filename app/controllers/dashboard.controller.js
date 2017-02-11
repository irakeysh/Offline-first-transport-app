(function () {
  'use strict';

  angular.module('app.dashboard', []).controller('DashboardCtrl', DashboardCtrl);

  DashboardCtrl.$inject = ['$scope', 'idbInit', 'jsonFactory', '$rootScope'];

  function DashboardCtrl($scope, idbInit, jsonFactory, $rootScope) {
      var vm = this;

      vm.arrival = false;
      vm.departure = false;
      vm.stop_times_filtered = [];
      vm.disableOption = disableOption;
      vm.pointA = pointA;
      vm.pointB = pointB;
      vm.stops = [];
      vm.stop_times = [];
      vm.setCategory = setCategory;
      vm.category = 'weekday';

      activate();

      function activate(){
        //data feed online
        if($rootScope.online){
          firebase.database().ref('stops').on('value', function(snapshot) {
            snapshot.val().forEach(function(stop) {
              stop.stop_name = stop.stop_name.match(/- (.*) STATION/)[1];
              if(idbInit.isStop(stop, vm.stops))
                vm.stops.push(stop);
            });
          });

          firebase.database().ref('stop_times').on('value', function(snapshot) {
            vm.stop_times = snapshot.val();
          });
        }

        var stopObject = idbInit.getObjectStops();
        var stop_timesObject = idbInit.getObjectStopTimes();

        Promise.all([stopObject, stop_timesObject]).then(function(stores) {
          var p1 = idbInit.populateIDB(stores[0], 'stops');
          var p2 = idbInit.populateIDB(stores[1], 'stop_times');

          //data feed offline
          if(!$rootScope.online){
            Promise.all([p1, p2]).then(function(idbs) {

              stores[0].getAll(function(data) {
                data[0].forEach(function(stop){
                  stop.stop_name = stop.stop_name.match(/- (.*) STATION/)[1];
                  if(idbInit.isStop(stop, vm.stops))
                    vm.stops.push(stop);
                });
              });

              stores[1].getAll(function(data) {
                data[0].forEach(function(stopTimes){
                    vm.stop_times.push(stopTimes);
                });
              });

            });
          }
        });
      };

      function getData(){
      };

      function disableOption(stop){
        if(vm.stationA)
          return stop.stop_name === vm.stationA.stop_name;
        return false;
      };

      function duration(time_a, time_b){
        return ((toSeconds(time_b) / 60) - (toSeconds(time_a) / 60));
      };

      function getConections(){
        vm.stops.forEach(function(stop){
          if(vm.stationA.status == "north"){
            vm.way = 'Northbound Service';
            if(stop.stop_id < vm.stationA.stop_id && stop.stop_id > vm.stationB.stop_id)
              vm.conections.push(stop);
          }else {
            vm.way = 'Southbound Service';
            if(stop.stop_id > vm.stationA.stop_id && stop.stop_id < vm.stationB.stop_id)
              vm.conections.push(stop);
          }
          vm.conections.sort(function(a, b){return a.stop_id - b.stop_id});
        });
      };

      function getStops(){
        var ref_stop = firebase.database().ref('stops');

        return new Promise(function(resolve, reject) {
          ref_stop.on('value', function(data) {
            resolve(data.val());
          });
        });
      }

      function getTimes(){
        vm.stop_times_filtered = [];

        var way;
        var time_a = [];
        var time_b = [];
        var filtered = [];
        var time = {};

        if(vm.stationA.status == "north")way = 0;
        if(vm.stationA.status == "south")way = 1;

        vm.stop_times.forEach(function(entry){
          if(entry.stop_id == (vm.stationA.stop_id + way))
            time_a.push(entry);
          if(entry.stop_id == (vm.stationB.stop_id + way))
            time_b.push(entry);
        });

        for (var i = 0; i < time_a.length; i++){
          loop2: for (var j = 0; j < time_b.length; j++){
            if(isValidTrip(time_a[i].trip_id, time_b[j].trip_id)){
              time = {
                train     : time_a[i].trip_id,
                arrival   : formatAMPM(time_a[i].departure_time),
                departure : formatAMPM(time_b[j].arrival_time),
                duration  : duration(time_a[i].departure_time, time_b[j].arrival_time),
                position  : toSeconds(time_a[i].departure_time),
                category  : getCategory(time_a[i].trip_id),
                trip      : time_a[i].trip_id
              };

              vm.stop_times_filtered.push(time);
              break loop2;
            }
          }
        }
      };

      function setCategory(category){
        vm.category = category;
      }

      function getCategory(trip){
        if(trip < 400) {
          return 'weekday';
        }else if(trip >= 400) {
          return 'weekend';
        }else{
          return 'shuttle';
        }
      }

      function formatAMPM(time) {
        var hours = parseInt(time.substr(0, 2));
        var minutes = parseInt(time.substr(3, 2));
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours > 9 ? hours + ':' + minutes + ampm : '0'+hours + ':' + minutes + ampm;
        return strTime;
      };

      function isValidOption(){
        if(typeof vm.stationB === 'object' && typeof vm.stationA === 'object')
          if(vm.stationA && vm.stationB)
            return true;
        return false;
      };

      function isValidTrip(trip_a, trip_b){
        var flag;

        if((trip_a == trip_b))
          flag = true;
        else
          flag = false;

        if(flag){
          vm.stop_times_filtered.forEach(function(entry){
            if(entry.train == trip_a)
              flag = false;
          });
        }
        return flag;
      };

      function offline() {

        idbInit.getObjectStops().then(function(stopObject) {

          var onsuccess = function(data){
            data[0].forEach(function(stop){
              stop.stop_name = stop.stop_name.match(/- (.*) STATION/)[1];
              if(idbInit.isStop(stop, vm.stops))
                vm.stops.push(stop);
            });
          }
          var onerror = function(error){

            console.log('Oh noes, sth went wrong!', error);
          }

          stopObject.getAll(onsuccess, onerror);
        });

      };

      function pointA() {
        vm.departure = !vm.departure;

        if(!vm.departure){
          vm.conections = [];
          vm.way = '';
        }
        if(!vm.departure & isValidOption()){
          setStatus();
          getConections();
          north();
          getTimes();
        }
      };

      function pointB(){
        vm.arrival = !vm.arrival;

        if(!vm.arrival){
          vm.way = '';
          vm.conections = [];
        }

        if(!vm.arrival & isValidOption()){
          setStatus();
          getConections();
          north();
          getTimes();
        }
      };

      function north(){
        if(vm.stationA.status == "north")
          vm.conections.reverse();
      };

      function setStatus(){
        if(vm.stationA.stop_id > vm.stationB.stop_id)
          vm.stationA.status = "north"
        else
          vm.stationA.status = "south"
      };

      function toSeconds(time){
        return (+time.split(':')[0]) * 60 * 60 + (+time.split(':')[1]) * 60 + (+time.split(':')[2]);
      }
    }
})();
