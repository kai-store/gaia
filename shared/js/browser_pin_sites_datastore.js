/* globals Promise */

(function(exports) {
  'use strict';

  var BrowserPinSitesDataStore = function() {
    this.start();
  };

  // BrowserPinSitesDataStore stores data which is generated from Search app.
  // Currently we only have 'pinned_sites'.
  // 'pinned_sites' is an array of pinned site objects.
  // A pinned site object might look like this:
  // {
  //   url: 'http://mypinnedsite.com',
  //   title: 'Website title',
  //   screenshot: <Blob>
  //   tile: tileObject
  // }
  BrowserPinSitesDataStore.prototype = {
    DEBUG: false,
    name: 'browserPinSitesDataStore',

    STORE_NAME: 'browser_store',

    MAXIMUM_NUMBER_OF_PINNED_SITES: 100,

    start: function() {
      return this._getStore();
    },

    stop: function() {
      this._store = undefined;
    },

    _getStore: function() {
      return new Promise((resolve, reject) => {
        if (this._store) {
          resolve(this._store);
          return;
        }
        navigator.getDataStores(this.STORE_NAME).then((stores) => {
          this._store = stores[0];
          resolve(this._store);
        }, () => {
          var reason = 'Unable to get datastore "' + this.STORE_NAME + '"';
          reject(reason);
          console.warn(reason);
        });
      });
    },

    getPinSites: function() {
      return this._getStore().then((store) => {
        return store.get('pinned_sites');
      });
    },

    savePinSite: function(pinSite) {
      return this.getPinSites().then((pinSites) => {
        var result = 'unknown';
        var targetIndex = -1;
        if (pinSites) {
          // has pinned sites
          pinSites.some((site, index) => {
            if (site.url === pinSite.url) {
              targetIndex = index;
              return true;
            }
          });

          if (targetIndex > -1) {
            result = 'wasPinnedBefore';
            // remove the exist pinned site
            pinSites.splice(targetIndex, 1);
            // add the pin site to the first element
            pinSites.unshift(pinSite);
          } else if (pinSites.length < this.MAXIMUM_NUMBER_OF_PINNED_SITES) {
            // pinned sites are under 100
            result = 'pinCompleted';
            // add the pin site to the first element directly
            pinSites.unshift(pinSite);
          } else {
            // pinned sites are over 100
            result = 'pinnedSitesOverLimit';
            return Promise.resolve(result);
          }
        } else {
          result = 'pinCompleted';
          // no pinned site
          pinSites = [];
          pinSites.push(pinSite);
        }

        return this.savePinSites(pinSites).then(() => {
          return Promise.resolve(result);
        }, (reason) => {
          return Promise.reject(reason);
        });
      });
    },

    savePinSites: function(pinSites) {
      if (!Array.isArray(pinSites)) {
        Promise.reject('not array');
      }

      return this._getStore().then((store) => {
        return store.put(pinSites, 'pinned_sites');
      });
    },

    removeFromPinSites: function(url) {
      if (!url) {
        return Promise.reject();
      }

      return this.getPinSites().then((pinSites) => {
        var targetIndex = -1;
        pinSites.some((site, index) => {
          if (site.url === url) {
            targetIndex = index;
            return true;
          }
        });

        if (targetIndex > -1) {
          pinSites.splice(targetIndex, 1);
        }

        return this.savePinSites(pinSites);
      });
    }
  };

  exports.BrowserPinSitesDataStore = BrowserPinSitesDataStore;

}(window));
