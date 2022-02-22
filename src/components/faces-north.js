AFRAME.registerComponent('faces-north', {

  init: function () {
    const success = this.checkDependencies();
    if (!success) return;

    // doesnt update heading on AR mode (let the webXr control the headings)
    this.alwaysInSynch = !this.el.sceneEl.is('vr-mode') && !this.el.sceneEl.is('ar-mode');

    // Compass heading event listener
    this.heading = null;
    this._onDeviceOrientation = this._onDeviceOrientation.bind(this);
    window.addEventListener('deviceorientationabsolute', this._onDeviceOrientation);

    // Manage the switching betweem the look-controls cam and the AR/VR cam
    this._onEnterVrAr = this._onEnterVrAr.bind(this);
    this._onExitVrAr = this._onExitVrAr.bind(this);
    window.addEventListener('enter-vr', this._onEnterVrAr);
    window.addEventListener('exit-vr', this._onExitVrAr);

    this._onPositionUpdate = this._onPositionUpdate.bind(this);
    window.addEventListener('gps-position-update', this._onPositionUpdate);
  },

  checkDependencies: function () {
    let success = true;
    if ('ondeviceorientationabsolute' in window === false) {
      console.error('Compass absolute orientation not supported by your browser');
      success = false;
    }
    return success;
  },

  remove: function () {
    window.removeEventListener('deviceorientationabsolute', this._onDeviceOrientation);
    window.removeEventListener('gps-position-update', this._onPositionUpdate);
    window.removeEventListener('enter-vr', this._onEnterVrAr);
    window.removeEventListener('exit-vr', this._onExitVrAr);
  },

  _onEnterVrAr: function() {
    this.alwaysInSynch = false;
  },

  _onExitVrAr: function() {
    this.alwaysInSynch = true;
    // We need to set up the plan to the origin when leaving VR/AR mode
    // See _onPositionUpdate method for the why
    this.el.object3D.position.x = 0;
    this.el.object3D.position.z = 0;
  },

  _onPositionUpdate: function (posEvt) {
    if (this.el.sceneEl.is('vr-mode') || this.el.sceneEl.is('ar-mode')) {
      // Cancel the AR/VR position by moving the geo-plane entity
      // Like this, the AR/VR cam position is the new "origin" of the geo-plane.
      const camPos = this.el.sceneEl.camera.el.object3D.position;
      this.el.object3D.position.x = camPos.x;
      this.el.object3D.position.z = camPos.z;
    };
  },

  _onDeviceOrientation: function (event) {
    // ignore no data or non absolute event
    if (!event.alpha) {
      console.error('No alpha data in the Orientation event');
      return;
    }
    if (!event.absolute) {
      console.error('Not an absolute orientation event');
      return;
    };
    const newHeading = this._computeCompassHeading(event.alpha, event.beta, event.gamma);
    if (this.alwaysInSynch || !this.heading) {
      this.heading = newHeading;
      this._updateRotation();
    } else {
      this.heading = newHeading;
    }
  },

  _updateRotation: function () {
    this.el.object3D.rotation.y = THREE.Math.degToRad(this.heading % 360);
  },

  _computeCompassHeading: function (alpha, beta, gamma) {
    const alphaRad = alpha * (Math.PI / 180);
    const betaRad = beta * (Math.PI / 180);
    const gammaRad = gamma * (Math.PI / 180);

    // Calculate A, B, C rotation components
    const cA = Math.cos(alphaRad);
    const sA = Math.sin(alphaRad);
    const sB = Math.sin(betaRad);
    const cG = Math.cos(gammaRad);
    const sG = Math.sin(gammaRad);
    const rA = - cA * sG - sA * sB * cG;
    const rB = - sA * sG + cA * sB * cG;

    // Calculate compass heading
    let compassHeading = Math.atan(rA / rB);
    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }
    compassHeading *= 180 / Math.PI;

    return compassHeading;
  }

});