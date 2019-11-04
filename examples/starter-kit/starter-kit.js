const client = new Keen({
  projectId: '5368fa5436bf5a5623000000',
  readKey: '3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056'
});
Keen.ready(function () {

  // Pageviews by browser

  const pageviews_timeline = new KeenDataviz({
    container: '#chart-01',
    title: 'Pageviews by browser',
    type: 'area',
    stacked: true,
    sortGroups: 'desc'
  });

  client
    .query('count', {
      event_collection: 'pageviews',
      interval: 'hourly',
      group_by: 'user.device_info.browser.family',
      timeframe: {
        start: '2014-05-04T00:00:00.000Z',
        end: '2014-05-05T00:00:00.000Z'
      }
    })
    .then(res => {
      pageviews_timeline
        .data(res)
        .render();
    })
    .catch(err => {
      pageviews_timeline.message(err.message)
    });


  // Pageviews by browser (pie)

  const pageviews_pie = new KeenDataviz({
    container: '#chart-02',
    type: 'pie',
    title: 'Pageviews by browser',
    sortGroups: 'desc'
  });

  client
    .query({
      savedQueryName: 'chart-02',
    })
    .then(function(results){
      pageviews_pie
        .render(results);
    })
    .catch(function(error){
      pageviews_pie
        .message(error.message);
    });


  // Impressions timeline

  const impressions_timeline = new KeenDataviz({
    container: '#chart-03',
    title: 'Impressions by advertiser',
    type: 'bar',
    stacked: true,
    sortGroups: 'desc'
  });

  client
    .query('count', {
      event_collection: 'impressions',
      group_by: 'ad.advertiser',
      interval: 'hourly',
      timeframe: {
        start: '2014-05-04T00:00:00.000Z',
        end: '2014-05-05T00:00:00.000Z'
      }
    })
    .then(res => {
      impressions_timeline
        .data(res)
        .render();
    })
    .catch(err => {
      impressions_timeline.message(err.message)
    });

  // Impressions by device

  const impressions_by_device = new KeenDataviz({
    container: '#chart-04',
    title: 'Impressions by device',
    type: 'bar',
    stacked: true,
    sortGroups: 'desc'
  });

  client
    .query('count', {
      event_collection: 'impressions',
      group_by: 'user.device_info.device.family',
      interval: 'hourly',
      timeframe: {
        start: '2014-05-04T00:00:00.000Z',
        end: '2014-05-05T00:00:00.000Z'
      }
    })
    .then(res => {
      impressions_by_device
        .data(res)
        .render();
    })
    .catch(err => {
      impressions_by_device.message(err.message)
    });


  // Impressions by country

  const impressions_by_country = new KeenDataviz({
    container: '#chart-05',
    title: 'Impressions by country',
    type: 'bar',
    stacked: true,
    sortGroups: 'desc'
  });

  client
    .query('count', {
      event_collection: 'impressions',
      group_by: 'user.geo_info.country',
      interval: 'hourly',
      timeframe: {
        start: '2014-05-04T00:00:00.000Z',
        end: '2014-05-05T00:00:00.000Z'
      }
    })
    .then(res => {
      impressions_by_country
        .data(res)
        .render();
    })
    .catch(err => {
      impressions_by_country.message(err.message)
    });

});