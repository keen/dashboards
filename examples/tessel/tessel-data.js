 
var Keen = require('keen.io');
var wifi = require('wifi-cc3000');
 
var keen = Keen.configure({
    projectId: "542b084ce8759666375da5e5",
    writeKey: "5eb5ca575ff8bb7108c21fe13a6cd0e81c1e82b8df8d0fdf7d583029a0702cf892dc5a8b8e9b3884c0415d8a3603ce06465b4b7053aee014a8ab25e640af5b8750ea316034afbdc01899177aa55795829a146bc050e609dfd761324cbd6a8a5ef805b2cc14073fbd3dfd7a2bee2727e2",
    readKey: "f7069f777acb01ea3883696c1cbaca038f37a5615edbaf1535b1a5d28563afafa1d1c85a0807650dc8c2a971f4f28d5b54139277c41c31d700715ff92cb6caad00af478d2426286620d82af20ea055a2673678b571858fcb03f3f836d95995255f48968266508dc1963bfd4c484698fa"
});
 
// src colony modules tls.js
 
var tessel = require('tessel');

var climatelib = require('climate-si7020');
var ambientlib = require('ambient-attx4');
 
var climate = climatelib.use(tessel.port['A']);
var ambient = ambientlib.use(tessel.port['B']);

 
//------------------------------------------------
// Climate Temp and Humidity
//------------------------------------------------

climate.on('ready', function () {
  console.log('Connected to si7020');
  ambient.on('ready', function () {
 
    // Loop forever
    setInterval(function () {
      climate.readTemperature('f', function (err, temp) {
        climate.readHumidity(function (err, humid) {
          ambient.getLightLevel( function (err, light) {
            ambient.getSoundLevel( function (err, sound) {
        
              console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
              console.log("Light level:", light.toFixed(8), " ", "Sound Level:", sound.toFixed(8));
              if (wifi.isConnected()) {
                sendToCloud(temp, humid, light, sound, function(){
                  setTimeout(loop, 10000);
                });

              } else {
                console.log("nope not connected");
                setTimeout(loop, 10000);
              }
            });
          });
        });
      });
    }, 500);
    ambient.setLightTrigger(0.5);

    // Set a light level trigger
    // The trigger is a float between 0 and 1
    ambient.on('light-trigger', function(data) {
      console.log("Our light trigger was hit:", data);
      if (wifi.isConnected()) {
        sendLightTrigger(data);
      } else {
        console.log("nope not connected");
      }
      // Clear the trigger so it stops firing
      ambient.clearLightTrigger();
      //After 1.5 seconds reset light trigger
      setTimeout(function () {

          ambient.setLightTrigger(0.5);

      },1500);
    });

    // Set a sound level trigger
    // The trigger is a float between 0 and 1
    ambient.setSoundTrigger(0.1);

    ambient.on('sound-trigger', function(data) {
      console.log("Something happened with sound: ", data);
      if (wifi.isConnected()) {
        sendSoundTrigger(data);

      } else {
        console.log("nope not connected");
      }
      // Clear it
      ambient.clearSoundTrigger();

      //After 1.5 seconds reset sound trigger
      setTimeout(function () {

          ambient.setSoundTrigger(0.1);

      },1500);

    });
  });
});
 
climate.on('error', function(err) {
  console.log('error connecting module', err);
});

ambient.on('error', function (err) {
  console.log(err);
});

function sendToCloud(tdata, hdata, ldata, sdata, cb){
  keen.addEvent("climate", {
   "temp": tdata,
   "humidity": hdata,
   "light": ldata,
   "sound": sdata
  }, function(){
    console.log("added event");
    cb();
  });
}

function sendLightTrigger(data){
  keen.addEvent("climate", {
   "light-trigger": data
  }, function(){
    console.log("added event");
  });
}

function sendSoundTrigger(data){
  keen.addEvent("climate", {
   "sound-trigger": data
  }, function(){
    console.log("added event");
  });
}
 
wifi.on('disconnect', function(){
  console.log("disconnected, trying to reconnect");
  wifi.connect({
    ssid: 'technicallyWifi',
    password:'scriptstick'
  });
});


