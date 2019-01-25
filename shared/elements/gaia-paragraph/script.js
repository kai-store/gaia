'use strict';

window.GaiaParagraph = (function(win) {
  var proto = Object.create(HTMLElement.prototype);
  var baseurl = window.GaiaParagraphBaseurl ||
      '/shared/elements/gaia-paragraph/';

  var stylesheet = baseurl + 'style.css';
  var template = document.createElement('template');
  template.innerHTML = `<style scoped>
    @import url(${stylesheet});
    @import url(/shared/elements/gaia-theme/gaia-font.css);
    @import url(/shared/elements/gaia-theme/gaia-theme.css);
    @import url(/shared/elements/gaia-icons/gaia-icons.css);
    </style>
      <div class="container" role="heading" aria-describedby="content">
        <article role="textbox" id="content" class="p txtview">
          <content></content>
        </article>
        <div class="more-container">
          <span class="next" data-icon="forward"></span>
          <span class="more p-sec" data-l10n-id="more">More</span>
        </div>
      </div>`;

  var getDisplayPath = function(value) {
    return '/shared/elements/gaia-paragraph/display.html?value=' + value;
  };

  proto.isOverflow = function() {
    return this._textView.scrollHeight > this._container.clientHeight;
  };

  proto.toggleMore = function() {
    this._container.classList.toggle('showMore', this.isOverflow());
  };

  proto.handleClick = function(e) {
    var path = getDisplayPath(this._value);
    window.location.href = path;
  };

  proto.createdCallback = function() {
    var self = this;
    this.shadow = this.createShadowRoot();
    this._template = template.content.cloneNode(true);

    this._container = this._template.querySelector('.container');

    this.setAttribute('tabindex', -1);
    this._value = this.innerHTML;
    this._textView = this._template.querySelector('.txtview');
    this._more = this._template.querySelector('.more-container');
    this._textView.addEventListener('click', this.handleClick.bind(this));
    this.shadow.appendChild(self._template);
    this.addEventListener('focus', this.onFocus.bind(this));
    this.addEventListener('blur', this.onBlur.bind(this));
    document.addEventListener('DOMContentLoaded', function(e) {
      self.toggleMore();
    });
  };

  proto.click = function(e) {
    this.handleClick(e);
  };

  proto.onFocus = function(e) {
    this._container.classList.toggle('focus', true);
  };

  proto.onBlur = function(e) {
    this._container.classList.toggle('focus', false);
  };

  proto.attributeChangedCallback = function(attrName, oldVal, newVal) {
    this.toggleMore();
  };

  Object.defineProperty(proto, 'value', {
    get: function() {
      return this._value;
    },

    set: function(value) {
      this._value = value;
      this._textView.textContent = value;
      this.toggleMore();
    }
  });

  return document.registerElement('gaia-paragraph', {
    prototype: proto
  });
})(window);
