// var Keen = require('keen.io');
 
var client = new Keen({
    projectId: "542b084ce8759666375da5e5",
    readKey: "f7069f777acb01ea3883696c1cbaca038f37a5615edbaf1535b1a5d28563afafa1d1c85a0807650dc8c2a971f4f28d5b54139277c41c31d700715ff92cb6caad00af478d2426286620d82af20ea055a2673678b571858fcb03f3f836d95995255f48968266508dc1963bfd4c484698fa"
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

  var temperature = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "temp",
    timeframe: "today"
  });

  $("#chart-01").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':120,
    'fgColor': Keen.Visualization.defaults.colors[1]
    // height: 250,
    // width: '95%'
  });
  client.run(temperature, function(res){
    $("#chart-01").val(res.result).trigger('change');
    console.log('temp '+res.result);
  });

  // ----------------------------------------
  // humidity
  // ----------------------------------------

  var humidity = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "humidity",
    timeframe: "today"
  });

  $("#chart-02").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':100,
    'fgColor': Keen.Visualization.defaults.colors[0]
    // height: 250,
    // width: '95%'
  });
  client.run(humidity, function(res){
    $("#chart-02").val(res.result).trigger('change');
    console.log('humidity '+res.result);
  });

  // ----------------------------------------
  // Light
  // ----------------------------------------

  var light = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "light",
    timeframe: "today"
  });

  $("#chart-03").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'step':0.01,
    'min':0,
    'max':1,
    'fgColor': Keen.Visualization.defaults.colors[2]
    // height: 250,
    // width: '95%'
  });
  client.run(light, function(res){
    $("#chart-03").val(res.result).trigger('change');
    console.log('light '+res.result);
  });

  // ----------------------------------------
  // Sound
  // ----------------------------------------

  var sound = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "sound",
    timeframe: "today"
  });

  $("#chart-04").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'step':0.01,
    'min':0,
    'max':1,
    'fgColor': Keen.Visualization.defaults.colors[3]
    // height: 250,
    // width: '95%'
  });
  client.run(sound, function(res){
    $("#chart-04").val(res.result).trigger('change');
    console.log('sound '+res.result);
  });


});