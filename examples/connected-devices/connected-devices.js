var client = new Keen({
  projectId: "5368fa5436bf5a5623000000",
  readKey: "3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056"
});

var geoProject = new Keen({
  projectId: "53eab6e12481962467000000",
  readKey: "d1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455"
});

Keen.ready(function(){


  // ----------------------------------------
  // New Users Timeline
  // ----------------------------------------
  var new_users = new Keen.Query("count", {
    eventCollection: "activations",
    interval: "monthly",
    timeframe: "this_year"
  });
  geoProject.draw(new_users, document.getElementById("chart-01"), {
    chartType: "areachart",
    title: "Monthly Visits",
    height: 300,
    width: "auto",
    chartOptions: {
      legend: { position: "none" },
      chartArea: {
        height: "85%",
        left: "5%",
        width: "90%"
      },
      hAxis: { format: 'MMM', maxTextLines: 1 }
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
    'fgColor': Keen.Visualization.defaults.colors[0],
    //height: 230,
    width: '100%'
  });
  geoProject.run(users, function(res){
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
    'fgColor': Keen.Visualization.defaults.colors[1],
    //height: 230,
    width: '100%'
  });
  geoProject.run(errors, function(res){
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
  new Keen.Visualization(sampleFunnel, document.getElementById("chart-05"), {
    library: "google",
    chartType: "barchart",
    height: 340,
    title: null,
    colors: [Keen.Visualization.defaults.colors[5]],
    // Hidden feature: Pass in a list of new labels :)
    labelMapping: [ "Purchased Device", "Activated Device", "First Session", "Second Session", "Invited Friend" ],
    chartOptions: {
      chartArea: { height: "85%", left: "20%", top: "5%" },
      legend: { position: "none" }
    }
  });


  // ----------------------------------------
  // Mapbox - Active Users
  // ----------------------------------------
  L.mapbox.accessToken = 'pk.eyJ1Ijoicml0Y2hpZWxlZWFubiIsImEiOiJsd3VLdFl3In0.lwvdUU2VGB9VGDw7ulA4jA';
  var map = L.mapbox.map('map', 'ritchieleeann.j7bc1dpl', {
    attributionControl: true,
    zoomControl: false
  });
  map.setView([37.61, -122.357], 9);
  map.attributionControl.addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');

  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  if (map.tap) map.tap.disable();

  var keenMapData = L.layerGroup().addTo(map);

  var users_active = new Keen.Query("count", {
    eventCollection: "users_active",
    interval: "hourly",
    groupBy: "user.device_info.browser.family",
    timeframe: {
      start: "2014-05-04T00:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.run(users_active, function(res){
    //console.log(res);
  });


});
