(function(win) {
  var getValue = function(url, paramter) {
    var reg = new RegExp('(^|&|\\?)' + paramter + '=([^&]*)(&|$)');
    var r = url.match(reg);
    if (r) return unescape(r[2]);
    return null;
  };

  var Navigation = {
    scrollStep: 50,
    currentIndex: -1,
    previousIndex: -1,
    element: null,
    linkElements: null,
    hasLinks: false,
    visibleHeight: 0,
    visibleBottom: 0,
    visibleTop: 0,
    skPanel: null,
    links: {
      count: 0
    },

    init: function(element) {
      Navigation.element = element;
      Navigation.getVisibleRect();
      Navigation.resetLinks();
      Navigation.setFocus();
      Navigation.updateSks();
      Navigation.element.addEventListener('keydown', Navigation.onKeyDown);

    },

    resetLinks: function() {
      var linkElements = Navigation.element.querySelectorAll('a');
      for (var i = 0, len = linkElements.length; i < len; i++) {
        linkElements[i].setAttribute('tabindex', i);
        Navigation.links[i] = linkElements[i];
      }
      Navigation.links.count = linkElements.length;
      Navigation.hasLinks = Navigation.links.count > 0;
      if (Navigation.hasLinks) {
        Navigation.currentIndex = 0;
      }
    },

    isVisable: function(rect) {
      return rect.top >= Navigation.visibleTop && rect.top <= Navigation.visibleBottom;
    },

    scroll: function(key) {
      if (!Navigation.hasLinks) {
        Navigation.scrollByStep(Navigation.element, key);
        return;
      }

      var nextIndex = key === 'ArrowDown' ?
          Navigation.currentIndex + 1 : Navigation.currentIndex - 1;

      if (nextIndex < 0 || nextIndex > Navigation.links.count - 1) {
        Navigation.scrollByStep(Navigation.element, key);
        return;
      }

      var nextEl = Navigation.links[nextIndex];
      var nextElRect = nextEl.getClientRects()[0];

      if (Navigation.isVisable(nextElRect)) {
        Navigation.indexChange(key);
        Navigation.setFocus();
      } else {
        Navigation.scrollByStep(Navigation.element, key);
        nextElRect = nextEl.getClientRects()[0];
        if (Navigation.isVisable(nextElRect)) {
          Navigation.indexChange(key);
          Navigation.setFocus();
        }
      }
    },

    setFocus: function() {
      if (!Navigation.hasLinks || Navigation.currentIndex === -1) {
        Navigation.element.focus();
        return;
      }

      Navigation.links[Navigation.currentIndex].focus();
      Navigation.links[Navigation.currentIndex].classList.toggle('focus', true);
      if (Navigation.currentIndex !== Navigation.previousIndex && Navigation.previousIndex != -1) {
        Navigation.links[Navigation.previousIndex].classList.toggle('focus', false);
      }
    },

    indexChange: function(key) {
      Navigation.previousIndex = Navigation.currentIndex;
      if (key === 'ArrowDown') {
        Navigation.currentIndex = Navigation.currentIndex + 1;
        if (Navigation.currentIndex > Navigation.count - 1) {
          Navigation.currentIndex = Navigation.count - 1;
        }
      } else if (key === 'ArrowUp') {
        Navigation.currentIndex = Navigation.currentIndex - 1;
        if (Navigation.currentIndex < -1) {
          Navigation.currentIndex = -1;
        }
      }
    },

    getCurrentLink: function() {
      if (Navigation.hasLinks && Navigation.currentIndex > -1) {
        return Navigation.links[Navigation.currentIndex];
      }
      return null;
    },

    onKeyDown: function(e) {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
          Navigation.scroll(e.key);
          if (Navigation.hasLinks) {
            Navigation.updateSks();
          }
          e.preventDefault();
          break;
        case 'Enter':
        case 'Accept':
          e.stopPropagation();
          e.preventDefault();
          var currentLink = Navigation.getCurrentLink();
          if (currentLink) {
            var rect = currentLink.getClientRects()[0];
            if (Navigation.isVisable(rect)) {
              var url = currentLink.getAttribute('href');
              if (/^https?:.{1,16384}$/.test(url)) {
                new MozActivity({
                  name: 'view',
                  data: {
                    type: 'url',
                    url: url
                  }
                });
              }
            }
          }
          break;
        case 'Backspace':
        case 'BrowserBack':
          win.history.back();
          e.preventDefault();
          break;
        default:
          break;
      }
    },

    getVisibleRect() {
      var el = document.querySelector('.fullscreen');
      var rect = el.getClientRects()[0];
      Navigation.visibleHeight = rect.height;
      Navigation.visibleTop = rect.top;
      Navigation.visibleBottom = rect.bottom;
      Navigation.scrollStep = Navigation.visibleHeight / 5;
    },

    scrollByStep: function(el, key) {
      var stepLength = Navigation.scrollStep;
      el.scrollTop = key === 'ArrowDown' ?
           el.scrollTop + stepLength : el.scrollTop - stepLength;
    },

    updateSks: function() {
      var actions = [{
        name: 'Back',
        l10nId: 'back',
        priority: 1,
        method: function() {
          window.history.back();
        }
      }];

      var currentLink = Navigation.getCurrentLink();
      if (currentLink && Navigation.isVisable(currentLink.getClientRects()[0])) {
        actions.push({
          name: 'select',
          icon: 'ok',
          l10nId: 'select',
          priority: 2,
          method: function(){}
        });
      }

      var params = {
        header: {
          l10nId: 'paragraph',
          name: 'Paragraph'
        },
        items: actions
      };
      if (Navigation.skPanel) {
        Navigation.skPanel.initSoftKeyPanel(params);
      } else {
        Navigation.skPanel = new SoftkeyPanel(params);
      }

      Navigation.skPanel.show();
    },
  };


  win.onload = function() {
    var currentEl = null;
    var previousEl = null;
    var value = getValue(win.location.search, 'value');
    var textView = document.querySelector('.fullTextView');
    textView.innerHTML = value;
    Navigation.init(textView);
  };
}(window));
