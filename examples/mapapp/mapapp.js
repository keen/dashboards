!(function(undefined) {
  window.onresize = adjust;
  function adjust(){
    document.getElementById("app-wrapper").style.height = window.innerHeight;
    document.getElementById("app-maparea").style.height = (window.innerHeight-75) + "px";
  }
  adjust();

  var client = new Keen({
    projectId: "53eab6e12481962467000000",
    readKey: "d1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455"
  });

  Keen.ready(function() {
    var initialize,
        circle,
        marker,
        map,
        markerStart = { lat: 47.586, lng: -122.319 },
        latNode = document.getElementById('coordinates-lat'),
        lngNode = document.getElementById('coordinates-lng'),
        radiusValueNode = document.getElementById('radius-value'),
        radiusSuffixNode = document.getElementById('radius-suffix'),
        timeframeStartNode = document.getElementById('timeframe-start'),
        timeframeEndNode = document.getElementById('timeframe-end');

    timeframeStartNode.value = "2014-08-01";
    timeframeEndNode.value = "2014-08-15";

    var initialize = function() {
      L.mapbox.accessToken = "pk.eyJ1IjoiZG9ra28xMjMwIiwiYSI6IlM3TUN5RW8ifQ.wNT0Pp0zCtMR7phIRHg6Ug";

      map = L.mapbox.map("app-maparea", "dokko1230.j7ch6d77", {
        attributionControl: true
      });

      marker = L.marker(new L.LatLng(47.586, -122.319), {
          icon: L.mapbox.marker.icon({
              "marker-color": "ff8888"
          }),
          draggable: true
      });

      circle = L.circle([markerStart.lat, markerStart.lng], 1000);
      latNode.value = markerStart.lat;
      lngNode.value = markerStart.lng;

      marker.addTo(map);
      circle.addTo(map);

      map.attributionControl
        .addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');

      var keenMapData = L.layerGroup().addTo(map);

      marker.on('dragend', function(event) {
        // Move circle to marker
        var newCoords = event.target.getLatLng();
        circle.setLatLng(newCoords);
        latNode.value = newCoords.lat;
        lngNode.value = newCoords.lng;
      });

      document.getElementById('refresh').onclick = refresh;

      // Get query string
      if(window.location.hash.length !== 0) { //query exists
        rebuild(window.location.hash.substr(1).split('&'));
      } else {
        refresh();
      }
    };

    var rebuild = function(params) {
      var config = {};
      for(var item in params) {
        config[item] = params[item];
      }
      redraw(config);
    };

    var updateQuery = function(params) {
      var queryString = "";
      for(var key in params) {
        queryString += key + '=' + params[key];
      }
      window.location.hash = queryString;
    };

    var refresh = function() {
      var rangeInMeters, rangeInMiles,
          config,
          radiusValue = radiusValueNode.value || 1000,
          radiusSuffix = radiusSuffixNode.value || "km";


      // Behold, the one-liner :)
      rangeInMeters = radiusValue * (radiusSuffix === "mi") ? 1609.34 : 1000;
      /*switch (radiusSuffix) { // Base is in meters
      case 'Kilometers':
        console.log(radiusValue, radiusValueNode.value);
        rangeInMeters = radiusValue * 1000;
        break;
      case 'Miles':
        rangeInMeters = radiusValue * 1609.34;
        break;
      }*/

      // SET RANGE INDICATOR (Mapbox)
      circle.setRadius(rangeInMeters);

      // CONVERT TO MILES (API v3)
      rangeInMiles = rangeInMeters / 1609.34;

      config = {
        start: timeframeStartNode.value,
        end: timeframeEndNode.value,
        latitude: latNode.value,
        longitude: lngNode.value,
        radius: rangeInMiles
      };

      redraw(config);

      updateQuery(config);
    };

    // Dustin, halp!
    var redraw = function(config) {
      var options = config || {};

      var end = (options["end"]) ? new Date(Date.parse(options["end"])) : new Date();
      var start = (options["start"]) ? new Date(Date.parse(options["start"])) : new Date(end.getFullYear(), end.getMonth(), end.getDate()-14);


      var rad = (options["radius"]) ? parseFloat(options["radius"]) : false;
      var lat = (options["latitude"]) ? parseFloat(options["latitude"]) : false;
      var lng = (options["longitude"]) ? parseFloat(options["longitude"]) : false;

      var geoFilter = [];
      if (lat && lng && rad) {
        geoFilter.push({
          property_name : "keen.location.coordinates",
          operator : "within",
          property_value: {
            coordinates: [ parseFloat(options["longitude"]), parseFloat(options["latitude"]) ],
            max_distance_miles: parseFloat(options["radius"])
          }
        });
      };

      var baseParams = {
        timeframe: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        filters: geoFilter
      };

      // Make 3 queries
      var pageviews_timeline = new Keen.Query("median", {
        eventCollection: "user_action",
        interval: "daily",
        targetProperty: "bio_sensors.heart_rate",
        //groupBy: "", // Not supported for Geo Filters
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(pageviews_timeline, document.getElementById("chart-01"), {
        chartType: "areachart",
        title: null,
        height: 175,
        width: "auto",
        colors: null,
        chartOptions: {
          hAxis: { format: 'MMM dd', maxTextLines: 1 },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });

      var impressions_timeline = new Keen.Query("count", {
        eventCollection: "activations",
        interval: "daily",
        //groupBy: "", // Not supported for Geo Filters
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(impressions_timeline, document.getElementById("chart-02"), {
        chartType: "columnchart",
        title: false,
        height: 175,
        width: 250,
        chartOptions: {
          bar: { groupWidth: "85%" },
          hAxis: { format: 'MMM dd' },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });

      var impressions_timeline_by_country = new Keen.Query("count", {
        eventCollection: "purchases",
        interval: "daily",
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(impressions_timeline_by_country, document.getElementById("chart-03"), {
        chartType: "columnchart",
        title: false,
        height: 175,
        width: 250,
        chartOptions: {
          bar: { groupWidth: "85%" },
          hAxis: { format: 'MMM dd' },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });
    };

  initialize();
  })
})();
