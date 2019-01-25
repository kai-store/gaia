'use strict';

/* global */

(function(exports) {

var KeypadHelper = function() {
  this.t9Enabled = null;
  this.layouts = null;
  this.activeLayout = null;
  this.activeMode = null;
};

KeypadHelper.prototype.DISPLAY_LANGUAGES = {
  'english': 'English',
  'spanish': 'Español',
  'french': 'Français',
  'hindi':'हिन्दी',
  'assamese': 'অসমীয়া',
  'bengali': 'বাংলা',
  'gujarati': 'ગુજરાતી',
  'marathi': 'मराठी',
  'telugu': 'తెలుగు',
  'tamil': 'தமிழ்',
  'malayalam': 'മലയാളം',
  'punjabi': 'ਪੰਜਾਬੀ',
  'odia': 'ଓଡ଼ିଆ',
  'kannada': 'ಕನ್ನಡ',
  'nepali': 'नेपाली',
  'konkani': 'कोंकणी',
  'maithili': 'मैथिली',
  'dogri': 'डोगरी',
  'sindhi': 'सिन्धी',
  'sanskrit': 'संस्कृत',
  'manipuri': 'মণিপুরী',
  'bodo': 'बोड़ो',
  'santali': 'ᱥᱟᱱᱛᱟᱞᱤ'
};

KeypadHelper.prototype.LANGUAGES_ICON_TEXT = {
  'hindi':'हि',
  'assamese': 'অস',
  'bengali': 'বাং',
  'gujarati': 'ક',
  'marathi': 'ळ',
  'telugu': 'కే',
  'tamil': 'க',
  'malayalam': 'ക',
  'punjabi': 'ਕ',
  'odia': 'କ',
  'kannada': 'ಕೆ',
  'nepali': 'नेपा',
  'konkani': 'कों',
  'maithili': 'मैथ',
  'dogri': 'डो',
  'sindhi': 'सि',
  'sanskrit': 'संस',
  'manipuri': 'মণি',
  'bodo': 'बर',
  'santali': 'ᱟ'
};

KeypadHelper.prototype.SETTINGS_KEYS = {
  T9_ENABLED: 'keypad.t9-enabled',
  EN_US: 'keypad.layouts.english',
  ES_US: 'keypad.layouts.spanish',
  FR_CA: 'keypad.layouts.french',
  HI_IN: 'keypad.layouts.hindi',
  AS_IN: 'keypad.layouts.assamese',
  BN_IN: 'keypad.layouts.bengali',
  GU_IN: 'keypad.layouts.gujarati',
  MR_IN: 'keypad.layouts.marathi',
  TE_IN: 'keypad.layouts.telugu',
  TA_IN: 'keypad.layouts.tamil',
  ML_IN: 'keypad.layouts.malayalam',
  PN_IN: 'keypad.layouts.punjabi',
  OD_IN: 'keypad.layouts.odia',
  KA_IN: 'keypad.layouts.kannada',
  NE_IN: 'keypad.layouts.nepali',
  KO_IN: 'keypad.layouts.konkani',
  MA_IN: 'keypad.layouts.maithili',
  DO_IN: 'keypad.layouts.dogri',
  SI_IN: 'keypad.layouts.sindhi',
  SA_IN: 'keypad.layouts.sanskrit',
  MN_IN: 'keypad.layouts.manipuri',
  BO_IN: 'keypad.layouts.bodo',
  SN_IN: 'keypad.layouts.santali',
  ACTIVE_LAYOUT: 'keypad.active-layout',
  ACTIVE_MODE: 'keypad.active-mode'
};

KeypadHelper.prototype.getDisplayLanguageName = function(key) {
  key = key.split('keypad.layouts.')[1];
  return this.DISPLAY_LANGUAGES[key];
};

KeypadHelper.prototype.start = function() {
  this._startComponents();
};

KeypadHelper.prototype._startComponents = function() {
  this.mozSettings = window.navigator.mozSettings;

  this._observeSettings();
};

KeypadHelper.prototype._observeSettings = function() {
  var handler = (event) => {
    var key = event.settingName;
    var value = event.settingValue;

    this._stashSettings(key, value, {notify: true});
  };

  for (var prop in this.SETTINGS_KEYS) {
    var key = this.SETTINGS_KEYS[prop];
    this.mozSettings.addObserver(key, handler);
  }
};

KeypadHelper.prototype.getSettings = function() {
  return new Promise((resolve, reject) => {
    var promises = [];

    for (var prop in this.SETTINGS_KEYS) {
      var key = this.SETTINGS_KEYS[prop];
      var lock = this.mozSettings.createLock();

      var promise = new Promise((resolve, reject) => {
        lock.get(key).onsuccess = (event) => {
          var result = event.target.result;
          var key, value;

          if (result) {
            for (var prop in result) {
              key = prop;
              value = result[prop];
            }

            this._stashSettings(key, value);
            resolve();
          } else {
            reject();
          }
        };
      });

      promises.push(promise);
    }

    Promise.all(promises).then(() => {
      var result = {
        t9Enabled: this.t9Enabled,
        layouts: this.layouts,
        activeLayout: this.activeLayout,
        activeMode: this.activeMode
      };
      resolve(result);
    }).catch((reason) => {
      console.log(reason);
      reject();
    });
  });
};

KeypadHelper.prototype._stashSettings = function(key, value, option) {
  switch (key) {
    case this.SETTINGS_KEYS.T9_ENABLED:
      this.t9Enabled = value;

      if (option && option.notify && this.t9ChangedCallback) {
        this.t9ChangedCallback(value);
      }
      break;
    case this.SETTINGS_KEYS.ACTIVE_LAYOUT:
      this.activeLayout = value;

      if (option && option.notify && this.activeLayoutChangedCallback) {
        this.activeLayoutChangedCallback(value);
      }
      break;
    case this.SETTINGS_KEYS.ACTIVE_MODE:
      this.activeMode = value;

      if (option && option.notify && this.activeModeChangedCallback) {
        this.activeModeChangedCallback(value);
      }
      break;
    default:
      if (!this.layouts) {
        this.layouts = new Map();
      }

      if (key) {
        this.layouts.set(key, value);
      }

      if (option && option.notify && this.layoutsChangedCallback) {
        this.layoutsChangedCallback(this.layouts);
      }
      break;
  }

  if (option && option.save) {
    this._saveSettings(key, value);
  }
};

KeypadHelper.prototype._saveSettings = function(key, value) {
  var lock = this.mozSettings.createLock();
  var setting = {};
  setting[key] = value;
  lock.set(setting);
};

KeypadHelper.prototype.setT9Enabled = function(option) {
  this._stashSettings(this.SETTINGS_KEYS.T9_ENABLED, option, {save: true});
};

KeypadHelper.prototype.setLayoutEnabled = function(layout, option) {
  this._stashSettings(this.SETTINGS_KEYS[layout], option, {save: true});
};

KeypadHelper.prototype.setActiveLayout = function(layout) {
  this._stashSettings(this.SETTINGS_KEYS.ACTIVE_LAYOUT, layout, {save: true});
};

KeypadHelper.prototype.setActiveMode = function(mode) {
  this._stashSettings(this.SETTINGS_KEYS.ACTIVE_MODE, mode, {save: true});
};

KeypadHelper.prototype.getT9Enabled = function() {
  return new Promise((resolve, reject) => {
    if (this.t9Enabled === null) {
      this.getSettings().then((result) => {
        resolve(result.t9Enabled);
      });
    } else {
      resolve(this.t9Enabled);
    }
  });
};

KeypadHelper.prototype.getLayouts = function() {
  return new Promise((resolve, reject) => {
    if (this.layouts === null) {
      this.getSettings().then((result) => {
        resolve(result.layouts);
      });
    } else {
      resolve(this.layouts);
    }
  });
};

KeypadHelper.prototype.getActiveLayout = function() {
  return new Promise((resolve, reject) => {
    if (this.activeLayout === null) {
      this.getSettings().then((result) => {
        resolve(result.activeLayout);
      });
    } else {
      resolve(this.activeLayout);
    }
  });
};

KeypadHelper.prototype.getActiveMode = function() {
  return new Promise((resolve, reject) => {
    if (this.activeMode === null) {
      this.getSettings().then((result) => {
        resolve(result.activeMode);
      });
    } else {
      resolve(this.activeMode);
    }
  });
};

KeypadHelper.prototype.setT9ChangedCallback = function(callback) {
  this.t9ChangedCallback = callback;
};

KeypadHelper.prototype.setLayoutsChangedCallback = function(callback) {
  this.layoutsChangedCallback = callback;
};

KeypadHelper.prototype.setActiveLayoutChangedCallback = function(callback) {
  this.activeLayoutChangedCallback = callback;
};

KeypadHelper.prototype.setActiveModeChangedCallback = function(callback) {
  this.activeModeChangedCallback = callback;
};

exports.KeypadHelper = KeypadHelper;

})(window);
