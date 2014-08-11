var client = new Keen({
  projectId: "5368fa5436bf5a5623000000",
  readKey: "3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056"
});

Keen.ready(function(){

  // ----------------------------------------
  // Mapbox Demo
  // ----------------------------------------
  var map = L.mapbox.map('mapbox-demo', 'larimer.i638iep6', {
    attributionControl: true
  });
  map.setView([37.774, -122.411], 17);
  map.attributionControl.addAttribution('<a href="https://keen.io/">Custom Analytics by Keen IO</a>');

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

    /* Transform each venue result into a marker on the map.
    for (var i = 0; i < result.response.venues.length; i++) {
      var venue = result.response.venues[i];
      var latlng = L.latLng(venue.location.lat, venue.location.lng);
      var marker = L.marker(latlng)
        .bindPopup('<h2><a href="https://foursquare.com/v/' + venue.id + '">' +
            venue.name + '</a></h2>')
        .addTo(foursquarePlaces);
    }*/

  });


  // ----------------------------------------
  // Violations line chart
  // ----------------------------------------
  var pageviews_timeline = new Keen.Query("count", {
    eventCollection: "pageviews",
    interval: "hourly",
    groupBy: "user.device_info.browser.family",
    timeframe: {
      start: "2014-05-04T00:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.draw(pageviews_timeline, document.getElementById("chart-01"), {
    chartType: "linechart",
    title: null,
    height: 175,
    width: "auto",
    colors: null,
    chartOptions: {
      legend: { position: "none" },
      tooltip: { trigger: 'none' },
      chartArea: {
        left: "5%",
        top: "5%",
        height: "85%",
        width: "95%"
      }
    }
  });


  // ----------------------------------------
  // Violations
  // ----------------------------------------
  var impressions_timeline = new Keen.Query("count", {
    eventCollection: "impressions",
    groupBy: "ad.advertiser",
    interval: "hourly",
    timeframe: {
      start: "2014-05-04T00:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.draw(impressions_timeline, document.getElementById("chart-03"), {
    chartType: "columnchart",
    title: false,
    height: 175,
    width: "auto",
    chartOptions: {
      legend: { position: "none" },
      tooltip: { trigger: 'none' },
      chartArea: {
        left: "5%",
        top: "5%",
        height: "85%",
        width: "93%"
      },
      bar: {
        groupWidth: "85%"
      },
      isStacked: true
    }
  });

  // ----------------------------------------
  // Violations by Officer
  // ----------------------------------------
  var impressions_timeline_by_country = new Keen.Query("count", {
    eventCollection: "pageviews",
    interval: "hourly",
    timeframe: {
      start: "2014-04-30T12:00:00.000Z",
      end: "2014-05-05T00:00:00.000Z"
    }
  });
  client.draw(impressions_timeline_by_country, document.getElementById("chart-05"), {
    chartType: "columnchart",
    title: false,
    height: 175,
    width: "auto",
    chartOptions: {
      legend: { position: "none" },
      tooltip: { trigger: 'none' },
      chartArea: {
        left: "5%",
        top: "5%",
        height: "85%",
        width: "93%"
      },
      bar: {
        groupWidth: "85%"
      },
      isStacked: true
    }
  });


});
