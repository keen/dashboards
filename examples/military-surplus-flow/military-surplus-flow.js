var client = new Keen({
  projectId: '53f3eca97d8cb91b75000000',
  readKey: 'df6ff0ff414bc286b91e2661db4c691c45b6aea8d2c8cf2393169e9b9ef36a3d77e59c57b540febc8f328bf1f605782d9035c4a7072dc86c4f96ddbcce7dfe0b088ae51dd2ea36ad022290d1f3580e2d1ea202845ae7f79e7db6634ee627a26197dadf7eb2e5a46b16f04a4cae55955e'
});

Keen.ready(function(){
  var chart01 = new Keen.Dataviz()
    .el('#grid-1')
    .type('area')
    .height(240)
    .stacked(true)
    .title('Total Acquisitions, by State')
    .notes('Notes about this chart')
    .prepare();

  var chart02 = new Keen.Dataviz()
    .el('#grid-2')
    .type('area')
    .height(240)
    .stacked(true)
    .title('Total Acquisition Cost and by State')
    .notes('Notes about this chart')
    .prepare();

  var chart03 = new Keen.Dataviz()
    .el('#grid-3')
    .type('area')
    .height(240)
    .stacked(true)
    .title('Total Acquisition Cost in Missouri')
    .notes('Notes about this chart')
    .prepare();

  var chart04 = new Keen.Dataviz()
    .el('#grid-4')
    .type('horizontal-bar')
    .height(800)
    .title('Quantity Purchased by State')
    .prepare();

  client
    .query('count', {
      event_collection: 'purchases',
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      interval: 'monthly'
    })
    .then(function(res) {
      chart01.data(res).render();
    })
    .catch(function(err) {
      chart01.message(err.message);
    });

  client
    .query('sum', {
      event_collection: 'purchases',
      target_property: 'Acquisition Cost',
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      interval: 'monthly'
    })
    .then(function(res) {
      chart02.data(res).render();
    })
    .catch(function(err) {
      chart02.message(err.message);
    });

  client
    .query('sum', {
      event_collection: 'purchases',
      target_property: 'Acquisition Cost',
      filters: [
        {
          property_name:'State',
          operator:'eq',
          property_value:'MO'
        }
      ],
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      interval: 'monthly'
    })
    .then(function(res) {
      chart03.data(res).render();
    })
    .catch(function(err) {
      chart03.message(err.message);
    });

  client
    .query('sum', {
      event_collection: 'purchases',
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      target_property: 'Quantity',
      group_by: 'State'
    })
    .then(function(res) {
      chart04.data(res).render();
    })
    .catch(function(err) {
      chart04.message(err.message);
    });

});
