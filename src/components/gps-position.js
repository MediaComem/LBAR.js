AFRAME.registerSystem('gps-position', {
  schema: {
    minAccuracy: { // data below this threshold will not update the position
      type: 'int',
      default: 100
    },
    minDistance: { // minimal distance from the last position before refreshing the actual one
      type: 'number',
      default: 2 // default smartphone gps accuracy is ~2 [m]
    },
    cam3DoF: {
      type: 'boolean',
      default: true
    }
  },

  init: function () {
    const success = this.checkDependencies();
    if (!success) return;

    this.currentPosition = {latitude: 0, longitude: 0};
    this.originPosition = null;

    this._onDeviceGPS = this._onDeviceGPS.bind(this);
    this._onDeviceGPSError = this._onDeviceGPSError.bind(this);

    this._watchPosition = navigator.geolocation.watchPosition(this._onDeviceGPS, this._onDeviceGPSError, {
      enableHighAccuracy: true,
      timeout: 20000
    });

    // Activate the video only on non vr/ar mode (in short: in AR 3DoF only)
    this.video = null;
    if (this.data.cam3DoF && !this.el.sceneEl.is('vr-mode') && !this.el.sceneEl.is('ar-mode')) {
      this._createVideo();
    }

    this._onEnterVrAr = this._onEnterVrAr.bind(this);
    this._onExitVrAr = this._onExitVrAr.bind(this);
    window.addEventListener('enter-vr', this._onEnterVrAr);
    window.addEventListener('exit-vr', this._onExitVrAr);
  },

  remove: function () {
    this._removeVideo();
    window.removeEventListener('enter-vr', this._onEnterVrAr);
    window.removeEventListener('exit-vr', this._onExitVrAr);
    if (this._watchPosition) {
      navigator.geolocation.clearWatch(this._watchPosition);
    }
  },

  update: function (oldData) {
    if (Object.entries(oldData).length === 0) return;
    if (this.data.cam3DoF !== oldData.cam3DoF) {
      if (this.data.cam3DoF) {
        this._createVideo();
      } else {
        this._removeVideo();
      }
    }
  },

  checkDependencies: function () {
    let success = true;
    if ('geolocation' in navigator === false) {
      console.error('Geolocation is not supported by your browser');
      success = false;
    }
    return success;
  },


  _onEnterVrAr: function() {
    // pause the 3DoF video when enter AR/VR
    this._pauseVideo();
  },

  _onExitVrAr: function() {
    if (this.video) {
      this._unPauseVideo();
    } else if (this.data.cam3DoF) {
      this._createVideo();
    }
  },

  _createVideo: function () {
    this.videoContainer = document.createElement('video-container');
    this.videoContainer.style.width = '100vw';
    this.videoContainer.style.height = '100vh';
    this.videoContainer.style.position = 'absolute';
    this.videoContainer.style.top = '0';
    this.videoContainer.style.left = '0';
    this.videoContainer.style.zIndex = '-2';
    this.video = document.createElement('video');
    this.video.setAttribute('autoplay', '');
    this.video.setAttribute('muted', '');
    this.video.setAttribute('playsinline', '');
    this.video.style.height = '100vh';
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {      
      console.error('getUserMedia fail to get the Video stream ');
    } else {
      navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'environment'}})
        .then(stream => this.video.srcObject = stream);
    }
    this.videoContainer.appendChild(this.video);
    document.body.appendChild(this.videoContainer);
  },

  _removeVideo: function () {
    if (!this.video) return;
    this._pauseVideo();
    this.video.remove();
    this.videoContainer.removeChild(this.video);
    this.video = null;
    document.body.removeChild(this.videoContainer);
    this.videoContainer = null;
  },

  _pauseVideo: function () {
    if (!this.video) return;
    this.video.pause();
    const tracks = this.video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  },

  _unPauseVideo: function () {
    if (!this.video) return;
    navigator.mediaDevices.getUserMedia({audio: false, video: {facingMode: 'environment'}})
      .then(stream => this.video.srcObject = stream);
    this.video.play();
  },

  _onDeviceGPSError: function (error) {
    console.warn(`error ${err.code}: ${err.message}`);
    // todo: show error on app
    if (err.code === 1) {
      console.error('Please activate Geolocation and refresh the page. If it is already active, please check permissions for this website.');
    }
    if (err.code === 3) {
      console.error('Cannot retrieve GPS position. Signal is absent.');
    }
  },

  _onDeviceGPS: function (pos) {
    const position = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    };

    // doesnt take position with a low accuracy
    if (position.accuracy > this.data.minAccuracy) {
      console.error('GPS signal is very poor. Try move outdoor or to an area with a better signal.');
      return;
    }

    // if distance not too close, or origin coords not setted, we update the pos and dispatch an event
    const distMoved = this._haversineDist(this.currentPosition, position);
    if (distMoved >= this.data.minDistance  || !this.originPosition) {
      this.currentPosition = position;
      window.dispatchEvent(new CustomEvent('gps-position-update', {detail: {...this.currentPosition}}));
      if (!this.originPosition) {
        this.originPosition = this.currentPosition;
        window.dispatchEvent(new CustomEvent('gps-position-set', {detail: {...this.currentPosition}}));
      }
    }
  },

  _haversineDist: function (src, dest) {
    const dlongitude = THREE.Math.degToRad(dest.longitude - src.longitude);
    const dlatitude = THREE.Math.degToRad(dest.latitude - src.latitude);
    const a = (Math.sin(dlatitude / 2) * Math.sin(dlatitude / 2)) + Math.cos(THREE.Math.degToRad(src.latitude)) * Math.cos(THREE.Math.degToRad(dest.latitude)) * (Math.sin(dlongitude / 2) * Math.sin(dlongitude / 2));
    const angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return angle * 6371000;
  }

});

