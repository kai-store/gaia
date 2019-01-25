'use strict';

/* globals SettingsListener */

var ExtActivityController = function(config) {
  this.controlKey = null;
  if ((config !== undefined ) && (config != null)) {
    if (config.controlKey) {
      this.controlKey = config.controlKey;
    } else {
      this.activityName = config.activityName;
      this.activityType = config.activityType;
      this.controlKey = null;
    }
  }
  this.cbHandlers = [];
  this.onControlSettingChange = this.onControlSettingChange.bind(this);
};

ExtActivityController.prototype.constructor = ExtActivityController;

ExtActivityController.ACTIVITY_CONTROL_SETTING_NAME = 'activity_state_control';
ExtActivityController.REQUEST_KILL = 'kill';
ExtActivityController.REQUEST_NONE = null;

ExtActivityController.createByNameType = function(activityName, activityType) {
  var config = {
    activityName: activityName,
    activityType: activityType,
  };
  return new ExtActivityController(config);
};

ExtActivityController.createByControlKey = function(controlKey) {
  var config = {
    controlKey: controlKey
  };
  return new ExtActivityController(config);
};

ExtActivityController.compareControlKeys =
  function eacc_compareControlKey(cntlKey1, cntlKey2) {
    var equal = (cntlKey1.length === cntlKey2.length);
    if (equal) {
      for (var key in cntlKey1, equal) {
        equal = (cntlKey1[key] === cntlKey2[key]);
      }
    }
    return equal;
};

ExtActivityController.prototype.onControlSettingChange = function (controlSettingValue) {
  if (controlSettingValue !== null) {
    //TODO - unite the conditions below in...a single probably
    if (!this.controlKey ||
        (this.controlKey && ExtActivityController.compareControlKeys(
                                                    this.controlKey,
                                                    controlSettingValue.controlKey))) {
      if (typeof controlSettingValue.controlRequest === 'string') {
        if (typeof this.cbHandlers[controlSettingValue.controlRequest] === 'function') {
          var self = this;
          self.cbHandlers[controlSettingValue.controlRequest](controlSettingValue.controlKey);
        }
      }
    }
  }
};


ExtActivityController.prototype.observeControlRequest = function() {
  this.isObserverActive = true;

  var self = this;
    LazyLoader.load(
      ['/shared/js/settings_listener.js'],
      function done() {
        var sself = self;
        self.clearRequest(function () {
          SettingsListener.observe(
            ExtActivityController.ACTIVITY_CONTROL_SETTING_NAME,
            null,
            sself.onControlSettingChange
          );
        });
      }
    );
};

ExtActivityController.prototype.unobserveControlRequest = function() {
  SettingsListener.unobserve(
    ExtActivityController.ACTIVITY_CONTROL_SETTING_NAME,
    this.onControlSettingChange
  );
};

ExtActivityController.prototype.addControlRequestHandler = function(cr, cb) {
  if (!this.isObserverActive) {
    this.isObserverActive = true;
    this.observeControlRequest();
  }
  this.cbHandlers[cr] = cb;
};

ExtActivityController.prototype.removeControlRequestHandler = function(cr) {
  this.cbHandlers[cr] = null;
  if (this.isObserverActive) {
    this.cbHandlers = [];
    this.unobserveControlRequest();
    this.isObserverActive = false;
  }
};

ExtActivityController.prototype.addKillRequestHandler = function(cb) {
  this.addControlRequestHandler(ExtActivityController.REQUEST_KILL, cb);
};

ExtActivityController.prototype.removeKillRequestHandler = function() {
  this.removeControlRequestHandler(ExtActivityController.REQUEST_KILL);
};

ExtActivityController.prototype.generateControlKey =
  function eacc_generateControlKey(app_origin, app_manifestURL) {
    var timestamp = new Date().getTime();

    this.controlKey = {
        name: this.activityName,
        type: this.activityType,
        timestamp: timestamp,
        initiator_origin: app_origin,
        initiator_manifestURL: app_manifestURL
    };
};

ExtActivityController.prototype.registerControlKey =
  function eacc_registerControlKey(cb) {
      var self = this;
      navigator.mozApps.getSelf().onsuccess = function() {
        var app = this.result;
        self.generateControlKey(app.origin, app.manifestURL);
        if (typeof cb === 'function') {
          cb(self.controlKey);
        }
      };
};

ExtActivityController.prototype.unregisterControlKey =
  function eacc_unregisterControlKey() {
    this.controlKey = null;
};

ExtActivityController.prototype.setControlRequest =
  function eacc_setControlRequest(requestValue, cb) {
      var controlSettingValue = {
          controlKey: this.controlKey,
          controlRequest: requestValue
        };

      var settingObject = {};
      settingObject[ExtActivityController.ACTIVITY_CONTROL_SETTING_NAME] = controlSettingValue;
      var req = SettingsListener.getSettingsLock().set(settingObject);
      if (typeof cb === 'function') {
        req.onsuccess = cb;
      }
};

ExtActivityController.prototype.requestKill =
  function eacc_requestKill() {
    this.setControlRequest(ExtActivityController.REQUEST_KILL, this.unregisterControlKey.bind(this));
};

ExtActivityController.prototype.clearRequest =
  function eacc_clearRequest(cb) {
    this.setControlRequest(ExtActivityController.REQUEST_NONE, cb);
};