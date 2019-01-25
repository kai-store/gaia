;(function(define){define(function(require,exports,module){
/*jshint esnext:true*/
'use strict';

/**
 * Dependencies
 */

var component = require('gaia-component');

module.exports = component.register('gaia-slider', {
  created: function() {
    this.setupShadowRoot();

    this.els = {
      input: this.shadowRoot.querySelector('input'),
      value: this.shadowRoot.querySelector('.value'),
      output: this.querySelector('output')
    };

    this.els.input.addEventListener('input', this.onInput.bind(this));
    this.els.input.addEventListener('change', this.onChange.bind(this));
    this.value = this.getAttribute('value') || 0;
  },

  setRange: function(min, max) {
    this.els.input.min = this.min = min;
    this.els.input.max = this.max = max;
  },

  onInput: function(e) {
    this.dispatchEvent(new CustomEvent('input'));
  },

  onChange: function(e) {
    this.dispatchEvent(new CustomEvent('change'));
  },

  attrs: {
    value: {
      get: function() {
        return this._value || 0;
      },
      set: function(value) {
        var min = this.els.input.min ? this.els.input.min : 0;
        var max = this.els.input.max ? this.els.input.max : 100;
        if (value >= min && value <= max) {
          this.els.input.value = value;
        }
        this._value = parseInt(this.els.input.value);
        this.els.input.classList.toggle('min', this._value == min);
        this.els.input.classList.toggle('max', this._value == max);
      }
    }
  },

  template: `
    <div class="inner">
      <input type="range" orient="vertical"/>
    </div>
    <style>

    ::-moz-focus-outer { border: 0; }

    div.inner {
      height: 100%;
    }

    /** Host
     ---------------------------------------------------------*/

    :host {
      display: block;
      height: 100%;
    }

    /** Input
     ---------------------------------------------------------*/

    input {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      background: none;
      border: 0;
    }

    /** Progress
     ---------------------------------------------------------*/

    ::-moz-range-progress {
      background: var(--highlight-color);
      width: 1.2rem;
      border-radius: 0 0 0.6rem 0.6rem;
    }

    input.max::-moz-range-progress {
      border-radius: 0.6rem;
    }

    /** Track
     ---------------------------------------------------------*/

    ::-moz-range-track {
      width: 1.2rem;
      height: 100%;
      border-radius: 0.6rem;

      background: var(--color-gs45);
    }

    /** Thumb
     ---------------------------------------------------------*/

    ::-moz-range-thumb {
      width: 1.2rem;
      height: 0.3rem;
      background: var(--input-background);
      border: none;
      border-radius: 0;
      position: relative;
      z-index: 100;
      left: 50%;
      transition: all 0.2s;
      transition-delay:  var(--button-transition-delay);
    }

    input.min::-moz-range-thumb,
    input.max::-moz-range-thumb {
      opacity: 0;
    }

    </style>
  `
});

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-slider',this));
