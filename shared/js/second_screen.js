'use strict';

(function (exports) {

    var SecondScreen = {

      showMessage: function(msg) {
        this._sendMsg(msg);
      },

      clearMessages: function() {
        this._sendMsg({
          reason: "Clear"
        });
      },

      _sendMsg: function(msg) {
        var self = navigator.mozApps.getSelf();
        self.onsuccess = function() {
          var app = this.result;
          if (app.origin === "app://system.gaiamobile.org") {
            //the same app - event
            window.dispatchEvent(new CustomEvent('second-screen-message', {
              detail:{
                type:'second-screen-message',
                message: {
                  id: app.origin,
                  message: msg
                }
              }
            }));
          } else {
            //another app - iac
            if (!app.connect) {
              // in such case we can't use IAC
              console.warn('Can not initialise IAC');
              return;
            }
            app.connect("SecondScreen").then(function(ports) {
              ports.forEach(function(port) {
                port.postMessage({
                  id: app.origin,
                  message: msg
                });
              });
            }, function _onConnectReject(data) {
              console.warn('Connection reject - ' + data);
            });
          }
        };
        self.onerror = function() {
          console.error('getSelf returned error');
        };
      }
    };

    exports.SecondScreen = SecondScreen;

})(window);
