var client1 = new Keen({
  projectId: '5368fa5436bf5a5623000000',
  readKey: '3f324dcb5636316d6865ab0ebbbbc725224c7f8f3e8899c7733439965d6d4a2c7f13bf7765458790bd50ec76b4361687f51cf626314585dc246bb51aeb455c0a1dd6ce77a993d9c953c5fc554d1d3530ca5d17bdc6d1333ef3d8146a990c79435bb2c7d936f259a22647a75407921056'
});

var client2 = new Keen({
  projectId: '53eab6e12481962467000000',
  readKey: 'd1b97982ce67ad4b411af30e53dd75be6cf610213c35f3bd3dd2ef62eaeac14632164890413e2cc2df2e489da88e87430af43628b0c9e0b2870d0a70580d5f5fe8d9ba2a6d56f9448a3b6f62a5e6cdd1be435c227253fbe3fab27beb0d14f91b710d9a6e657ecf47775281abc17ec455'
});


Keen.ready(function(){

  // ----------------------------------------
  // Impressions timeline
  // ----------------------------------------
  var impressions_timeline = new Keen.Dataviz()
    .el('#chart-01')
    .height(175)
    .title(null)
    .type('area')
    .stacked(true)
    .prepare();

  client1
    .query('count', {
      event_collection: 'impressions',
      interval: 'hourly',
      timeframe: {
        start: '2014-05-04T00:00:00.000Z',
        end: '2014-05-05T00:00:00.000Z'
      }
    })
    .then(function(res) {
      impressions_timeline.data(res).render();
    })
    .catch(function(err) {
      impressions_timeline.message(err.message);
    });

  // ----------------------------------------
  // Heart Rate
  // ----------------------------------------
  $('.heart').knob({
    angleArc: 250,
    angleOffset: -125,
    readOnly: true,
    min: 50,
    max: 80,
    fgColor: '#00bbde',
    width: '100%'
  });

  client2
    .query('median', {
      event_collection: 'user_action',
      target_property: 'bio_sensors.heart_rate',
      filters: [
        {
          property_name : 'user.id',
          operator : 'eq',
          property_value : '02846154-1520-5F67-A892-6C0F21408069'
        }
      ]
    })
    .then(function(res) {
      $('.heart').val(res.result).trigger('change');
    })
    .catch(function(err) {
      alert('Error fetching user heart rate metric');
    });


  // ----------------------------------------
  // Temperature
  // ----------------------------------------
  $('.temp').knob({
    angleArc:250,
    angleOffset:-125,
    readOnly:true,
    min:90,
    max:105,
    fgColor: '#fe6672',
    width: '100%'
  });

  client2
    .query('median', {
      event_collection: 'user_action',
      target_property: 'enviro_sensors.temp',
      filters: [
        {
          property_name : 'user.id',
          operator : 'eq',
          property_value : '02846154-1520-5F67-A892-6C0F21408069'
        }
      ]
    })
    .then(function(res) {
      // $('.temp').val(res.result).trigger('change');
      // Sample data
      $('.temp').val(98).trigger('change');
    })
    .catch(function(err) {
      alert('Error fetching user temperature metric');
    });

  // ----------------------------------------
  // Battery
  // ----------------------------------------
  $('.battery').knob({
    angleArc: 250,
    angleOffset: -125,
    readOnly: true,
    fgColor: '#00cfbb',
    width: '100%'
  });

  client2
    .query('median', {
      event_collection: 'user_action',
      target_property: 'battery_level',
      filters: [
        {
          property_name : 'user.id',
          operator : 'eq',
          property_value : '02846154-1520-5F67-A892-6C0F21408069'
        }
      ]
    })
    .then(function(res) {
      $('.battery').val((res.result)*100).trigger('change');
    })
    .catch(function(err) {
      alert('Error fetching user battery metric');
    });

});
