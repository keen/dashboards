const client = new Keen({
  projectId: '53f3eca97d8cb91b75000000',
  readKey: 'df6ff0ff414bc286b91e2661db4c691c45b6aea8d2c8cf2393169e9b9ef36a3d77e59c57b540febc8f328bf1f605782d9035c4a7072dc86c4f96ddbcce7dfe0b088ae51dd2ea36ad022290d1f3580e2d1ea202845ae7f79e7db6634ee627a26197dadf7eb2e5a46b16f04a4cae55955e'
});

Keen.ready(function () {

  const chart01 = new KeenDataviz({
    container: '#grid-1',
    title: 'Total Acquisitions, by State',
    notes: 'Notes about this chart',
    type: 'area',
    stacked: true
  });

  const chart02 = new KeenDataviz({
    container: '#grid-2',
    title: 'Total Acquisition Cost and by State',
    notes: 'Notes about this chart',
    type: 'area',
    stacked: true
  })

  const chart03 = new KeenDataviz({
    container: '#grid-3',
    title: 'Total Acquisition Cost in Missouri',
    notes: 'Notes about this chart',
    type: 'area',
    stacked: true
  })

  const chart04 = new KeenDataviz({
    container: '#grid-4',
    title: 'Quantity Purchased by State',
    type: 'horizontal-bar'
  });

  client
    .query('count', {
      event_collection: 'purchases',
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      interval: 'monthly'
    })
    .then(res => {
      chart01.data(res).render();
    })
    .catch(err => {
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
    .then(res => {
      chart02.data(res).render();
    })
    .catch(err => {
      chart02.message(err.message);
    });

  client
    .query('sum', {
      event_collection: 'purchases',
      target_property: 'Acquisition Cost',
      filters: [{
        property_name: 'State',
        operator: 'eq',
        property_value: 'MO'
      }],
      timeframe: {
        start: '2012-01-01',
        end: '2014-05-01'
      },
      interval: 'monthly'
    })
    .then(res => {
      chart03.data(res).render();
    })
    .catch(err => {
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
    .then(res => {
      chart04.data(res).render();
    })
    .catch(err => {
      chart04.message(err.message);
    });

});