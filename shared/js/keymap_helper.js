'use strict';

/* global */

(function(exports) {

var KeymapHelper = function() {};

KeymapHelper.prototype.queryKey = function(key) {
  // Before the new gecko api is fixed, always return false
  // when querying Backspace key to match the 2.0 target device.
  return (key !== 'Backspace');
};

exports.KeymapHelper = KeymapHelper;

})(window);
