// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  //Bad style but w/e for now
  window.client = new Keen({
    projectId: "53e3da37e8617022dd000000",
    writeKey: "1b94c236f839c60775698ea90cef000906eb6f5b6928180320464d3ce61c334775ea0554bb1b5e96cb91bd8e3a2658959a438e85e429702e0e7618be2261a8ac824445301cd3b7e4a59407c0b6876b3c4054bcc63ad7a30fc837513a8516b7b357d3e7931d503a01273209d3db57c301",
    readKey: "de02be24f019e60415325d5e34408a752403cdf5170a686d4d3dbdf24b43ad0abafc61ad2e0a5dd9df3d608af8fd243a212416ac407c59e9279db85a3e3f43fbba6c44bb98e2dd3d28d0f3531e1fae763cd87e5b75132ebb23d36632f81b84480dc14c36517efc75e04e1b521b9aca6e"
  });

  Keen.ready(function(){
    var query = new Keen.Query("count", {
      eventCollection: "new_high_score2",
      groupBy: "best_score"
    });
    var el = document.getElementById("stats-container");

    var scores = window.client.run(query, function(res) {
      new Keen.Visualization(res, el, {
        title: "Best Scores",
        width: 500,
        chartType: "piechart",
        chartOptions: {
          pieHole: .5
        }
      });
    });

    setInterval(function(){
      scores.refresh();
    }, 3000);

  });

  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
