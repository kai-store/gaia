'use strict';
/* global ComponentUtils */

window.GaiaGcPage = (function(win) {
  // Extend from the HTMLElement prototype
  var proto = Object.create(HTMLElement.prototype);

  // Allow baseurl to be overridden (used for demo page)
  var baseurl = window.GaiaGcPageBaseurl ||
    '/shared/elements/gaia_gc_page/';

  proto.createdCallback = function() {
    var shadow = this.createShadowRoot();
    this._template = template.content.cloneNode(true);

    this.upIcon = this._template.getElementById('up-icon');
    this.downIcon = this._template.getElementById('down-icon');

    shadow.appendChild(this._template);
    ComponentUtils.style.call(this, baseurl);

    this.element = this.querySelector('div');
    if (!this.element) {
      var divEl = document.createElement('div');
      this.appendChild(divEl);
      this.element = divEl;
    }

    this.addEventListener('keydown', this.handleSelect.bind(this));
    this.tabIndex = 1;
  };

  proto.getElement = function() {
    return this.element;
  };

  proto.displayElement = function(el) {
    this.element.innerHTML = '';
    this.element.appendChild(el);
  };

  proto.showUpIcon = function() {
    this.upIcon.classList.remove('hidden');
  };

  proto.hideUpIcon = function() {
    this.upIcon.classList.add('hidden');
  };

  proto.showDownIcon = function() {
    this.downIcon.classList.remove('hidden');
  };

  proto.hideDownIcon = function() {
    this.downIcon.classList.add('hidden');
  };

  proto.handleSelect = function(e) {
    if (e.key) {
      dump('lxp:: handleSelect ' + e.key);
      switch (e.key) {
        case 'Up':
        case 'ArrowUp':
          this.upIcon.classList.add('active');
          setTimeout(function() {
            this.upIcon.classList.remove('active');
          }.bind(this), 200);
          break;

        case "Down":
        case "ArrowDown":
          this.downIcon.classList.add('active');
          setTimeout(function() {
            this.downIcon.classList.remove('active');
          }.bind(this), 200);
          break;
      }
    }
  };

  var template = document.createElement('template');
  template.innerHTML = `<span id="up-icon">&#9650</span>
    <content select="div"></content>
    <span id="down-icon">&#9660</span>`;

  // Register and return the constructor
  return document.registerElement('gaia-gc-page', { prototype: proto });

})(window);
