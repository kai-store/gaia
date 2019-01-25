'use strict';

/* exported Curtain */

var Curtain = (function () {
  var _onShow;
  var softkeyPanel;
  var _ = navigator.mozL10n.get;

  var curtainFrame = parent.document.querySelector('#fb-curtain');
  var doc = curtainFrame.contentDocument;

  var cpuWakeLock, cancelButton, retryButton, okButton, progressElement, form,
    progressTitle;
  var messages = [];
  var elements = ['error', 'timeout', 'wait', 'message', 'progress', 'alert', 'wait2'];
  var infoEl;
  if (doc.readyState === 'complete') {
    init();
  } else {
    // The curtain could not be loaded at this moment
    curtainFrame.addEventListener('load', function loaded() {
      curtainFrame.removeEventListener('load', loaded);
      init();
    });
  }

  function init() {
    retryButton = doc.querySelector('#retry');
    okButton = doc.querySelector('#ok');
    progressElement = doc.querySelector('#progressElement');

    form = doc.querySelector('form');

    elements.forEach(function createElementRef(name) {
      messages[name] = doc.getElementById(name + 'Msg');
    });
    progressTitle = doc.getElementById('progressTitle');

    window.addEventListener('keydown', (e) => {
      if ('BrowserBack' === e.key || 'Backspace' === e.key) {
        e.preventDefault();
      }
    });
  }

  function doShow(type) {
    form.classList.remove('no-menu');
    form.dataset.state = type;
    curtainFrame.classList.add('visible');
    curtainFrame.classList.remove('fade-out');
    curtainFrame.classList.add('fade-in');
    if (_onShow) {
      _onShow();
      _onShow = null;
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function Progress(pfrom) {
    var from = pfrom;
    var counter = 0;
    var total = 0;

    progressElement.setAttribute('value', 0);

    function showMessage() {
      navigator.mozL10n.setAttributes(
        messages.progress,
        'progressFB', {
          current: counter,
          total: total
        }
      );
    }

    this.update = function () {
      progressElement.setAttribute('value', (++counter * 100) / total);
      showMessage();
    };

    this.setFrom = function (pfrom) {
      from = capitalize(pfrom);
      progressTitle.textContent = _('progressFB3' + from + 'Title');
    };

    this.setTotal = function (ptotal) {
      total = ptotal;
      showMessage();
    };

    /**
     *  Returns the current value
     */
    this.getValue = function () {
      return counter;
    };
  }

  var renderInfo = function (type, infoTxt) {
    infoEl || (infoEl = doc.getElementById(type).querySelector('p > span'));
    infoEl && (infoEl.textContent = infoTxt);
  };

  var showCuratianSoftKey = function (title) {
    //todo init soft buttons
    title = title || 'ok';
    var priority = title === 'curtainCancel' ? 1 : 2;
    var icon = priority > 1 ? 'ok' : null;
    var softkeyActions = {
      header: '',
      items: [{
        l10nId: title || 'ok',
        icon: icon,
        method: function () {
          softkeyPanel.destroy();
          okButton.click();
        },
        name: 'Cancel',
        priority: priority
      }]
    };
    softkeyPanel = new SoftkeyPanel(softkeyActions, null, doc.querySelector('body'));
    softkeyPanel.show();
  };

  return {

    updateMessage: function(type, l10nId) {
      messages[type].textContent = _(l10nId);
    },

    /**
     *  Shows the curtain
     *
     *  @param {String} type
     *    Curtain type oneOf('wait', 'timeout', 'error',
     *    'message' and 'progress').
     *
     *  @param {String} from
     *    The origin of the message.
     *
     *  @return {Object} progress. When 'type' === 'progress' .
     *  This object defines an <update> method to refresh the progress bar UI.
     *
     */
    show: function (type, from, info) {
      var out;

      (type !== 'wait2') && (from = capitalize(from));

      switch (type) {
      case 'wait':
        messages[type].textContent = '';
        break;

      case 'timeout':
        messages[type].textContent = _('timeout1', {
          from: _('timeout' + from)
        });
        break;

      case 'error':
        messages[type].textContent = _('error1', {
          from: _(type + from)
        });
        break;

      case 'alert':
      case 'message':
        messages[type].textContent = _(type + from);
        break;

      case 'progress':
        progressTitle.textContent = _(type +
	    'FB3' + window.oauthflow.serviceName + 'Title');
        out = new Progress(from);
        cpuWakeLock = navigator.requestWakeLock('cpu');
        break;

      case 'wait2':
        messages[type].textContent = _(from);
        break;
      }
      info && renderInfo(type, _(info));
      doShow(type);
      return out;
    },

    /**
     *  Hides the curtain
     *
     *  @param {Function} hiddenCB
     *    triggered when the curtain has been hidden.
     *
     */
    hide: function c_hide(hiddenCB) {
      if (cpuWakeLock) {
        cpuWakeLock.unlock();
        cpuWakeLock = null;
      }

      curtainFrame.classList.add('fade-out');
      curtainFrame.addEventListener('animationend', function cu_fadeOut(ev) {
        curtainFrame.removeEventListener('animationend', cu_fadeOut);
        curtainFrame.classList.remove('visible');
        curtainFrame.classList.remove('fade-out');
        curtainFrame.classList.remove('fade-in');
        delete form.dataset.state;
        if (typeof hiddenCB === 'function') {
          hiddenCB();
        }
      });
    },

    /**
     *  Allows to set a event handler that will be invoked when the user
     *  cancels the operation ongoing
     *
     *  @param {Function} cancelCb . Event handler.
     *
     */
    set oncancel(cancelCb) {
    },

    /**
     *  Allows to set a event handler that will be invoked when the user
     *  retries the operation ongoing
     *
     *  @param {Function} retryCb . Event handler.
     *
     */
    set onretry(retryCb) {
      if (typeof retryCb === 'function') {
        retryButton.onclick = function on_retry(e) {
          delete retryButton.onclick;
          retryCb();
          return false;
        };
      }
    },

    /**
     *  Allows to set a event handler that will be invoked when the user
     *  clicks on ok button
     *
     *  @param {Function} okCb . Event handler.
     *
     */
    set onok(okCb) {
      if (typeof okCb === 'function') {
        okButton.onclick = function on_ok(e) {
          delete okButton.onclick;
          okCb();
          return false;
        };
      }
    },

    /**
     *  Returns the visibility state of the curtain
     *
     *  @return {boolean} visibility state.
     *
     */
    get visible() {
      return curtainFrame.classList.contains('visible');
    },

    /**
     *  Hides the menu
     */
    hideMenu: function c_hideMenu() {
      form.classList.add('no-menu');
    },

    set onShow(call) {
      _onShow = call;
    },

    showSoftKey: showCuratianSoftKey,
    destroySoftKey: function destroySoftKey() {
      if(typeof softkeyPanel === 'object' ) {
        softkeyPanel.destroy();
      }
    }
  };

})();