AFRAME.registerComponent('gps-position', {
  schema: {
    longitude: {
      type: 'number',
      default: 0,
    },
    latitude: {
      type: 'number',
      default: 0,
    }
  },

  init: function () {
    this._onPositionSet = this._onPositionSet.bind(this);
    this._onPositionUpdate = this._onPositionUpdate.bind(this);
    // If the system allready have a current gps pos, we update the pos entity with it
    if (this.system.originPosition) {
      this._onPositionUpdate({detail: this.system.currentPosition});
    // Otherwise hide the entity and wait for the gps pos to make it visible again
    } else {
      this.el.setAttribute('visible', false);
    }
    window.addEventListener('gps-position-set', this._onPositionSet);
    window.addEventListener('gps-position-update', this._onPositionUpdate);

    this._onExitVrAr = this._onExitVrAr.bind(this);
    window.addEventListener('exit-vr', this._onExitVrAr);
  },

  remove: function() {
    window.removeEventListener('gps-position-set', this._onPositionSet);
    window.removeEventListener('gps-position-update', this._onPositionUpdate);
    window.removeEventListener('exit-vr', this._onExitVrAr);
  },

  _onExitVrAr: function() {
    this._onPositionUpdate({detail: this.system.currentPosition});
  },

  _onPositionSet: function (posEvt) {
    this.el.setAttribute('visible', true);
  },

  _onPositionUpdate: function (posEvt) {
    const haversineDist = this.system._haversineDist;
    const gpsPos = posEvt.detail;

    const position = {x: 0, y: this.el.getAttribute('position').y || 0, z: 0};

    position.x = haversineDist(gpsPos, {
      longitude: this.data.longitude,
      latitude: gpsPos.latitude
    });
    position.x *= this.data.longitude > gpsPos.longitude ? 1 : -1;

    position.z = haversineDist(gpsPos, {
      longitude: gpsPos.longitude,
      latitude: this.data.latitude,
    });
    position.z *= this.data.latitude > gpsPos.latitude ? -1 : 1;

    this.el.setAttribute('position', position);
  }

});
