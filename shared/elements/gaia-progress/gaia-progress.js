;(function(define){define(function(require,exports,module){
/*jshint esnext:true*/

/**
 * Dependencies
 */

var component = require('gaia-component');

/**
 * Exports
 */

module.exports = component.register('gaia-progress', {
  created: function() {
    this.setupShadowRoot();

    this.els = {
      inner: this.shadowRoot.querySelector('.inner'),
      bar: this.shadowRoot.querySelector('.bar')
    };

    this.els.inner.setAttribute('role', 'progressbar');
    this.els.inner.setAttribute('aria-valuemin', '0');
    this.els.inner.setAttribute('aria-valuemax', '100');

    this.value = this.getAttribute('value') || 0;
    this.handleAnimationEnd = ()=> {
      var classList = this.els.inner.classList;
      if (classList.contains('no-value')) {
        if (classList.contains('increasing')) {
          classList.remove('increasing');
          classList.add('decreasing');
        } else {
          classList.remove('decreasing');
          classList.add('increasing');
        }
      }
    };
    this.addEventListener('animationend', this.handleAnimationEnd);
  },

  detached: function () {
    this.removeEventListener('animationend', this.handleAnimationEnd);
  },

  fillTime: 2000,

  attrs: {
    value: {
      get: function() { return this._value || 0; },
      set: function(value) {

        // Clamp it
        value = Math.min(100, Math.max(0, Number(value)));

        if (value) {
          var delta = Math.abs(this.value - value);
          var duration = (delta / 100) * this.fillTime;
          this.els.bar.style.transform = `translateX(${value}%)`;
          this.els.bar.style.transitionDuration = duration + 'ms';
          this.els.inner.setAttribute('aria-valuenow', value);
        } else {
          this.els.inner.removeAttribute('aria-valuenow');
        }

        this.els.inner.classList.toggle('no-value', !value);
        this.els.inner.classList.toggle('increasing', !value);
        this._value = value;
      }
    }
  },

  template: `
    <div class="inner">
      <div class="bar"></div>
    </div>

    <style>

      :host {
        display: block;
        overflow: hidden;
        height: 0.6rem;
        border-radius: 0.3rem;
        width: 100%;
      }

      .inner {
        height: 100%;
        background: var(--color-gs45, #aaa)
      }

      .bar {
        position: relative;
        top: 0;
        left: -100%;

        width: 100%;
        height: 100%;

        background: var(--highlight-color);
        transition: transform 0ms linear;
      }

      .bar:after {
        position: absolute;
        left: 100%;

        display: block;
        content: '';
        width: 0;
        height: 0;

        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }

      .bar:before {
        position: absolute;
        left: -0.3rem;

        display: block;
        content: '';
        width: 0;
        height: 0;

        border-top: 0.6rem solid var(--color-gs00, #fff);
        border-left: 0.3rem solid var(--color-gs00, #fff);
      }

      .no-value .bar {
        left: 0;
        width: 100%;

      }

      .no-value.increasing  .bar {
        animation: moving-in 1520ms cubic-bezier(0.3, 0, 0.4, 1);
      }

      .no-value.decreasing  .bar {
        animation: moving-out 1520ms cubic-bezier(0.6, 0, 0.3, 1);
      }

    </style>
  `,

  globalCss: `
    @keyframes moving-in {
      0% { width: 0; }
      100% { width: 100%; }
    }

   @keyframes moving-out {
      0% { left: 0; }
      100% { left: 100%; }
    }
  `
});

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('gaia-progress',this));