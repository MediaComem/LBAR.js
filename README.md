# LBAR.js
*“I understand how the engines work now. It came to me in a dream. The engines don't move the ship at all. The ship stays where it is and the engines move the universe around it.”* 
―Cubert Farnsworth, from Futurama S02E10, A Clone of My Own [^1]

Based on the location-based marker portion of [AR.js](https://github.com/AR-js-org/AR.js), LBAR.js is a minimalist library for creating WebXR location-based markers 📍 with [A-Frame](https://github.com/aframevr/aframe/) 1.3.0. It targets [WebXR-enabled browsers](https://caniuse.com/webxr) and contains one system (gps-position) and three components (faces-north; gps-position; pitch-roll-look-controls). LBAR.js’s last version is 0.2, and is published under the MIT Licence.

Made with ♡ at the [Media Engineering Institute](https://heig-vd.ch/en/research/mei). 

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
This will place a red cube on the [Palace of Nations](https://en.wikipedia.org/wiki/Palace_of_Nations). 
Demo and source are available here: https://glitch.com/edit/#!/torch-cyber-conga?path=index.html
Test it on a WebXR-enabled browser, with a location-enabled (GPS) device (ie. an Android smartphone). 

In production, switch LBAR.js’s script url to:
```html
<script src="https://rawcdn.githack.com/MediaComem/LBAR.js/5001fa7e4a9f6141d34a83213ce4a6a813673559/dist/lbar-v0.2.min.js"></script>
```
### gps-position system
The *gps-position* system can be configured with three parameters:
```html
<a-scene  gps-position="minAccuracy: 100; minDistance: 2; cam3DoF: true">
```
Any GPS/location data above *minAccuracy* will be discarded. 
*minDistance* controls how frequently GPS updates are processed. With a defaul value of 2, the markers are repositioned when the user has travelled at least two meters. 
In 3DoF mode, the camera can be disabled by setting *cam3DoF* to false (default value is true). 
In WebXR AR (6DoF), the camera is enabled (and handled) by A-Frame’s AR mode. 

### faces-north component
An entity with the *faces-north* component will always faces north (based on the device’s magnetometer data). All location-based markers **must** be children of an entity with this component. 

### gps-position component
Latitude and longitude of the location-based marker/entity **must** be specified. The entity will be placed on the *faces-north* plane, relatively to the device’s location data (GPS). 

### pitch-roll-look-controls component
This component will only enable the pitch and roll controls of the 3DoF camera (thus disabling yaw control). Since the *faces-north* component rotates its yaw (based on the device’s magnetometer), the camera must not rotate on the yaw axis anymore. This component will not handle the camera in the WebXR AR (6DoF) mode, since A-Frame’s AR mode will take over. 


[^1]: Verrone, P. M. (Writer), Westbrook, J. (Staff writer), Moore, R. (Director), Haaland, B. (Supervising director). (2000, April 9). A Clone of My Own (Season 2, Episode 10) [TV series episode]. In D. X. Cohen, M. Groening (Executive Producers), Futurama. Twentieth Century Fox Film Productions.
