
# LBAR.js
*«The ship does not actually move itself, but, using the Dark Matter Accelerator, it moves the universe around it as stated by Professor Farnsworth and later realized by Cubert Farnsworth»*

LBAR.js last version is 0.2, and is published under the MIT Licence.

Inspired by the location based marker part of [AR.js](https://github.com/AR-js-org/AR.js), LBAR.js is a minimalist Web XR Location Based Markers for A-Frame 1.3.0.

It is targeting WebXr enabled browser, and offer you 1 system and 3 components.

Made by the [Media Engineering Institute](https://heig-vd.ch/en/research/mei) with <3

## Usage

#### Example
```html
<!DOCTYPE  html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>LBAR.js</title>
    <script src="https://aframe.io/releases/1.3.0/aframe.min.js"></script>
    <script src="https://raw.githack.com/MediaComem/LBAR.js/main/dist/lbar-v0.2.min.js"></script>
  </head>
  <body>
    <a-scene gps-position webxr="referenceSpaceType: unbounded; requiredFeatures: unbounded;">
      <a-entity faces-north>
        <a-box gps-position="latitude: 46.2265228; longitude: 6.1413027" color="red"></a-box>
      </a-entity>
      <a-entity position="0 0 0" camera pitch-roll-look-controls></a-entity>
    </a-scene>
  </body>
</html>
```
Will place a red box on the [Palace of Nations](https://en.wikipedia.org/wiki/Palace_of_Nations).
Demo and source aviable here: https://glitch.com/edit/#!/torch-cyber-conga?path=index.html
Test it on a WebXr enabled Browser with GPS Activated (on a android smartphone for example).
In production, switch LBAR.js script url to:
```html
<script src="https://rawcdn.githack.com/MediaComem/LBAR.js/5001fa7e4a9f6141d34a83213ce4a6a813673559/dist/lbar-v0.2.min.js"></script>
```
### gps-position system
The *gps-position* system can be conf. with three parameters:
```html
<a-scene  gps-position="minAccuracy: 100; minDistance: 2; cam3DoF: true">
```
Any gps data above *minAccuracy* will be discarded.
*minDistance* control how frequently GPS updates are processed. With the defaul value of 2, only a 2[m] GPS  move will trigger a replacement of the markers.
The camera in the 3DoF mode can be disable by setting *cam3DoF* to false (the default value is true).
The camera in WebXr AR (6DoF) is enable and handled by the AR mode of A-Frame.

### faces-north components
The *faces-north* component make the entity always faces north (using the device's magnetometer).
It **must** be a parent of all the location based markers.

### gps-position components
Latitude and longitude of the location marker entity **must** be specified. The entity will be placed on the *faces-north* plane  relatively to the GPS position of the device.

### pitch-roll-look-controls
This components will enable only the pitch and roll controls of the 3DoF camera (and disable yaw movements). As the *faces-north* component rotate his yaw using the device's magnetometer, the camera must not rotate on the yaw axis anymore.  This component will not handle the camera in the WebXr AR (6DoF) mode (it will be handled by the AR mode of A-Frame).