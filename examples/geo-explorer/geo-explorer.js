!(function(undefined) {

  // Maintain map dimensions
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

  var DEFAULTS = {
    coordinates: {
      lat: 37.77350,
      lng: -122.41104
    },
    zoom: 12
  };

  var find = function(hash, selector) {
    var hashes = location.hash.substr(1).split("&");
    return buildParamsMap(hashes)[selector];
  };

  var buildParamsMap = function(hashes) {
    var map = {};
    for(var i = 0; i < hashes.length; i++) {
      var hash = hashes[i].split("=");
      map[hash[0]] = hash[1];
    } 
    return map;
  };

  Keen.ready(function() {
    var initialize,
        circle,
        marker,
        map,
        markerStart = DEFAULTS.coordinates,
        latNode = document.getElementById('coordinates-lat'),
        lngNode = document.getElementById('coordinates-lng'),
        radiusValueNode = document.getElementById('radius-value'),
        radiusUnitsNode = document.getElementById('radius-suffix'),
        timeframeStartNode = document.getElementById('timeframe-start'),
        timeframeEndNode = document.getElementById('timeframe-end');

    timeframeStartNode.value = "2014-08-01";
    timeframeEndNode.value = "2014-08-15";

    // Listen for input changes
    radiusValueNode.onchange = updateRadiusIndicator;
    radiusUnitsNode.onchange = updateRadiusIndicator;
    function updateRadiusIndicator(e){
      var rangeInMeters = radiusValueNode.value / 1000,
          radiusValue = radiusValueNode.value || 10,
          radiusUnits = radiusUnitsNode.value || "km";
      rangeInMeters = radiusValue * ((radiusUnits === "mi") ? 1609.34 : 1000);
      circle.setRadius(rangeInMeters);
    };

    var activeMapData;

    var initialize = function() {
      var hasQuery = window.location.hash.length !== 0
      L.mapbox.accessToken = "pk.eyJ1IjoiZG9ra28xMjMwIiwiYSI6IlM3TUN5RW8ifQ.wNT0Pp0zCtMR7phIRHg6Ug";
      map = L.mapbox.map("app-maparea", "dokko1230.j7ch6d77", {
        attributionControl: true,
        center: [markerStart.lat, markerStart.lng],
        zoom: DEFAULTS.zoom
      });

      // For query result markers
      activeMapData = L.layerGroup().addTo(map);
      markerStart.lat = hasQuery ? find(location.hash, 'latitude') : markerStart.lat;
      markerStart.lng = hasQuery ? find(location.hash, 'longitude') : markerStart.lng;

      marker = L.marker(new L.LatLng(markerStart.lat, markerStart.lng), {
        icon: L.mapbox.marker.icon({
          "marker-color": "ff8888"
        }),
        draggable: true,
        zIndexOffset: 9999
      });
      circle = L.circle([markerStart.lat, markerStart.lng], 1000);
      latNode.value = markerStart.lat;
      lngNode.value = markerStart.lng;

      marker.addTo(map);
      circle.addTo(map);

      updateRadiusIndicator();

      map.attributionControl.addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');

      var keenMapData = L.layerGroup().addTo(map);

      marker.on('dragend', function(event) {
        // Move circle to marker
        var newCoords = event.target.getLatLng();
        var newLat = newCoords.lat.toPrecision(8);
        var newLng = newCoords.lng.toPrecision(8);

        circle.setLatLng({ lat: newLat, lng: newLng });
        latNode.value = newLat;
        lngNode.value = newLng;

        var rangeInMeters, rangeInMiles,
            config,
            radiusValue = radiusValueNode.value || 10,
            radiusUnits = radiusUnitsNode.value || "km";

        rangeInMeters = radiusValue * ((radiusUnits === "mi") ? 1609.34 : 1000);

        // CONVERT TO MILES (API v3)
        rangeInMiles = rangeInMeters / 1609.34;

        var config = {
          start: timeframeStartNode.value,
          end: timeframeEndNode.value,
          latitude: latNode.value,
          longitude: lngNode.value,
          radius: rangeInMiles
        };

        updateQuery(config);
        redraw(config);
      });

      document.getElementById('refresh').onclick = refresh;

      // Get query string
      if(hasQuery) { //query exists
        rebuild(window.location.hash.substr(1).split('&'));
      } else {
        refresh();
      }
    };

    var rebuild = function(params) {
      redraw(buildParamsMap(params));
    };

    var updateQuery = function(params) {
      var queryString = "";
      for(var key in params) {
        queryString += key + '=' + params[key] + "&";
      }
      window.location.hash = queryString;
    };

    var refresh = function() {
      var rangeInMeters, rangeInMiles,
          config,
          radiusValue = radiusValueNode.value || 10,
          radiusUnits = radiusUnitsNode.value || "km";

      // Behold, the one-liner :) 
      // 
      // 
      // 
      // 
      // 
      // 
      // GASPS :O
      rangeInMeters = radiusValue * ((radiusUnits === "mi") ? 1609.34 : 1000);

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

    function redraw(config){
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

      // Fetch events within geo target
      var scoped_events = new Keen.Query("select_unique", {
        eventCollection: "user_action",
        targetProperty: "keen.location.coordinates",
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.run(scoped_events, function(res){
        console.log("events", res);
        activeMapData.clearLayers();

        Keen.utils.each(res.result, function(coord, index){
          var em = L.marker(new L.LatLng(coord[1], coord[0]), {
            icon: L.mapbox.marker.icon({
              "marker-color": Keen.Visualization.defaults.colors[0]
            })
          }).addTo(activeMapData);;
        });
      });

      // Sample queries
      // groupBy not supported for Geo Filters
      var hearts = new Keen.Query("median", {
        eventCollection: "user_action",
        interval: "daily",
        targetProperty: "bio_sensors.heart_rate",
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(hearts, document.getElementById("chart-01"), {
        chartType: "areachart",
        colors: [Keen.Visualization.defaults.colors[1]],
        title: " ",
        height: 175,
        width: "auto",
        chartOptions: {
          chartArea: { height: "80%", top: "5%", width: "80%" },
          hAxis: { format: 'MMM dd', maxTextLines: 1 },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });

      var activations = new Keen.Query("count", {
        eventCollection: "activations",
        interval: "daily",
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(activations, document.getElementById("chart-02"), {
        chartType: "areachart",
        colors: [Keen.Visualization.defaults.colors[2]],
        title: " ",
        height: 175,
        width: "auto",
        chartOptions: {
          bar: { groupWidth: "85%" },
          chartArea: { height: "80%", top: "5%", width: "80%" },
          hAxis: { format: 'MMM dd' },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });

      var purchases = new Keen.Query("sum", {
        eventCollection: "purchases",
        targetProperty: "order_price",
        interval: "daily",
        timeframe: baseParams.timeframe,
        filters: baseParams.filters
      });
      client.draw(purchases, document.getElementById("chart-03"), {
        chartType: "columnchart",
        title: false,
        height: 175,
        width: "auto",
        chartOptions: {
          bar: { groupWidth: "85%" },
          chartArea: { height: "80%", top: "5%", width: "80%" },
          hAxis: { format: 'MMM dd' },
          legend: { position: "none" },
          tooltip: { trigger: 'none' }
        }
      });
    };

  initialize();
  })

  
})();
