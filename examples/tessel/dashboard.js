// var Keen = require('keen.io');
 
var client = new Keen({
    projectId: "53fd0676e861701e17000001",
    readKey: "e59871426c869471154eeebdf6e7feb02309f6d0d12574cd655fa8187d0dec5c16922b8a72364c3f192a5459e4debace4b70594fa8cd69e2af1f3b1c9d17d689677d20c806e7a690213122e8f022f496ee10c918013a07e246b3ae5247b66dc27167ee479f1d209c9f2aec115a5830a6"
});



Keen.ready(function(){


  // ----------------------------------------
  // Light Trigger Timeline
  // ----------------------------------------
  var light_timeline = new Keen.Query("count", {
    eventCollection: "light-trigger",
    interval: "daily",
    timeframe: "this_month"
  });
  client.draw(light_timeline, document.getElementById("chart-05"), {
    chartType: "linechart",
    title: false,
    height: 250,
    width: "auto"

  });

  // ----------------------------------------
  // Light Trigger Timeline
  // ----------------------------------------
  var sound_timeline = new Keen.Query("count", {
    eventCollection: "sound-trigger",
    interval: "daily",
    timeframe: "this_month"
  });
  client.draw(sound_timeline, document.getElementById("chart-06"), {
    chartType: "linechart",
    title: false,
    height: 250,
    width: "auto"

  });

  // ----------------------------------------
  // temp
  // ----------------------------------------

  var temperature = new Keen.Query("median", {
    eventCollection: "climate",
    targetProperty: "temp",
    timeframe: "today"
  });

  $("#chart-01").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':500,
    'fgColor': Keen.Visualization.defaults.colors[1]
    // height: 250,
    // width: '95%'
  });
  client.run(temperature, function(res){
    $("#chart-01").val(res.result).trigger('change');
  });

  // ----------------------------------------
  // humidity
  // ----------------------------------------

  var humidity = new Keen.Query("median", {
    eventCollection: "climate",
    targetProperty: "humidity",
    timeframe: "today"
  });

  $("#chart-02").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':500,
    'fgColor': Keen.Visualization.defaults.colors[0]
    // height: 250,
    // width: '95%'
  });
  client.run(humidity, function(res){
    $("#chart-02").val(res.result).trigger('change');
  });

  // ----------------------------------------
  // Light
  // ----------------------------------------

  var light = new Keen.Query("median", {
    eventCollection: "ambient",
    targetProperty: "light",
    timeframe: "today"
  });

  $("#chart-03").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':500,
    'fgColor': Keen.Visualization.defaults.colors[2]
    // height: 250,
    // width: '95%'
  });
  client.run(light, function(res){
    $("#chart-03").val(res.result).trigger('change');
  });

  // ----------------------------------------
  // Sound
  // ----------------------------------------

  var sound = new Keen.Query("median", {
    eventCollection: "ambient",
    targetProperty: "sound",
    timeframe: "today"
  });

  $("#chart-04").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':500,
    'fgColor': Keen.Visualization.defaults.colors[3]
    // height: 250,
    // width: '95%'
  });
  client.run(light, function(res){
    $("#chart-04").val(res.result).trigger('change');
  });


});