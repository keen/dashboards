var client = new Keen({
  projectId: "53e552a336bf5a5dfb000000",
  readKey: "35c51bc9059710c707695f976c5ec7e2d1987c40ea13294aa76e019d1cc9539faa37e70867e5f6e2163ab384fb99e46cef0a9c805706cbe59d27d1c0b3b2f4eedadfc8c20b72623202d8e1fab5be26ed77a0830cffed3884b91c6ccde1952a3052918de980eaf9d0f760a43fe3529345"
});

Keen.ready(function(){

  // ----------------------------------------
  // Pageviews Area Chart
  // ----------------------------------------
  var latency = new Keen.Query("sum", {
    eventCollection: "latency",
    timeframe: "this_24_hours",
    targetProperty: "value",
    interval: "hourly"
  });
  client.draw(latency, document.getElementById("chart-01"), {
    chartType: "areachart",
    title: false,
    height: 109,
    width: "auto",
    chartOptions: {
      chartArea: {
        height: "85%",
        left: "5%",
        top: "5%",
        width: "80%"
      },
      isStacked: true
    }
  });

  var uptime = new Keen.Query("sum", {
    eventCollection: "uptime",
    timeframe: "this_24_hours",
    targetProperty: "value",
    interval: "hourly"
  });

  client.draw(uptime, document.getElementById("chart-02"), {
    chartType: "areachart",
    title: false,
    height: 109,
    width: "auto",
    chartOptions: {
      chartArea: {
        height: "85%",
        left: "5%",
        top: "5%",
        width: "80%"
      },
      isStacked: true
    }
  });

  var packets = new Keen.Query("sum", {
    eventCollection: "packets",
    timeframe: "this_24_hours",
    targetProperty: "value",
    interval: "hourly"
  });
  client.draw(packets, document.getElementById("chart-03"), {
    chartType: "areachart",
    title: false,
    height: 109,
    width: "auto",
    chartOptions: {
      chartArea: {
        height: "85%",
        left: "5%",
        top: "5%",
        width: "80%"
      },
      isStacked: true
    }
  });

  // client.draw(pageviews_timeline, document.getElementById("chart-04"), {
  //   chartType: "areachart",
  //   title: false,
  //   height: 109,
  //   width: "auto",
  //   chartOptions: {
  //     chartArea: {
  //       height: "85%",
  //       left: "5%",
  //       top: "5%",
  //       width: "80%"
  //     },
  //     isStacked: true
  //   }
  // });



});
