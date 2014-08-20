var client = new Keen({
  projectId: "53f3eca97d8cb91b75000000",
  readKey: "df6ff0ff414bc286b91e2661db4c691c45b6aea8d2c8cf2393169e9b9ef36a3d77e59c57b540febc8f328bf1f605782d9035c4a7072dc86c4f96ddbcce7dfe0b088ae51dd2ea36ad022290d1f3580e2d1ea202845ae7f79e7db6634ee627a26197dadf7eb2e5a46b16f04a4cae55955e"
});

Keen.ready(function(){
  var q1 = new Keen.Query("count", {
    eventCollection: "purchases",
    //groupBy: "State",
    timeframe: "this_5_years",
    interval: "monthly"
  });
  client.draw(q1, document.getElementById("grid-1"), {
    title: " ",
    chartType: "areachart",
    height: 200,
    width: "auto",
    chartOptions: {
      isStacked: true
    }
  });

  var q2 = new Keen.Query("sum", {
    eventCollection: "purchases",
    targetProperty: "Acquisition Cost",
    timeframe: "this_5_years",
    interval: "monthly"
  });
  client.draw(q2, document.getElementById("grid-2"), {
    title: " ",
    chartType: "areachart",
    height: 200,
    width: "auto"
  });

  var q3 = new Keen.Query("sum", {
    eventCollection: "purchases",
    targetProperty: "Acquisition Cost",
    filters: [{"property_name":"State","operator":"eq","property_value":"MO"}],
    timeframe: "this_5_years",
    interval: "monthly"
  });
  client.draw(q3, document.getElementById("grid-3"), {
    title: " ",
    chartType: "areachart",
    height: 200,
    width: "auto"
  });


  var q4 = new Keen.Query("sum", {
    eventCollection: "purchases",
    timeframe: "this_5_years",
    targetProperty: "Quantity",
    groupBy: "State"
  });
  client.draw(q4, document.getElementById("grid-4"), {
    chartType: "barchart",
    title: " ",
    height: 800,
    width: "auto",
    chartOptions: {
      chartArea: { top: "3%", height: "90%", left: "10%", width: "80%" }
    }
  });



});
