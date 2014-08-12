var client = new Keen({
  projectId: "5368fa5436bf5a5623000000",
  readKey: "3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056"
});

Keen.ready(function(){




  // ----------------------------------------
  // New Users Timeline
  // ----------------------------------------
  var new_users = new Keen.Query("count", {
    eventCollection: "new_users",
    interval: "monthly",
    timeframe: "this_year"
  });
  client.draw(new_users, document.getElementById("chart-01"), {
    chartType: "columnchart",
    title: false,
    height: 250,
    width: "auto",
    chartOptions: {
      legend: { position: "none" },
      chartArea: {
        height: "75%",
        left: "5%",
        top: "5%",
        width: "90%"
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
    eventCollection: "users"
  });
  client.draw(users, document.getElementById("chart-02"), {
    title: "Users",
    width: "auto",
  });


  // ----------------------------------------
  // Awake
  // ----------------------------------------
  var awake = new Keen.Query("count", {
    eventCollection: "awake",
    timefame: "this_hour"
  });
  client.draw(awake, document.getElementById("chart-03"), {
    title: "Awake",
    width: "auto"
  });

  // ----------------------------------------
  // Asleep
  // ----------------------------------------

  var asleep = new Keen.Query("count", {
    eventCollection: "asleep",
    timefame: "this_hour"
  });
  client.draw(asleep, document.getElementById("chart-04"), {
    title: "Asleep",
    width: "auto",
  });

  // ----------------------------------------
  // Funnel
  // ----------------------------------------

  var funnel = new Keen.Query('funnel', {
    steps: [
      {
         event_collection: "account_setup",
         actor_property: "user.id"
      },
      {
        event_collection: "device_activated",
        actor_property: "user.id"
      },
      {
        event_collection: "first_data_sent_to_cloud",
        actor_property: "user.id"
      },
      {
        event_collection: "first_mobile_app_view",
        actor_property: "user.id"
      }
    ]
  });

  client.draw(funnel, document.getElementById("chart-05"), {
    chartType: "barchart",    
    title: "Set-up",
    width: "auto",
    labelMapping: {
      "account_setup": "Account Set-up",
      "device_activated": "Device Activated",
      "first_data_sent_to_cloud": "First Data to Cloud",
      "first_mobile_app_view": "First App View"
    }
  });

  // ----------------------------------------
  // Mapbox
  // ----------------------------------------
  L.mapbox.accessToken = 'pk.eyJ1Ijoicml0Y2hpZWxlZWFubiIsImEiOiJsd3VLdFl3In0.lwvdUU2VGB9VGDw7ulA4jA';
  var map = L.mapbox.map('map', 'ritchieleeann.j7bc1dpl', {
    attributionControl: true
  });
  map.setView([37.61, -122.357], 9);
  map.attributionControl
  .addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');
  // .addAttribution('<a href="https://foursquare.com/">Places data from Foursquare</a>');
  var keenMapData = L.layerGroup().addTo(map);

  var pageviews_geo = new Keen.Query("count", {
    eventCollection: "pageviews",
    interval: "hourly",
    groupBy: "user.device_info.browser.family",
    timeframe: {
      start: "2014-05-04T00:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.run(pageviews_geo, function(res){
    console.log(res);

     // Transform each venue result into a marker on the map.
    // for (var i = 0; i < result.response.venues.length; i++) {
    //   var venue = result.response.venues[i];
    //   var latlng = L.latLng(venue.location.lat, venue.location.lng);
    //   var marker = L.marker(latlng)
    //     .bindPopup('<h2><a href="https://foursquare.com/v/' + venue.id + '">' +
    //         venue.name + '</a></h2>')
    //     .addTo(foursquarePlaces);
    // }

  });


});