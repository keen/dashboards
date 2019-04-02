!(function (undefined) {

  let DEFAULTS,
    GEO,
    client,
    circle,
    marker,
    map,
    activeMapData,
    keenMapData;

  // DOM Elements
  let appWrapperNode,
    appMapAreaNode,
    latNode,
    lngNode,
    radiusValueNode,
    radiusUnitsNode,
    timeframeStartNode,
    timeframeEndNode,
    refreshButton;

  client = new KeenAnalysis({
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
    center: [DEFAULTS.lat, DEFAULTS.lng],
    radius: DEFAULTS.radius,
    units: DEFAULTS.units,
    zoom: DEFAULTS.zoom
  };

  Keen.ready(function () {

    // DOM is ready
    appWrapperNode = document.getElementById('app-wrapper');
    appMapAreaNode = document.getElementById('app-maparea');
    latNode = document.getElementById('coordinates-lat');
    lngNode = document.getElementById('coordinates-lng');
    radiusValueNode = document.getElementById('radius-value');
    radiusUnitsNode = document.getElementById('radius-suffix');
    timeframeStartNode = document.getElementById('timeframe-start');
    timeframeEndNode = document.getElementById('timeframe-end');
    refreshButton = document.getElementById('refresh');

    adjust();
    init();
  });

  function init() {
    const params = getParams();

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
    timeframeEndNode.value = DEFAULTS.timeframe['end'];

    // Create map instance
    L.mapbox.accessToken = 'pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg';
    map = L.mapbox.map('app-maparea', 'keen-io.kae20cg0', {
      attributionControl: true,
      center: GEO.center,
      zoom: GEO.zoom
    });
    map.on('dragend', updateQuery);
    map.on('zoomend', function (e) {
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
    marker.on('dragend', function (e) {
      const newCoords = e.target.getLatLng();
      const newLat = newCoords.lat.toPrecision(8);
      const newLng = newCoords.lng.toPrecision(8);
      circle.setLatLng({
        lat: newLat,
        lng: newLng
      });
      latNode.value = GEO.lat = newLat;
      lngNode.value = GEO.lng = newLng;
      refresh();
    });

    circle = L.circle([GEO.lat, GEO.lng], 1000);
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
    const params = Keen.utils.parseParams(document.location.search);
    return (selector) ? params[selector] : params;
  }

  function updateQuery() {
    let params, str;
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
    Keen.utils.each(params, function (value, key) {
      str += key + '=' + value + '&';
    });
    history.pushState(null, null, str);
  }

  function setGeoSelection() {
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

  function adjust() {
    appWrapperNode.style.height = window.innerHeight + 'px';
    appMapAreaNode.style.height = window.innerHeight + 'px';
  }

  // Keen.utils.each(queries, function(q){});

  function draw() {
    const options = {
      start: timeframeStartNode.value,
      end: timeframeEndNode.value,
      latitude: latNode.value,
      longitude: lngNode.value,
      radius: GEO.miles,
      zoom: GEO.zoom
    };

    const end = (options['end']) ? new Date(Date.parse(options['end'])) : new Date();
    const start = (options['start']) ? new Date(Date.parse(options['start'])) : new Date(end.getFullYear(), end.getMonth(), end.getDate() - 14);

    const rad = (options['radius']) ? parseFloat(options['radius']) : false;
    const lat = (options['latitude']) ? parseFloat(options['latitude']) : false;
    const lng = (options['longitude']) ? parseFloat(options['longitude']) : false;

    let geoFilter = [];
    if (lat && lng && rad) {
      geoFilter.push({
        property_name: 'keen.location.coordinates',
        operator: 'within',
        property_value: {
          coordinates: [parseFloat(options['longitude']), parseFloat(options['latitude'])],
          max_distance_miles: parseFloat(options['radius'])
        }
      });
    };

    const baseParams = {
      timeframe: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      filters: geoFilter
    };

    // Fetch events within geo target
    const scoped_events = client.query('select_unique', {
      event_collection: 'user_action',
      target_property: 'keen.location.coordinates',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });
    client.run(scoped_events, (err, res) => {
      activeMapData.clearLayers();
      Keen.utils.each(res.result, coord => {
        const em = L.marker(new L.LatLng(coord[1], coord[0]), {
          icon: L.mapbox.marker.icon({
            'marker-color': '#00bbde'
          })
        }).addTo(activeMapData);;
      });
    });



    // Sample queries
    // groupBy not supported for Geo Filters

    const hearts = client.query('median', {
      event_collection: 'user_action',
      interval: 'daily',
      target_property: 'bio_sensors.heart_rate',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });

    const daily_median_heartrate = new KeenDataviz({
      container: '#chart-01',
      title: 'Daily Median Heart Rate',
      type: 'area',
      colors: ['#fe6672'],
    })

    client
      .run(hearts)
      .then(res => {
        daily_median_heartrate
          .data(res)
          .render()
      });


    const activations = client.query('count', {
      event_collection: 'activations',
      interval: 'daily',
      target_property: 'bio_sensors.heart_rate',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });

    const daily_activations = new KeenDataviz({
      container: '#chart-02',
      title: 'Daily Activations',
      type: 'area',
      colors: ['#fe6672'],
    });

    client
      .run(activations)
      .then(res => {
        daily_activations
          .data(res)
          .render()
      });


    const purchases = client.query('sum', {
      event_collection: 'purchases',
      target_property: 'order_price',
      interval: 'daily',
      timeframe: baseParams.timeframe,
      filters: baseParams.filters
    });

    const daily_purchases = new KeenDataviz({
      container: '#chart-03',
      title: 'Daily Purchases',
      type: 'area',
      colors: ['#eeb058'],
    });

    client
      .run(purchases)
      .then(res => {
        daily_purchases
          .data(res)
          .render()
      });

  }

})();