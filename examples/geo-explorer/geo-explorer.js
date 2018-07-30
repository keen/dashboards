!(function(undefined) {

  var DEFAULTS,
      GEO,
      client,
      circle,
      marker,
      map,
      activeMapData,
      keenMapData;

  // DOM Elements
  var appWrapperNode,
      appMapAreaNode,
      latNode,
      lngNode,
      radiusValueNode,
      radiusUnitsNode,
      timeframeStartNode,
      timeframeEndNode,
      refreshButton;

  client = new Keen({
    projectId: '53eab6e12481962467000000',
    readKey: 'd1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455'
  });

  DEFAULTS = {
    timeframe: {
      start: '2014-08-01',
      end: '2014-08-15'
    },
    lat: 37.77350,
    lng: -122.41104,
    radius: 10,
    units: 'km',
    zoom: 12
  };

  GEO = {
    meters: 0,
    miles: 0,
    lat: DEFAULTS.lat,
    lng: DEFAULTS.lng,
    center: [ DEFAULTS.lat, DEFAULTS.lng ],
    radius: DEFAULTS.radius,
    units: DEFAULTS.units,
    zoom: DEFAULTS.zoom
  };

  Keen.ready(function() {

    // DOM is ready
    appWrapperNode     = document.getElementById('app-wrapper');
    appMapAreaNode     = document.getElementById('app-maparea');
    latNode            = document.getElementById('coordinates-lat');
    lngNode            = document.getElementById('coordinates-lng');
    radiusValueNode    = document.getElementById('radius-value');
    radiusUnitsNode    = document.getElementById('radius-suffix');
    timeframeStartNode = document.getElementById('timeframe-start');
    timeframeEndNode   = document.getElementById('timeframe-end');
    refreshButton      = document.getElementById('refresh');

    adjust();
    init();
  });

  function init(){
    var params = getParams();

    // Get params
    if (params.center) {
      GEO.center = params.center.split(',');
    }
    if (params.latitude && params.longitude) {
      GEO.lat = parseFloat(params.latitude);
      GEO.lng = parseFloat(params.longitude);
    }
    if (params.units) {
      GEO.units = params.units;
      radiusUnitsNode.value = GEO.units;
    }
    if (params.meters) {
      GEO.meters = parseFloat(params.meters);
      if (GEO.units === 'km') radiusValueNode.value = parseInt(GEO.meters) / 1000;
    }
    if (params.miles) {
      GEO.miles = parseFloat(params.miles);
      if (GEO.units === 'mi') radiusValueNode.value = GEO.miles;
    }
    if (params.zoom) {
      GEO.zoom = parseFloat(params.zoom);
    }

    // Prefill input fields

    latNode.value = GEO.lat;
    lngNode.value = GEO.lng;
    timeframeStartNode.value = DEFAULTS.timeframe['start'];
    timeframeEndNode.value   = DEFAULTS.timeframe['end'];

    // Create map instance
    L.mapbox.accessToken = 'pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg';
    map = L.mapbox.map('app-maparea', 'keen-io.kae20cg0', {
      attributionControl: true,
      center: GEO.center,
      zoom: GEO.zoom
    });
    map.on('dragend', updateQuery);
    map.on('zoomend', function(e){
      GEO.zoom = e.target._zoom;
      updateQuery();
    });

    // Contains query result markers
    activeMapData = L.layerGroup().addTo(map);

    // Create primary marker
    marker = L.marker(new L.LatLng(GEO.lat, GEO.lng), {
      icon: L.mapbox.marker.icon({
        'marker-color': 'ff8888'
      }),
      draggable: true,
      zIndexOffset: 9999
    });
    marker.addTo(map);
    marker.on('dragend', function(e){
      var newCoords = e.target.getLatLng();
      var newLat = newCoords.lat.toPrecision(8);
      var newLng = newCoords.lng.toPrecision(8);
      circle.setLatLng({ lat: newLat, lng: newLng });
      latNode.value = GEO.lat = newLat;
      lngNode.value = GEO.lng = newLng;
      refresh();
    });

    circle = L.circle([ GEO.lat, GEO.lng ], 1000);
    circle.addTo(map);
    setGeoSelection();

    map.attributionControl.addAttribution('<a href=\'https://keen.io/\'>Custom Analytics by Keen IO</a>');
    keenMapData = L.layerGroup().addTo(map);

    // Listen for input changes
    radiusValueNode.onchange = setGeoSelection;
    radiusUnitsNode.onchange = setGeoSelection;

    // Listen for refresh events
    refreshButton.onclick = refresh;

    // Listen for resize events
    window.onresize = adjust;

    // Go!
    refresh();
  }

  function getParams(selector) {
    var params = Keen.utils.parseParams(document.location.search);
    return (selector) ? params[selector] : params;
  }

  function updateQuery() {
    var params, str;
    setGeoSelection();
    params = {
      start: timeframeStartNode.value,
      end: timeframeEndNode.value,
      latitude: latNode.value,
      longitude: lngNode.value,
      miles: GEO.miles,
      meters: GEO.meters,
      units: GEO.units,
      zoom: GEO.zoom,
      center: GEO.center
    };
    str = '?';
    Keen.utils.each(params, function(value, key){
      str += key + '=' + value + '&';
    });
    history.pushState(null, null, str);
  }

  function setGeoSelection(){
    GEO.radius = radiusValueNode.value || 10;
    GEO.units = radiusUnitsNode.value || 'km';
    GEO.meters = GEO.radius * ((GEO.units === 'mi') ? 1609.34 : 1000);
    GEO.miles = GEO.meters / 1609.34;
    GEO.center[0] = map.getCenter().lat;
    GEO.center[1] = map.getCenter().lng;
    GEO.lat = latNode.value;
    GEO.lng = lngNode.value;
    circle.setRadius(GEO.meters);
  }

  function refresh() {
    updateQuery();
    draw();
  }

  function adjust(){
    appWrapperNode.style.height = window.innerHeight + 'px';
    appMapAreaNode.style.height = window.innerHeight + 'px';
  }

  // Keen.utils.each(queries, function(q){});

  function draw(){
    var options = {
      start: timeframeStartNode.value,
      end: timeframeEndNode.value,
      latitude: latNode.value,
      longitude: lngNode.value,
      radius: GEO.miles,
      zoom: GEO.zoom
    };

    var end = (options['end']) ? new Date(Date.parse(options['end'])) : new Date();
    var start = (options['start']) ? new Date(Date.parse(options['start'])) : new Date(end.getFullYear(), end.getMonth(), end.getDate()-14);

    var rad = (options['radius']) ? parseFloat(options['radius']) : false;
    var lat = (options['latitude']) ? parseFloat(options['latitude']) : false;
    var lng = (options['longitude']) ? parseFloat(options['longitude']) : false;

    var geoFilter = [];
    if (lat && lng && rad) {
      geoFilter.push({
        property_name : 'keen.location.coordinates',
        operator : 'within',
        property_value: {
          coordinates: [ parseFloat(options['longitude']), parseFloat(options['latitude']) ],
          max_distance_miles: parseFloat(options['radius'])
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
    var scoped_events = new Keen.Query('select_unique', {
      event_collection: 'user_action',
      target_property: 'keen.location.coordinates',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });
    client.run(scoped_events, function(err, res){
      activeMapData.clearLayers();
      Keen.utils.each(res.result, function(coord, index){
        var em = L.marker(new L.LatLng(coord[1], coord[0]), {
          icon: L.mapbox.marker.icon({
            'marker-color': '#00bbde'
          })
        }).addTo(activeMapData);;
      });
    });



    // Sample queries
    // groupBy not supported for Geo Filters

    var hearts = new Keen.Query('median', {
      event_collection: 'user_action',
      interval: 'daily',
      target_property: 'bio_sensors.heart_rate',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });
    var daily_median_heartrate = new Keen.Dataviz()
      .el('#chart-01')
      .height(300)
      .colors(['#fe6672'])
      .title('Daily Median Heart Rate')
      .type('area')
      .prepare();

    client.run(hearts, function(err, res) {
      daily_median_heartrate
        .data(res)
        .render();
    });



    var activations = new Keen.Query('count', {
      event_collection: 'activations',
      interval: 'daily',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });
    var daily_activations = new Keen.Dataviz()
      .el('#chart-02')
      .height(300)
      .colors(['#5a9eed'])
      .title('Daily Activations')
      .type('area')
      .prepare();
    client.run(activations, function(err, res) {
      daily_activations
        .data(res)
        .render();
    });



    var purchases = new Keen.Query('sum', {
      event_collection: 'purchases',
      target_property: 'order_price',
      interval: 'daily',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });

    var daily_purchases = new Keen.Dataviz()
      .el('#chart-03')
      .height(300)
      .colors(['#eeb058'])
      .title('Daily Purchases')
      .type('area')
      .prepare();

    client.run(purchases, function(err, res) {
      daily_purchases
        .data(res)
        .render();
    });

  }

})();
