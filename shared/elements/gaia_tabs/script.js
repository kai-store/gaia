window.GaiaTabs = (function(win) {
  /* global ComponentUtils */
  'use strict';

  // Extend from the HTMLElement prototype
  var proto = Object.create(HTMLElement.prototype);
  var indexOf = [].indexOf;

  // Allow baseurl to be overridden (used for demo page)
  var baseurl = window.GaiaTabsBaseurl ||
    '/shared/elements/gaia_tabs/';

  /**
   * Runs when an instance of `GaiaTabs`
   * is first created.
   *
   * The intial value of the `select` attribute
   * is used to select a tab.
   *
   * @private
   */
  proto.createdCallback = function() {
    for (var el = this.firstElementChild; el; el = el.nextElementSibling) {
      el.setAttribute('role', 'tab');
    }
    this.setAttribute('role', 'tablist');
    ComponentUtils.style.call(this, baseurl);
    this.addEventListener('click', this.onClick);
    this.select(this.getAttribute('selected'));
  };

  /**
   * Updates the selected tab when
   * the `selected` attribute changes.
   *
   * @param  {String} attr
   * @param  {String|null} oldVal
   * @param  {String|null} newVal [description]
   * @private
   */
  proto.attributeChangedCallback = function(attr, oldVal, newVal) {
    if (attr === 'selected') { this.select(newVal); }
  };

  /**
   * Walks up the DOM from the `event.target`
   * until it finds an immendiate child
   * of the element, then selects the index
   * of that element.
   *
   * @param  {Event} e
   * @private
   */
  proto.onClick = function(e) {
    var el = e.target;
    var i;
    while (el) {
      i = indexOf.call(this.children, el);
      if (i > -1) { return this.select(i); }
      el = el.parentNode;
    }
  };

  /**
   * Select a tab by index.
   *
   * @param  {Number} index
   * @public
   */
  proto.select = function(index) {
    if (index === null) { return; }

    // Make sure it's a number
    index = Number(index);

    var el = this.children[index];
    this.deselect(this.selected);
    this.selectedChild = el;
    this.selected = index;

    el.setAttribute('aria-selected', 'true');
    el.classList.add('selected');

    var e = new CustomEvent('change');
    setTimeout(this.dispatchEvent.bind(this, e));

    this._updateIndicator(index);
  };

  proto.addItem = function(child, index) {
    var len = this.children.length;
    if (!index) {
      index = len - 1;
    }
    if (index < 0 || index > len - 1 || !child) {
      return;
    }
    this.insertBefore(child, this.children[index]);
  };

  proto.removeItem = function(id) {
    var child = document.getElementById(id);
    if (child) {
      this.removeChild(child);
    }
  };

  proto._updateIndicator = function(index) {
    var offset = 0;

    // Remove last children as it is a <style> tag
    var tabs = Array.prototype.slice.call(this.children, 0, -1);
    var tabsWidth = this.offsetWidth;

    var currTabLeft = tabs[index].offsetLeft;
    var currTabWidth = tabs[index].offsetWidth;
    var currTabRight = tabsWidth - (currTabLeft + currTabWidth);

    var lastTabLeft = tabs[tabs.length - 1].offsetLeft;
    var lastTabWidth = tabs[tabs.length - 1].offsetWidth;
    var lastTabRight = tabsWidth - (lastTabLeft + lastTabWidth);

    if (index === 0) {
      offset = 0;
    } else if (index === (tabs.length - 1)) {
      // LastTab, offset is 0 if tabs stay in one screen, or
      // LastTabRight if longer.
      if (lastTabRight > 0) {
        offset = 0;
      } else {
        offset = lastTabRight;
      }
    } else {
      // Tab in the middle of somewhere

      // Calcuate the average of current tab's offsetLeft and offsetRight
      // as targetOffset and set translateX to put tab at the center.
      var targetTabLeft = (currTabLeft + currTabRight) / 2;
      var targetOffset = targetTabLeft - currTabLeft;
      if (targetOffset > 0 || lastTabRight > 0) {
        // Offset greater than 0, possibily at the first one or two tabs,
        // or last tab is fully visible, so there's no need move.
        offset = 0;
      } else if (targetOffset < 0 && targetOffset > lastTabRight) {
        // Normal case, simply set offset to targetOffset.
        offset = targetOffset;
      } else if (targetOffset < 0 && targetOffset < lastTabRight) {
        // Offset less than lastTabRight, possibily at the last one or two tabs
        // and can't move more than lastTabRight.
        offset = lastTabRight;
      }
    }

    this.style.transform = 'translateX(' + offset + 'px)';
  };

  /**
   * Deselect a tab by index.
   * @param  {Number} index
   * @public
   */
  proto.deselect = function(index) {
    var el = this.children[index];
    if (!el) { return; }
    el.removeAttribute('aria-selected');
    el.classList.remove('selected');
    if (this.current == el) {
      this.selectedChild = null;
      this.selected = null;
    }
  };

  // Register and return the constructor
  return document.registerElement('gaia-tabs', { prototype: proto });
})(window);
