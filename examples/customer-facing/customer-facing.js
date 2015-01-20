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
  // Impressions timeline
  // ----------------------------------------
  var impressions_timeline = new Keen.Query("count", {
    eventCollection: "impressions",
    interval: "hourly",
    timeframe: {
      start: "2014-05-04T00:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.draw(impressions_timeline, document.getElementById("chart-01"), {
    chartType: "areachart",
    title: false,
    height: 133,
    width: "auto",
    chartOptions: {
      chartArea: {
        left: "0%",
        top: "0%",
        height: "75%",
        bottom: "0%",
        width: "100%"
      },
      backgroundColor: 'transparent',
      bar: {
        groupWidth: "85%"
      },
      isStacked: true
    }
  });

  // ----------------------------------------
  // Heart Rate
  // ----------------------------------------

  var heart_rate = new Keen.Query("median", {
    eventCollection: "user_action",
    targetProperty: "bio_sensors.heart_rate",
    filters: [
      {
        "property_name" : "user.id",
        "operator" : "eq",
        "property_value" : "02846154-1520-5F67-A892-6C0F21408069"
      }]
  });

  $(".heart").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':50,
    'max':80,
    'fgColor': Keen.Dataviz.defaults.colors[0],
    'width': '100%'
  });

  geoProject.run(heart_rate, function(err, res){
    $(".heart").val(res.result).trigger('change');
  });


  // ----------------------------------------
  // Temperature
  // ----------------------------------------
  var temperature = new Keen.Query("median", {
    eventCollection: "user_action",
    targetProperty: "enviro_sensors.temp",
    filters: [
      {
        "property_name" : "user.id",
        "operator" : "eq",
        "property_value" : "02846154-1520-5F67-A892-6C0F21408069"
      }]
  });

  $(".temp").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':90,
    'max':105,
    'fgColor': Keen.Dataviz.defaults.colors[2],
    'width': '100%'
  });
  /* Demo sample */
  geoProject.run(temperature, function(err, res){
    $(".temp").val(98).trigger('change');
  });


  // ----------------------------------------
  // Battery
  // ----------------------------------------

  var battery = new Keen.Query("median", {
    eventCollection: "user_action",
    targetProperty: "battery_level",
    filters: [
      {
        "property_name" : "user.id",
        "operator" : "eq",
        "property_value" : "02846154-1520-5F67-A892-6C0F21408069"
      }]
  });

  $(".battery").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'fgColor': Keen.Dataviz.defaults.colors[1],
    'width': '100%'
  });

  geoProject.run(battery, function(err, res){
    $(".battery").val((res.result)*100).trigger('change');
  });


});
