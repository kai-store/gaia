'use strict';
/* global exports, require */

var utils = require('./utils');

function setWallpaper(settings, config) {
  // Grab the default wallpaper and convert it into a base64 string
  let devpixels = '';
  if (config.GAIA_DEV_PIXELS_PER_PX != '1') {
    devpixels = '@' + config.GAIA_DEV_PIXELS_PER_PX + 'x';
  }

  let wallpaper = utils.resolve(
    utils.joinPath(config.GAIA_DISTRIBUTION_DIR, 'wallpapers',
      'default' + devpixels + '.jpg'), config.GAIA_DIR);

  if (!wallpaper.exists()) {
    wallpaper = utils.resolve(
      utils.joinPath(config.GAIA_DISTRIBUTION_DIR, 'wallpapers', 'default.jpg'),
      config.GAIA_DIR);
  }

  if (!wallpaper.exists()) {
    wallpaper = utils.resolve(
      utils.joinPath(config.GAIA_APP_DIR, 'wallpaper', 'resources', 'wallpaper.jpg'),
      config.GAIA_DIR);
  }
  settings['wallpaper.image'] = utils.getFileAsDataURI(wallpaper);
}

function setTone(settings, config, toneType, name, l10nID) {
  let settingsKey, dir;
  switch (toneType) {
  case 'ringtone':
    settingsKey = 'dialer.ringtone';
    dir = 'shared/resources/media/ringtones/';
    break;
  case 'alerttone':
    settingsKey = 'notification.ringtone';
    dir = 'shared/resources/media/notifications/';
    break;
  default:
    throw new Error('unknown tone type: ' + toneType);
  }

  let tone = utils.resolve(dir + name, config.GAIA_DIR);

  settings[settingsKey] = utils.getFileAsDataURI(tone);
  settings[settingsKey + '.name'] = {l10nID: l10nID};
  settings[settingsKey + '.id'] = settings[settingsKey + '.default.id'] =
    'builtin:' + toneType + '/' + name.replace(/\.\w+$/, '');
}

function setMediatone(settings, config) {
  // Grab notifier_firefox.opus and convert it into a base64 string
  let mediatone_name = 'shared/resources/media/notifications/' +
    'notifier_chime.opus';
  let mediatone = utils.resolve(mediatone_name,
    config.GAIA_DIR);

  settings['media.ringtone'] = utils.getFileAsDataURI(mediatone);
}

function setAlarmtone(settings, config) {
  // Grab ac_awake.opus and convert it into a base64 string
  let alarmtone_name = 'shared/resources/media/alarms/' +
    'ac_awake.opus';
  let alarmtone = utils.resolve(alarmtone_name,
    config.GAIA_DIR);

  settings['alarm.ringtone'] = utils.getFileAsDataURI(alarmtone);
}

function setRingtone(settings, config) {
  // Grab ringer_firefox.opus and convert it into a base64 string
  let ringtone_name = 'ringer_blove.ogg';
  let ringtone_l10nID = 'ringer_blove';
  setTone(settings, config, 'ringtone', ringtone_name, ringtone_l10nID);
}

function setNotification(settings, config) {
  // Grab notifier_firefox.opus and convert it into a base64 string
  let notification_name = 'notifier_chime.opus';
  let notification_l10nID = 'notifier_chime';
  setTone(settings, config, 'alerttone', notification_name,
          notification_l10nID);
}

/* Setup the default keyboard layouts according to the current language */
function setDefaultKeyboardLayouts(lang, settings, config) {
  let layoutConfigFile = utils.resolve(
    utils.joinPath('shared', 'resources', 'keyboard_layouts.json'),
    config.GAIA_DIR);

  let layoutConfig = utils.getJSON(layoutConfigFile);
  let keyboardLayouts = layoutConfig.layout;

  if (!keyboardLayouts) {
    utils.log('default keyboard layouts are not defined: ' +
              layoutConfigFile.path + '\n');
    return;
  }

  // Get the default layouts for the specified language
  let defaultLayoutList = keyboardLayouts[lang];
  if (!defaultLayoutList) {
    utils.log('Cannot find default layout list for language: ' + lang + '\n');
    defaultLayoutList = keyboardLayouts['en-US'];
  }

  let keyboardSettings = {};

  function addLayoutEntry(layout) {
    let manifestURL = layout.appManifestURL;

    if (!keyboardSettings[manifestURL]) {
      keyboardSettings[manifestURL] = {};
    }

    keyboardSettings[manifestURL][layout.layoutId] = true;
  }

  defaultLayoutList.forEach(addLayoutEntry);

  // Also add language-independent layouts into the sets
  let langIndependentLayoutList = layoutConfig.langIndependentLayouts;
  langIndependentLayoutList.forEach(addLayoutEntry);

  settings['keyboard.enabled-layouts'] = keyboardSettings;
  settings['keyboard.default-layouts'] = keyboardSettings;
}

