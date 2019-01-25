/* exported GestureDetector */

'use strict';

/**
 * hardkey.js: generate hard key event for feature phone.
 */
var keyCmdATT = ['jrdcmLSK', 'jrdcmRSK', 'jrdcmFn', 'jrdcmBack', 'jrdcmNotify',
              'jrdcmLeft', 'jrdcmRight', 'jrdcmUp', 'jrdcmDn', 'jrdcmOk',
              'jrdcmLeft', 'jrdcmRight', 'jrdcmUp', 'jrdcmDn',
              'jrdcm1', 'jrdcm2', 'jrdcm3', 'jrdcm4', 'jrdcm5',
              'jrdcm6', 'jrdcm7', 'jrdcm8', 'jrdcm9', 'jrdcm0',
              'jrdcmPhone', 'jrdcmHangUp', 'jrdcmPound', 'jrdcmMulti', 'jrdcmClr'
             ];

var keyCmdGC = ['', '', 'jrdcm5Star', 'jrdcmNo', '',
              '', '', 'jrdcmUp', 'jrdcmDn', 'jrdcmYes',
              '', '', 'jrdcmUp', 'jrdcmDn',
              'jrdcm1', 'jrdcm2', 'jrdcm3', 'jrdcm4', 'jrdcm5',
              'jrdcm6', 'jrdcm7', 'jrdcm8', 'jrdcm9', 'jrdcm0',
              '', '', 'jrdcmPound', 'jrdcmMulti', ''
             ];


var keyCode = ['F1', 'F2', '5Star', 'BrowserBack', 'F3',
               'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter',
               'Left', 'Right', 'Up', 'Down',
               '1', '2', '3', '4', '5',
               '6', '7', '8', '9', '0',
               'F5', 'End', '*', '#', 'F8'
              ];
var keyStyle;
var iframeFocusNode = null;
function ConvertToCmd(keycode) {
  for(var i in keyCode) {
    if (keyCode[i] == keycode) {
      if (keyStyle != 'GC') {
        dump('cgq ConvertToCmd ' + keyCmdATT[i]);
        return keyCmdATT[i];
      } else {
        dump('cgq ConvertToCmd ' + keyCmdGC[i]);
        return keyCmdGC[i];
      }
    }
  }
  return '';
}

navigator.mozSettings.addObserver('keyboard.style', function getState(e) {
  keyStyle = e.settingValue;
});

var req = window.navigator.mozSettings.createLock().get('keyboard.style');
req.onsuccess = function bt_EnabledSuccess() {
  keyStyle = req.result['keyboard.style'];
};

window.addEventListener('keydown', function(event) {
  dump('cgq ' + event.key);
  var e = document.activeElement;
  /*
  for (var i in keyCode) {
    if (keyCode[i] == event.key) {
      if (keyStyle == 'AT&T') {
        dump('cgq dispatchEvent ' + keyCmdATT[i]);
        window.dispatchEvent(new CustomEvent(keyCmdATT[i]));
      } else {
        dump('cgq dispatchEvent ' + keyCmdGC[i]);
        window.dispatchEvent(new CustomEvent(keyCmdGC[i]));
      }
      break;
    }
  }
  */

  switch (event.key) {
    case 'Up':
    case 'ArrowUp':
      // Do something for "VolumeUp" key press.
      var allNodes = document.getElementsByTagName('*');
      var length = allNodes.length;
      var i;
      var node;
      var flag = false;
      var style;
      for (i = length - 1; i >= 0; i--) {
        node = allNodes[i];
        style = window.getComputedStyle(node);
        if (flag && elementCanFocused(node) && !elementIsHide(node)) {
          break;
        }
        if (!iframeFocusNode && node == e || iframeFocusNode == node) {
          if (flag) {
            break;
          }
          flag = true;
          iframeFocusNode = null;
        }
        if (i == 0)
          i = length;
      }
      dump('changefocus pre ' + node.id + ' is focus');
      dump('changefocus tabIndex ' + node.tabIndex);
      if (node.tagName == 'IFRAME') {
        if (node.contentDocument) {
          iframeFocusNode = node;
          node.contentDocument.body.focus();
        } else {
          break;
        }
      } else {
        node.focus();
      }

      event.preventDefault();
      break;
    case "Down":
    case "ArrowDown":
      // Do something for "VolumeDown" key press.
      var allNodes = document.getElementsByTagName('*');
      var length = allNodes.length;
      var i;
      var node;
      var flag = false;
      var style;
      for (i = 0; i < length; i++) {
        node = allNodes[i];
        style = window.getComputedStyle(node);
        if (flag && elementCanFocused(node) && !elementIsHide(node)) {
          break;
        }
        if (!iframeFocusNode && node == e || iframeFocusNode == node) {
          if (flag) {
            break;
          }
          flag = true;
          iframeFocusNode = null;
        }
        if (i == length - 1)
          i = -1;
      }
      dump('changefocus next  ' + node.id + ' is focus');
      dump('changefocus tabIndex ' + node.tabIndex);
      if (node.tagName == 'IFRAME') {
        if (node.contentDocument) {
          iframeFocusNode = node;
          node.contentDocument.body.focus();
        } else {
          break;
        }
      } else {
        node.focus();
      }

      event.preventDefault();
      break;
  }
});

function elementIsHide(e) {
  var style;
  while(e && e.style) {
    style = window.getComputedStyle(e);
    if (style.display == 'none' || style.visibility == 'hidden') {
      return true;
    }
    e = e.parentNode;
  }
  return false;
}

function elementCanFocused(e) {
  if (e.tabIndex != -1 && e.jrdFocus == true && e.disabled != true) {
    return true;
  }
  return false;
}

