window.requestAnimationFrame(function () {
  // Wait till the browser is ready to render the game (avoids glitches)

  window.client = new Keen({
    projectId: '53e3da37e8617022dd000000',
    writeKey: '1b94c236f839c60775698ea90cef000906eb6f5b6928180320464d3ce61c334775ea0554bb1b5e96cb91bd8e3a2658959a438e85e429702e0e7618be2261a8ac824445301cd3b7e4a59407c0b6876b3c4054bcc63ad7a30fc837513a8516b7b357d3e7931d503a01273209d3db57c301',
    readKey: 'de02be24f019e60415325d5e34408a752403cdf5170a686d4d3dbdf24b43ad0abafc61ad2e0a5dd9df3d608af8fd243a212416ac407c59e9279db85a3e3f43fbba6c44bb98e2dd3d28d0f3531e1fae763cd87e5b75132ebb23d36632f81b84480dc14c36517efc75e04e1b521b9aca6e'
  });

  Keen.ready(function(){

    // Define visuals

    var chart_total_moves = new Keen.Dataviz()
      .el('#moves-container')
      .height(200)
      .title('Total Moves')
      .type('metric')
      .prepare();

    var chart_best_scores = new Keen.Dataviz()
      .el('#stats-container')
      .height(200)
      .title('High Score')
      .type('metric')
      .chartOptions({
        prettyNumber: false
      })
      .prepare();


    // Run queries and render results

    client
      .query('count', {
        event_collection: 'moves'
      })
      .then(function(res) {
        chart_total_moves.data(res).render();
      })
      .catch(function(err) {
        chart_total_moves.message(err.message);
      });

    client
      .query('maximum', {
        event_collection: 'new_high_score2',
        target_property: 'best_score'
      })
      .then(function(res) {
        chart_best_scores.data(res).render();
      })
      .catch(function(err) {
        chart_best_scores.message(err.message);
      });
  });

  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
});