function setDefaultKeypadSettings(settings) {
  settings['keypad.t9-enabled'] = true;
  settings['keypad.active-mode'] = 'abc';
  settings['keypad.layouts.english'] = true;
}

function deviceTypeSettings(settings, config) {
  // See if any override file exists and eventually override settings
  let override = utils.getFile(config.GAIA_DIR,
                  'build', 'config', config.GAIA_DEVICE_TYPE, 'settings.json');
  if (override.exists()) {
    let content = utils.getJSON(override);
    for (let key in content) {
      settings[key] = content[key];
    }
  }
}

function overrideRingtoneSettings(content, key) {
  // Override ringtone if ringtone, ringtone name, and ringtone ID properties
  // are available.
  if (content[key] && content[key + '.name'] && content[key + '.id']) {
    content[key + '.default.id'] = content[key + '.id'];
  } else if (content[key] || content[key + '.name'] || content[key + '.id']) {
    delete content[key];
    delete content[key + '.name'];
    delete content[key + '.id'];
    delete content[key + '.default.id'];
    throw new Error('ringtone not overridden because ' + key + ', ' +
                    key + '.name, or ' + key + '.id not found in custom ' +
                    '\'settings.json\'. All properties must be set.');
  }
}

function overrideSettings(settings, config) {
  // See if any override file exists and eventually override settings
  let override = utils.resolve(config.SETTINGS_PATH,
    config.GAIA_DIR);
  if (override.exists()) {
    let content = utils.getJSON(override);

    overrideRingtoneSettings(content, 'dialer.ringtone');
    overrideRingtoneSettings(content, 'notification.ringtone');

    for (let key in content) {
      settings[key] = content[key];
    }
  }
}

function setHomescreenURL(settings, config) {
  let appName = 'launcher';

  if (typeof(settings['homescreen.appName']) !== 'undefined') {
    appName = settings['homescreen.appName'];

    let homescreenExists = utils.existsInAppDirs(config.GAIA_APPDIRS, appName);

    if (!homescreenExists) {
      throw new Error('homescreen APP not found: ' + appName);
    }
    // no longer to use this settings so remove it.
    delete settings['homescreen.appName'];
  }
  settings['homescreen.manifestURL'] = utils.gaiaManifestURL(appName,
    config.GAIA_SCHEME, config.GAIA_DOMAIN, config.GAIA_PORT);
}

function setKaiOSUrl(settings) {
  // for kaios-plus.
  let cu = settings['deviceinfo.cu'];
  settings['apps.serviceCenter.manifest'] =
    settings['apps.serviceCenterUrl'] + '/apps/kaiosplus?cu=' + cu;
}

function writeSettings(settings, config) {
  // Finally write the settings file
  let profileDir = utils.getFile(config.PROFILE_DIR);
  let settingsFile = utils.getFile(config.PROFILE_DIR, 'settings.json');
  let defaultsSettings = utils.getFile(
    config.PROFILE_DIR, 'defaults', 'settings.json');

  utils.ensureFolderExists(profileDir);
  let content = JSON.stringify(settings);
  utils.writeContent(settingsFile, content + '\n');
  utils.log('settings.js', 'Writing settings file: ' + settingsFile.path);

  profileDir.append('defaults');
  utils.ensureFolderExists(profileDir);
  utils.writeContent(defaultsSettings, content + '\n');
  utils.log('settings.js', 'Writing settings file: ' + defaultsSettings.path);
}

