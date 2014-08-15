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

  geoProject.run(heart_rate, function(res){
    $(".heart").val(res.result).trigger('change');  
    var myColor = "#f35757";
    var heart = $(".heart");
    if (heart.val() < 120) {
      myColor = "#49c5b1";
    }
    if (heart.val() < 80) {
      myColor = "#00afd7"
    }
    $(".heart").knob({
      'angleArc':250,
      'angleOffset':-125,
      'readOnly':true,
      'min':40,
      'max':180,
      'fgColor': myColor,
      'width':250,
      'draw': function (){
        $(this.i).val(this.cv + 'bpm').css('font-size', '40px')
      }
    });
  });

//red = #f35757
//light red? = #f9845b

//orange = #f0ad4e

//green = #49c5b1
//light green = #aacc85

//blue = #2a99d1
//light blue = #00afd7

//purple = #8383c6
//light purple = #ba7fab


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

  geoProject.run(temperature, function(res){
    $(".temp").val(res.result).trigger('change');
    var myColor = "#f35757";
    var temp = $(".temp");
    if (temp.val() < 90) {
      myColor = "#f9845b";
    }
    if (temp.val() < 75) {
      myColor = "#f0ad4e"
    }
    if (temp.val() < 60) {
      myColor = "#49c5b1"
    }
    if (temp.val() < 45) {
      myColor = "#00afd7"
    }
       
    $(".temp").knob({
      'angleArc':250,
      'angleOffset':-125,
      'readOnly':true,
      'min':0,
      'max':120,
      'fgColor': myColor,
      'width':250,
      'draw': function (){
        $(this.i).val(this.cv + '\u00B0').css('font-size', '40px')
      }
    });
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

  geoProject.run(battery, function(res){
    $(".battery").val((res.result)*100).trigger('change');
    var myColor = "#49c5b1";
    var battery = $(".battery");
    if (battery.val() < 66) {
      myColor = "#f0ad4e";
    }
    if (battery.val() < 33) {
      myColor = "#f35757"
    }
    console.log(battery.val());
    $(".battery").knob({
      'angleArc':250,
      'angleOffset':-125,
      'readOnly':true,
      'fgColor': myColor,
      'width':250,
      'draw': function (){
        $(this.i).val(this.cv + '%').css('font-size', '40px')
      }
    });
  });


});
