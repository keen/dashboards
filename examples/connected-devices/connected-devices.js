var client = new Keen({
  projectId: "5337e28273f4bb4499000000",
  readKey: "8827959317a6a01257bbadf16c12eff4bc61a170863ca1dadf9b3718f56bece1ced94552c6f6fcda073de70bf860c622ed5937fcca82d57cff93b432803faed4108d2bca310ca9922d5ef6ea9381267a5bd6fd35895caec69a7e414349257ef43a29ebb764677040d4a80853e11b8a3f"
});

var geoProject = new Keen({
  projectId: "53eab6e12481962467000000",
  readKey: "d1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455"
});

Keen.ready(function(){

  // ----------------------------------------
  // Visitors Timeline
  // ----------------------------------------
  var new_users = new Keen.Query("count", {
    eventCollection: "activations",
    interval: "monthly",
    timeframe: "this_year"
  });
  geoProject.draw(new_users, document.getElementById("visitors"), {
    chartType: "areachart",
    title: "Monthly Visits",
    height: 300,
    width: 490,
    chartOptions: {
      legend: { position: "none" },
      chartArea: {
        height: "78%",
        top: "15%",
        left: "8%",
        width: "85%"
      },
      hAxis: { format: 'MMM', maxTextLines: 1 }
    }
  });

  // ----------------------------------------
  // Visitors by Browser Timeline
  // ----------------------------------------
  var browser = new Keen.Query("count", {
    eventCollection: "activations",
    timeframe: "this_year",
    interval: "monthly",
    groupBy: "device_model_name"
  });
  geoProject.draw(browser, document.getElementById("browser"), {
    title: "Visits by Browser",
    height: 300,
    width: 475,
    chartOptions: {
      legend: { position: "none" },
      chartArea: {
        height: "78%",
        top: "15%",
        left: "10%",
        width: "100%"
      }
    }
  });

  // ----------------------------------------
  // Visitors by State
  // ----------------------------------------
  var state = new Keen.Query("count", {
    eventCollection: "visit",
    groupBy: "visitor.geo.province"
  });
  client.draw(state, document.getElementById("geography"), {
    chartType: "columnchart",
    title: "Visits by State",
    height: 300,
    width: 475,
    chartOptions: {
      legend: { position: "none" },
      chartArea: {
        height: "78%",
        top: "15%",
        left: "12%",
        width: "100%"
      }
    },
    labelMapping: {
      "New Jersey" : "NJ",
      "Virginia" : "VA",
      "California": "CA",
      "Washington": "WA",
      "Utah": "UT",
      "Oregon": "OR",
      "null": "Other"
    }
  });


  // ----------------------------------------
  // Users
  // ----------------------------------------

  var users = new Keen.Query("count_unique", {
    eventCollection: "activations",
    targetProperty: "user.id"
  });

  $(".users").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':500,
    'fgColor': Keen.Dataviz.defaults.colors[0],
    height: 290,
    width: '95%'
  });
  var geoUsers = geoProject.run(users, function(err, res){
    $(".users").val(res.result).trigger('change');
  });


  // ----------------------------------------
  // Errors Detected
  // ----------------------------------------


  var errors = new Keen.Query("count", {
    eventCollection: "user_action",
    filters: [{"property_name":"error_detected","operator":"eq","property_value":true}]
  });

  $(".errors").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':100,
    'fgColor': Keen.Dataviz.defaults.colors[1],
    height: 290,
    width: '95%'
  });
  geoProject.run(errors, function(err, res){
    $(".errors").val(res.result).trigger('change');
  });


  // ----------------------------------------
  // Funnel
  // ----------------------------------------
  var funnel = new Keen.Query("funnel", {
    steps: [
      {
         event_collection: "purchases",
         actor_property: "user.id"
      },
      {
        event_collection: "activations",
        actor_property: "user.id"
      },
      {
        event_collection: "status_update",
        actor_property: "user.id"
      },
      {
        event_collection: "user_action",
        actor_property: "user.id",
        filters: [] // where property "total_sessions" == 2
      },
      {
        event_collection: "user_action",
        actor_property: "user.id",
        filters: [] // where property "action" equals "invited friend"
      }
    ]
  });

  /*  This funnel is built from mock data */
  var sampleFunnel = { result: [ 3250, 3000, 2432, 1504, 321 ], steps: funnel.params.steps };

  new Keen.Dataviz()
    .el(document.getElementById("chart-05"))
    .parseRawData(sampleFunnel)
    .chartType('barchart')
    .chartOptions({
      chartArea: { height: "85%", left: "20%", top: "5%" },
      legend: { position: "none" }
    })
    .colors([Keen.Dataviz.defaults.colors[5]])
    .height(340)
    .labels(["Purchased Device", "Activated Device", "First Session", "Second Session", "Invited Friend"])
    .title(null)
    .render();

  // ----------------------------------------
  // Mapbox - Active Users
  // ----------------------------------------
  var tframe = "previous_7_days";

  var DEFAULTS = {
    coordinates: {
      lat: 37.77350,
      lng: -122.41104
    },
    zoom: 11
  };

  var initialize,
      map,
      markerStart = DEFAULTS.coordinates;

  var activeMapData,
      heat;
      
  function setActiveButton(button) {
    var classButtonNormal = "btn btn-default";
    var classButtonSelected = "btn btn-primary";

    switch (button) {
    default:
    case "7days":
      document.getElementById("7days").className = classButtonSelected;
      document.getElementById("14days").className = classButtonNormal;
      document.getElementById("28days").className = classButtonNormal;
      break;
    case "14days":
      document.getElementById("7days").className = classButtonNormal;
      document.getElementById("14days").className = classButtonSelected;
      document.getElementById("28days").className = classButtonNormal;
      break;
    case "28days":
      document.getElementById("7days").className = classButtonNormal;
      document.getElementById("14days").className = classButtonNormal;
      document.getElementById("28days").className = classButtonSelected;
      break;
    }
  }

  initialize = function() {
    setActiveButton("7days");

    L.mapbox.accessToken = "pk.eyJ1Ijoia2Vlbi1pbyIsImEiOiIza0xnNXBZIn0.PgzKlxBmYkOq6jBGErpqOg";
    map = L.mapbox.map("map", "keen-io.kae20cg0", {
      attributionControl: true,
      center: [markerStart.lat, markerStart.lng],
      zoom: DEFAULTS.zoom
    });

    heat = L.heatLayer([], { maxZoom: 14 });

    activeMapData = L.layerGroup().addTo(map);

    map.attributionControl.addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');

    var geoFilter = [];
    geoFilter.push({
      property_name : "keen.location.coordinates",
      operator : "within",
      property_value: {
        coordinates: [ -122.41104, 37.77350 ],
        max_distance_miles: 10
      }
    });

    var scoped_events = new Keen.Query("select_unique", {
      eventCollection: "user_action",
      targetProperty: "keen.location.coordinates",
      timeframe: tframe,
      filters: geoFilter
    });
    var result = geoProject.run(scoped_events, function(err, res){
      console.log("events", res);
      activeMapData.clearLayers();

      Keen.utils.each(res.result, function(coord, index){
        var em = L.marker(new L.LatLng(coord[1], coord[0]), {
          icon: L.mapbox.marker.icon()
        }).addTo(activeMapData);
      });

      activeMapData.eachLayer(function(l) {
          heat.addTo(map).addLatLng(l.getLatLng());
      });
      activeMapData.clearLayers();
    });


    var newgeoFilter = [];
    function resize(geo){

      geo = [];

      heat.setLatLngs([]);

      var center = map.getCenter();
      var zoom = map.getZoom();

      z = zoom-1;
      if (zoom === 0){
        radius = false;
      }
      else {
        radius = 10000/Math.pow(2,z);
      }
      console.log(center, radius);



      geo.push({
        property_name : "keen.location.coordinates",
        operator : "within",
        property_value: {
          coordinates: [ center.lng, center.lat ],
          max_distance_miles: radius
        }

      });
      return geo;
    }


    map.on('zoomend', function(e) {
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({ filters: newgeoFilter });
      result.refresh();
    });
    map.on('dragend', function(e) {
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({ filters: newgeoFilter });
      result.refresh();
    });



    document.getElementById("14days").addEventListener("click", function() {
      setActiveButton("14days");
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({ filters: newgeoFilter,
                          timeframe: "previous_14_days" });
      result.refresh();
    });

    document.getElementById("28days").addEventListener("click", function() {
      setActiveButton("28days");
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({ filters: newgeoFilter,
                          timeframe: "previous_28_days" });
      result.refresh();
    });

    document.getElementById("7days").addEventListener("click", function() {
      setActiveButton("7days");
      newgeoFilter = resize(newgeoFilter);
      scoped_events.set({ filters: newgeoFilter,
                          timeframe: "previous_7_days" });
      result.refresh();
    });

  };




initialize();
});
