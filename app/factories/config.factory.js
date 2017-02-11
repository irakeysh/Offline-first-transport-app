(function() {
  angular.module('app')
      .factory('appConfig', [appConfig]);

  function appConfig() {
      var pageTransitionOpts = [
          {
              name: 'Fade up',
              "class": 'animate-fade-up'
          }, {
              name: 'Scale up',
              "class": 'ainmate-scale-up'
          }, {
              name: 'Slide in from right',
              "class": 'ainmate-slide-in-right'
          }, {
              name: 'Flip Y',
              "class": 'animate-flip-y'
          }
      ];
      var date = new Date();
      var year = date.getFullYear();
      var main = {
          brand: 'Caltrain',
          name: 'Lisa',
          year: year,
          layout: 'wide',                                 // 'boxed', 'wide'
          menu: 'vertical',                               // 'horizontal', 'vertical'
          isMenuCollapsed: true,                         // true, false
          fixedHeader: true,                              // true, false
          fixedSidebar: false,                             // true, false
          pageTransition: pageTransitionOpts[0],          // 0, 1, 2, 3... and build your own
          skin: '26'                                      // 11,12,13,14,15,16; 21,22,23,24,25,26; 31,32,33,34,35,36
      };
      var color = {
          primary:    '#31C0BE',
          success:    '#60CD9B',
          info:       '#66B5D7',
          infoAlt:    '#8170CA',
          warning:    '#EEC95A',
          danger:     '#E87352',
          gray:       '#DCDCDC'
      };

      function isOnline() {
        // Handle IE and more capable browsers
        var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
        var status;

        // Open new request as a HEAD to the root hostname with a random param to bust the cache
        xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

        // Issue request and handle response
        try {
          xhr.send();
          return ( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) );
        } catch (error) {
          return false;
        }
      };

      return {
          pageTransitionOpts: pageTransitionOpts,
          main      : main,
          color     : color,
          isOnline  : isOnline
      }
  }
})();
