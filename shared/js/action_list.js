'use strict';

var ActionList = function(config) {
  this.contexts = Object.create(null);
  this.style = '';
  this.visibility = false;
  this.useSoftkey = false;
  this.useButtonMethod = false;
  if (config) {
    config.contexts && (this.contexts = config.contexts);
    config.style && (this.style = config.style);
    config.useSoftkey && (this.useSoftkey = config.useSoftkey);
    config.useButtonMethod && (this.useButtonMethod = config.useButtonMethod);
    if (this.useSoftkey) {
      this.softkeyOptions = {
        header: '',
        items: [{
          l10nId: config.cskL10nId || '',
          name: 'Select',
          icon: 'ok',
          priority: 2,
          method: this.clickHandler.bind(this)
        }]
      };
    }
  }
};

ActionList.prototype.CONTAINER_ID = 'action_list';

ActionList.prototype.getContainer = function() {
  if (!this.container) {
    this.container = document.createElement('div');
    this.container.id = this.CONTAINER_ID;
    this.style && this.container.classList.add(this.style);
  }

  return this.container;
};

ActionList.prototype.init = function(parent) {
  parent.appendChild(this.getContainer());

  if (this.useSoftkey && this.softkeyOptions && window.OptionHelper) {
    window.OptionHelper.optionParams['action-list-softkey'] = this.softkeyOptions;
  }
};

ActionList.prototype.setCsk = function(cskL10nId) {
  var csk = this.softkeyOptions.items.find((i) => i.priority = 2);
  csk && cskL10nId && (csk.l10nId = cskL10nId);
};

ActionList.prototype._keyHandler = function(e) {
  if (e.key === 'Backspace') {
    this.hide();
  }
};

ActionList.prototype.show = function() {
  if (this.container.classList.contains('hidden')) {
    this.container.classList.remove('hidden');

    if (this.style === 'popup') {
      this.kh = this._keyHandler.bind(this);
      window.addEventListener('keydown', this.kh);
    }
    if (this.useSoftkey && window.OptionHelper) {
      window.OptionHelper.saveContext();
      window.OptionHelper.show('action-list-softkey');
    }
    this.visibility = true;
    this._dispatchVisibilityEvent();
  }
};

ActionList.prototype.hide = function() {
  if (!this.container.classList.contains('hidden')) {
    this.container.classList.add('hidden');

    if (this.useSoftkey && window.OptionHelper) {
      window.OptionHelper.returnContext();
    }
    if (this.style === 'popup' && this.kh) {
      window.removeEventListener('keydown', this.kh);
    }
    this.visibility = false;
    this._dispatchVisibilityEvent();
  }
};

ActionList.prototype._dispatchVisibilityEvent = function() {
  var data = {
    visibility: this.visibility,
    selector: this._getSelector(this.current)
  };
  if (this.onVisibilityChanged) {
    this.onVisibilityChanged(data);
  }
  window.dispatchEvent(new CustomEvent('actionListVisibilityChanged', {
    detail: data
  }));
};

ActionList.prototype._getNavClass = function(key) {
  return `nav-${key}`;
};

ActionList.prototype._getSelector = function(key) {
  return `#${this.CONTAINER_ID} button.${this._getNavClass(key)}`;
};

ActionList.prototype.switchContext = function(key) {
  this.current && this._hideMenu(this.current);
  this._showMenu(key);
  this.current = key;

  document.dispatchEvent(new CustomEvent('actionListContextSwitched', {
    detail: {
      selector: this._getSelector(key)
    }
  }));
};

ActionList.prototype._showMenu = function(key) {
  if (!key || !this.contexts[key]) {
    throw Error('context ' + key + ' is not exist');
  }

  var context = this.contexts[key];
  var container = this.getContainer();

  if (!context.form) {
    this._createMenu(context, key);
    container.appendChild(context.form);
  }

  context.form.classList.add('visible');
};


ActionList.prototype._hideMenu = function(key) {
  if (!key || !this.contexts[key]) {
    throw Error('context ' + key + ' is not exist');
  }

  this.contexts[key].form.classList.remove('visible');
};

ActionList.prototype._createMenu = function(context, key) {
  context.handlers = new WeakMap();

  var form = document.createElement('form');
  form.tabIndex = -1;

  if (context.header) {
    var header = document.createElement('div');
    header.className = 'header p-pri';
    if (context.header.l10nId) {
      navigator.mozL10n.setAttributes(header, context.header.l10nId, context.header.l10nArgs);
    } else {
      header.textContent = context.header.name || '';
    }

    form.appendChild(header);
  }

  form.addEventListener('submit', function(event) {
    event.preventDefault();
  });

  var menu = document.createElement('menu');
  menu.dataset.items = context.items.length;

  var navClass = this._getNavClass(key);

  context.items.forEach((function createButton(item) {
    var button = this._createButton(context, item);
    button.className = 'p-pri ' + navClass;
    if (this.useButtonMethod) {
      button.click = () => {
        item.method();
      };
    }
    menu.appendChild(button);
  }).bind(this));

  if (!this.useSoftkey && !this.useButtonMethod) {
    menu.addEventListener('click', this.clickHandler.bind(this));
  }
  form.appendChild(menu);

  context.form = form;
};

ActionList.prototype.currentContext = function() {
  return this.contexts[this.current];
};

ActionList.prototype.clickHandler = function(event) {
  var target;
  if (!this.useSoftkey) {
    target = event.target;
  } else {
    target = window.NavigationManager && window.NavigationManager.getFocusedEl();
  }
  var context = this.currentContext();
  var item = context && context.handlers.get(target);

  if (item && item.method && (typeof item.method === 'function')) {
    item.method.apply(null, item.params || []);
  } else if (context.method && (typeof context.method === 'function')) {
    context.method.apply(null, [item]);
  }
};

ActionList.prototype._createButton = function(context, item) {
  var button = document.createElement('button');
  button.type = 'button';

  if (item.l10nId) {
    navigator.mozL10n.setAttributes(button, item.l10nId, item.l10nArgs);
    if (button.textContent === '') {
      button.textContent = item.name || '';
    }
  } else if (item.name && item.name.length) {
    button.textContent = item.name || '';
  } else {
    return;
  }

  context.handlers.set(button, item);

  return button;
};

ActionList.prototype._getMenu = function(context) {
  return context.form.getElementsByTagName('menu')[0];
};

ActionList.prototype.addItem = function(item, key) {
  key = key || this.current;
  if (!key) {
    return;
  }

  var context = this.contexts[key];
  if (!context) {
    return;
  }

  context.items.push(item);

  var button = this._createButton(context, item);
  button.className = 'p-pri ' + this._getNavClass(key);

  var menu = this._getMenu(context);
  menu.appendChild(button);
  menu.dataset.items = context.items.length;
};

ActionList.prototype.clearItems = function(key) {
  key = key || this.current;
  if (!key) {
    return;
  }

  var context = this.contexts[key];
  if (!context) {
    return;
  }

  context.items.splice(0, context.items.length);
  var menu = this._getMenu(context);
  while (menu.firstChild) {
    menu.removeChild(menu.firstChild);
  }
  menu.dataset.items = 0;
};

ActionList.prototype.registerMethod = function(method, key) {
  key = key || this.current;
  if (!key) {
    return;
  }

  var context = this.contexts[key];
  if (!context) {
    return;
  }

  context.method = method;
};
