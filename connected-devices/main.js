var client = new Keen({
  projectId: "5368fa5436bf5a5623000000",
  readKey: "3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056"
});

Keen.ready(function(){




  // ----------------------------------------
  // Impressions timeline (device)
  // ----------------------------------------
  var impressions_timeline_by_device = new Keen.Query("count", {
    eventCollection: "impressions",
    groupBy: "user.device_info.device.family",
    interval: "daily",
    timeframe: "this_month"
  });
  client.draw(impressions_timeline_by_device, document.getElementById("chart-01"), {
    chartType: "columnchart",
    title: false,
    height: 250,
    width: "auto",
    chartOptions: {
      chartArea: {
        height: "75%",
        left: "10%",
        top: "5%",
        width: "60%"
      },
      bar: {
        groupWidth: "85%"
      },
      isStacked: true
    }
  });

  // ----------------------------------------
  // Users
  // ----------------------------------------

  var users = new Keen.Query("count", {
    eventCollection: "Users"
  });
  client.draw(users, document.getElementById("chart-02"), {
    width: "auto",
  });


  // ----------------------------------------
  // Awake
  // ----------------------------------------
  var awake = new Keen.Query("count", {
    eventCollection: "Awake Now",
    timefame: "this_hour"
  });
  client.draw(awake, document.getElementById("chart-03"), {
    width: "auto",
  });

  // ----------------------------------------
  // Asleep
  // ----------------------------------------

  var asleep = new Keen.Query("count", {
    eventCollection: "Asleep Now",
    timefame: "this_hour"
  });
  client.draw(asleep, document.getElementById("chart-04"), {
    width: "auto",
  });

});