function execute(config) {
  var settingsFile = utils.getFile(config.GAIA_DIR, 'build', 'config',
    'common-settings.json');

  if (!settingsFile.exists()) {
    throw new Error('file not found: ' + settingsFile.path);
  }

  var settings = utils.getJSON(settingsFile);
  if (config.TARGET_BUILD_VARIANT != 'user') {
    // We want the console to be disabled
    // for device builds using the user variant.
    settings['debug.console.enabled'] = true;

    // Activate developer menu under the system menu when long pressing
    // the power button by default for devs.
    settings['developer.menu.enabled'] = true;
  }

  // Set the ftu manifest URL
  if (config.NOFTU === '0') {
    settings['ftu.manifestURL'] = utils.gaiaManifestURL('ftu',
      config.GAIA_SCHEME, config.GAIA_DOMAIN, config.GAIA_PORT);
  }

  // Set the ftu manifest URL
  if (config.KEYPAD === '1') {
    settings['keypad.enabled'] = true;
  }

  // Set the ftu ping URL -- we set this regardless of NOFTU for now
  settings['ftu.pingURL'] = config.FTU_PING_URL;

  // Whether or not performance and usage data are shared by default
  settings['debug.performance_data.shared'] = config.SHARE_PERF_USAGE === '1';

  // Set the rocketbar URL
  settings['rocketbar.searchAppURL'] = utils.gaiaOriginURL('search',
    config.GAIA_SCHEME, config.GAIA_DOMAIN, config.GAIA_PORT) + '/index.html';

  // Set the new tab-page URL
  settings['rocketbar.newTabAppURL'] = utils.gaiaOriginURL('search',
    config.GAIA_SCHEME, config.GAIA_DOMAIN, config.GAIA_PORT) + '/index.html';

  settings['debugger.remote-mode'] = config.REMOTE_DEBUGGER === '1' ?
    'adb-only' : 'disabled';

  if (config.PRODUCTION === '1') {
    settings['feedback.url'] = 'https://input.mozilla.org/api/v1/feedback/';
    settings['debugger.remote-mode'] = 'disabled';
    settings['gaia.system.checkForUpdates'] = true;
  }

  settings['language.current'] = config.GAIA_DEFAULT_LOCALE;

  if (config.DEVICE_DEBUG === '1') {
    settings['debugger.remote-mode'] = 'adb-devtools';
  }

  if (config.NO_LOCK_SCREEN === '1') {
    settings['lockscreen.enabled'] = false;
    settings['lockscreen.locked'] = false;
  }

  var screenTimeout = parseInt(config.SCREEN_TIMEOUT);
  if (screenTimeout >= 0) {
    settings['screen.timeout'] = screenTimeout;
  }

  // There is no keyboard apps in release.
  // default layout will be set in distribution/settings.json 
  //setDefaultKeyboardLayouts(config.GAIA_DEFAULT_LOCALE, settings, config);
  setDefaultKeypadSettings(settings);

  var queue = utils.Q.defer();
  queue.resolve();

  var result = queue.promise.then(function() {
    setWallpaper(settings, config);
  }).then(function() {
    setMediatone(settings, config);
  }).then(function() {
    setAlarmtone(settings, config);
  }).then(function() {
    setRingtone(settings, config);
  }).then(function() {
    setNotification(settings, config);
  }).then(function() {
    deviceTypeSettings(settings, config);
  }).then(function() {
    overrideSettings(settings, config);
  }).then(function() {
    setHomescreenURL(settings, config);
  }).then(function() {
    setKaiOSUrl(settings);
  }).then(function() {
    writeSettings(settings, config);
    return settings;
  });

  // Ensure not quitting xpcshell before all asynchronous code is done
  utils.processEvents(function(){return {wait : false};});

  return result;
}
exports.execute = execute;
exports.setWallpaper = setWallpaper;
exports.setMediatone = setMediatone;
exports.setAlarmtone = setAlarmtone;
exports.setRingtone = setRingtone;
exports.setNotification = setNotification;
exports.deviceTypeSettings = deviceTypeSettings;
exports.overrideSettings = overrideSettings;
exports.writeSettings = writeSettings;
exports.setDefaultKeyboardLayouts = setDefaultKeyboardLayouts;
exports.setHomescreenURL = setHomescreenURL;