
var client = new Keen({
    projectId: "542b084ce8759666375da5e5",
    readKey: "f7069f777acb01ea3883696c1cbaca038f37a5615edbaf1535b1a5d28563afafa1d1c85a0807650dc8c2a971f4f28d5b54139277c41c31d700715ff92cb6caad00af478d2426286620d82af20ea055a2673678b571858fcb03f3f836d95995255f48968266508dc1963bfd4c484698fa"
});


Keen.ready(function(){


  // ----------------------------------------
  // Light Trigger Timeline
  // ----------------------------------------
  var light_timeline = new Keen.Query("count_unique", {
    eventCollection: "climate",
    targetProperty: "light-trigger",
    interval: "hourly",
    timeframe: {
      start: "2014-10-06T07:00:00.000",
      end: "2014-10-06T19:00:00.000"
    }
    // timeframe: "today"
  });

  client.draw(light_timeline, document.getElementById("chart-05"), {
    chartType: "linechart",
    title: " ",
    height: 250,
    width: "auto"
  });

  // ----------------------------------------
  // Sound Trigger Timeline
  // ----------------------------------------
  var sound_timeline = new Keen.Query("count_unique", {
    eventCollection: "climate",
    targetProperty: "sound-trigger",
    interval: "hourly",
    timeframe: {
      start: "2014-10-06T07:00:00.000",
      end: "2014-10-06T19:00:00.000"
    }
    // timeframe: "today"
  });

  client.draw(sound_timeline, document.getElementById("chart-06"), {
    chartType: "linechart",
    title: " ",
    height: 250,
    width: "auto"
  });

  // ----------------------------------------
  // temp
  // ----------------------------------------

  var temperature = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "temp",
    timeframe: {
      start: "2014-10-06T00:00:00.000",
      end: "2014-10-07T00:00:00.000"
    }
    // timeframe: "today"
  });

  $("#chart-01").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':120,
    'fgColor': Keen.Dataviz.defaults.colors[1]
  });

  client.run(temperature, function(err, res){
    $("#chart-01").val(res.result).trigger('change');
  });

  // ----------------------------------------
  // humidity
  // ----------------------------------------

  var humidity = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "humidity",
    timeframe: {
      start: "2014-10-06T00:00:00.000",
      end: "2014-10-07T00:00:00.000"
    }
    // timeframe: "today"
  });

  $("#chart-02").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'min':0,
    'max':50,
    'fgColor': Keen.Dataviz.defaults.colors[0]
  });

  client.run(humidity, function(err, res){
    $("#chart-02").val(res.result).trigger('change');
  });

  // ----------------------------------------
  // Light
  // ----------------------------------------

  var light = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "light",
    timeframe: {
      start: "2014-10-06T00:00:00.000",
      end: "2014-10-07T00:00:00.000"
    }
    // timeframe: "today"
  });

  $("#chart-03").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'step':0.01,
    'min':0,
    'max':50,
    'fgColor': Keen.Dataviz.defaults.colors[2]
  });

  client.run(light, function(err, res){
    $("#chart-03").val(res.result*100).trigger('change');
  });

  // ----------------------------------------
  // Sound
  // ----------------------------------------

  var sound = new Keen.Query("average", {
    eventCollection: "climate",
    targetProperty: "sound",
    timeframe: {
      start: "2014-10-06T00:00:00.000",
      end: "2014-10-07T00:00:00.000"
    }
    // timeframe: "today"
  });

  $("#chart-04").knob({
    'angleArc':250,
    'angleOffset':-125,
    'readOnly':true,
    'step':0.01,
    'min':0,
    'max':100,
    'fgColor': Keen.Dataviz.defaults.colors[3]
  });

  client.run(sound, function(err, res){
    $("#chart-04").val(res.result*100).trigger('change');
  });


});
