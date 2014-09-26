 
var Keen = require('keen.io');
 
var keen = Keen.configure({
    projectId: "53fd0676e861701e17000001",
    writeKey: "510a87bcaca6d22103d47cb364520700218e44e2c99542331baf91e2988e143a1b891561838af27a9e4466b8834939c14547402f610a1e9075448740e97fc8b82918da10f409ffbab761eb6e394cccb7db133ba935d22a1189d1f91d70eed76b8f05b16133c91417da5438b15d4327f7",
    readKey: "e59871426c869471154eeebdf6e7feb02309f6d0d12574cd655fa8187d0dec5c16922b8a72364c3f192a5459e4debace4b70594fa8cd69e2af1f3b1c9d17d689677d20c806e7a690213122e8f022f496ee10c918013a07e246b3ae5247b66dc27167ee479f1d209c9f2aec115a5830a6"
});
 
// src colony modules tls.js
 
var tessel = require('tessel');
// if you're using a si7020 replace this lib with climate-si7020
var climatelib = require('climate-si7020');
var ambientlib = require('ambient-attx4');
 
var climate = climatelib.use(tessel.port['A']);
var ambient = ambientlib.use(tessel.port['B']);
var camera = require('camera-vc0706').use(tessel.port['A']);
 
//------------------------------------------------
// Climate Temp and Humidity
//------------------------------------------------

climate.on('ready', function () {
  console.log('Connected to si7020');
 
  // Loop forever
  setImmediate(function loop () {
    climate.readTemperature('f', function (err, temp) {
      climate.readHumidity(function (err, humid) {
        keen.addEvent("climate", {
          "temp": temp.toFixed(4),
          "humidity": humid.toFixed(4)
        });
        console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
        setTimeout(loop, 10000);
      });
    });
  });
});
 
climate.on('error', function(err) {
  console.log('error connecting module', err);
});

//--------------------------------------------
// Ambient Light and Sound
//---------------------------------------------

ambient.on('ready', function () {
 // Get points of light and sound data.
  setInterval( function () {
    ambient.getLightLevel( function(err, ldata) {
      if (err) throw err;
      ambient.getSoundLevel( function(err, sdata) {
        if (err) throw err;
        keen.addEvent("ambient", {
          "light": ldata.toFixed(4),
          "humidity": sdata.toFixed(4)
        });
        console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
    });
  })}, 500); // The readings will happen every .5 seconds unless the trigger is hit

  ambient.setLightTrigger(0.5);

  // Set a light level trigger
  // The trigger is a float between 0 and 1
  ambient.on('light-trigger', function(data) {
    keen.addEvent("light-trigger", data);
    console.log("Our light trigger was hit:", data);

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
    keen.addEvent("sound-trigger", data);
    console.log("Something happened with sound: ", data);

    // Clear it
    ambient.clearSoundTrigger();

    //After 1.5 seconds reset sound trigger
    setTimeout(function () {

        ambient.setSoundTrigger(0.1);

    },1500);

  });
});
ambient.on('error', function (err) {
  console.log(err)
});

//----------------------------------------------
// Camera
//----------------------------------------------

// Wait for the camera module to say it's ready
camera.on('ready', function() {
  // notificationLED.high();
  // Take the picture
  camera.takePicture(function(err, image) {
    if (err) {
      console.log('error taking image', err);
    } else {
      // notificationLED.low();
      // Name the image
      var name = 'picture-' + Math.floor(Date.now()*1000) + '.jpg';
      // Save the image
      console.log('Picture saving as', name, '...');
      process.sendfile(name, image);
      console.log('done.');
      // Turn the camera off to end the script
      camera.disable();
    }
  });
});

camera.on('error', function(err) {
  console.error(err);
});

//------------------------------------------
// Keen 
//------------------------------------------
 
// setInterval(function() {
//   console.log('whoa');
//   keen.addEvent("climate", {
//    "temp": Math.floor(Math.random(10) * 10)
//   });
// }, 1000);