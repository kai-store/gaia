'use strict';
/* global Contacts */
/* global fb */
/* global ImageLoader */
/* global LazyLoader */
/* global Normalizer */
/* global utils */
/*global TabNavigation*/

var contacts = window.contacts || {};

contacts.Search = (function () {
  var SEARCH_RESULT_NAVIGATION_SELECTOR = '#groups-list-search .contact-item';
  const LONG_PASS_PERIOD = 1000;
  var inSearchMode = false,
    searchView,
    searchBox,
    searchList,
    contactsGroupList,
    contactsListContainer,
    searchInput,
    searchNoResult,
    searchProgress,
    searchTimer = null,
    contactNodes = null,
    selectableForm = null,
    // On the steady state holds the list result of the current search
    searchableNodes = null,
    currentTextToSearch = '',
    currentSearchTerms = [],
    prevTextToSearch = '',
    // Pointer to the nodes which are currently on the result list
    currentSet = {},
    searchTextCache = {},
    canReuseSearchables = false,
    blurList = false,
    theClones = {},
    CHUNK_SIZE = 1000,
    // Default to invalid page size and recalculate when first row added
    searchPageSize = -1, //wtf mozilla! why in the general contact page don't you use this carzy logic?
    // Limit search result to hardLimit contacts, recalc with page size
    hardLimit = 25,
    emptySearch = true,
    remainingPending = true,
    imgLoader,
    searchEnabled = false,
    source = null,
    navigationController = null,
    highlightClass = 'highlight',
    searchInit = false,
    prevSearchBoxText = '';

  // The _source argument should be an adapter object that provides access
  // to the contact nodes in the app.  This is done by defining the following
  // functions on the adapter object:
  //    getNodes()            An Array of all contact DOM nodes
  //    getFirstNode()        First contact DOM node
  //    getNextNode(node)     Given a node, find the next node
  //    expectMoreNodes()     True if nodes will be added via appendNodes()
  //    clone(node)           Clone the given contact node
  //    getNodeById(id)       Get the node matching the given ID, or null
  //    getSearchText(node)   Get the search text from the given node
  //    click(event)          Click event handler to use
  var init = function load(_source, defaultEnabled, navigation) {
    if (searchInit) {
      return;
    }
    searchInit = true;
    searchView = document.getElementById('search-result-show'); //'search-view');
    searchList = document.getElementById('search-list');
    contactsGroupList = document.getElementById('groups-list');
    contactsListContainer = contactsGroupList
        .querySelector('#contacts-list-search');
    searchInput = document
        .querySelector('.search-form-input');
    selectableForm = document.getElementById('selectable-form');
    var searchForm = document.getElementById('search-container');

    if (!_source) {
      throw new Error('Search requires a contact source!');
    }

    source = _source;

    if (typeof source.click === 'function') {
      searchList.addEventListener('click', source.click);
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        return false;
      });
    }

    searchEnabled = !!defaultEnabled;

    navigationController = navigation || (window.Contacts && Contacts.navigation);
    activateSearchMode();
  };

  var onViewChanged = function (evt) {
    //if (evt.detail.currentView ===)
  };

  var activateSearchMode = function () {
    window.addEventListener('input', onInput);
    searchView.classList.add('insearchmode');
    /*if (selectableForm) {
        selectableForm.classList.add('insearchmode');
      }*/

    doInit();
    fillInitialSearchPage();
    inSearchMode = true;
    emptySearch = true;
    /*if (navigationController) {
        navigationController.go('search-view', 'none');
      }*/

    setTimeout(function nextTick() {
      searchBox.focus();
    });
  };

  var initialized = false;

  var ignoreReturnKey = function ignoreReturnKey(evt) {
    if (evt.keyCode == 13) { // VK_Return
      evt.preventDefault();
    }
  };

  var doInit = function doInit() {
    if (initialized) {
      return;
    }

    /*utils.listeners.add({
      '#cancel-search': exitSearchMode,
      '#search-contact': [
        {
          event: 'keypress',
          handler: ignoreReturnKey
        }
      ]
    });*/

    initialized = true;
    searchBox = document.getElementById('contacts-search-input');
    initSearchClear();
    /*var resetButton = searchBox.nextElementSibling;
    resetButton.addEventListener('ontouchstart' in window ? 'touchstart' :
                                 'mousedown', function() {
      searchBox.value = '';
      searchBox.focus();
      resetState();
      window.setTimeout(fillInitialSearchPage, 0);
    });*/

    /*searchList.parentNode.addEventListener('touchstart', function() {
      if (searchableNodes && remainingPending) {
        addRemainingResults(searchableNodes, searchPageSize);
      }
      blurList = true;
    });*/
    searchNoResult = document.getElementById('no-result');
    searchProgress = document.getElementById('search-progress');
    searchBox.addEventListener('blur', function () {
      window.setTimeout(onSearchBlur, 0);
    });

    searchBox.addEventListener('focus', function () {
      blurList = false;
    });

    LazyLoader.load([
      '/contacts/js/fb_resolver.js',
      '/shared/js/contacts/utilities/image_loader.js'
    ], function () {
      imgLoader = new ImageLoader('#groups-list-search', 'li');
      imgLoader.setResolver(fb.resolver);
    });
  };

  var initSearchClear = function () {
    var timerId,
      startTimer = function () {
        timerId && clearTimeout(timerId);
        timerId = setTimeout(stopTimer, LONG_PASS_PERIOD);
      },
      stopTimer = function (evtMd) {
        if (timerId) {
          clearTimeout(timerId);
          evtMd !== true && (searchBox.value = '', resetSearch());
        }
      };
    //document.addEventListener('keydown', (evt) => (evt.target === searchBox) && (['Clear', 'Backspace'].indexOf(evt.key) !== -1) && startTimer());
    document.addEventListener('keyup', (evt) => timerId && stopTimer(true));
  };

  var clearHighlights = function (node) {
    // We travers the DOM tree and remove highlighting spans.
    // getElements instead of querySelector here because of
    // performance.
    var highlights = node.getElementsByClassName(highlightClass);
    while (highlights.length) {
      var parent = highlights[0].parentNode;
      while (highlights[0].firstChild) {
        parent.insertBefore(highlights[0].firstChild, highlights[0]);
      }

      // This removes the item from 'highlights' HTMLCollection as well
      // via live DOM updating.
      parent.removeChild(highlights[0]);
    }
  };

  var highlightNode = function (node) {
    var textNode = node.querySelector('.contact-text');
    if (!textNode) {
      return;
    }
    var displayedText = textNode.textContent;
    var normalizedDisplayedText = Normalizer.toAscii(displayedText);

    currentSearchTerms.forEach(function (term) {
      var hRegEx = new RegExp(term, 'gi');
      var newTerms = [],
        newTerm;
      // RegExp.exec() saves the index of the last match and the next time it's
      // called starts from there so we iterate over every match in the string.
      var result = hRegEx.exec(normalizedDisplayedText);
      while (result) {
        newTerm = displayedText.substr(result.index, term.length);
        newTerm = Normalizer.escapeRegExp(newTerm).toLowerCase();
        newTerms.push(newTerm);
        result = hRegEx.exec(normalizedDisplayedText);
      }

      newTerms = newTerms.filter(function removeDuplicates(elem, pos) {
        return newTerms.indexOf(elem) === pos;
      });

      newTerms.forEach(function replaceWithHighlight(term) {
        var regexp = new RegExp('(?:<[^>]+>)|(' + term + ')', 'ig');
        var setHighlighted = function (str, capturedGroup) {
          if (capturedGroup) {
            return '<span class="' + highlightClass + '">' + capturedGroup +
              '</span>';
          }
          return str;
        };

        textNode.innerHTML = textNode.innerHTML.replace(regexp, setHighlighted);
      });
    });
  };

  var updateSearchList = function updateSearchList(cb) {
    if (!inSearchMode) {
      if (cb) {
        cb();
      }
      return;
    }

    window.setTimeout(function () {
      // Resetting state
      resetStateAndCache();

      search(cb);
    });
  };

  var resetStateAndCache = function resetStateAndCache() {
    contactNodes = null;
    searchTextCache = {};
    resetState();
  };


  // Search mode instructions
  // var exitSearchMode = function exitSearchMode(evt) {
  //   if (evt) {
  //     evt.preventDefault();
  //   }
  //   searchView.classList.remove('insearchmode');
  //   if (selectableForm) {
  //     selectableForm.classList.remove('insearchmode');
  //   }

  //   if (navigationController) {
  //     navigationController.back();
  //   }

  //   window.setTimeout(function exit_search() {
  //     hideProgressResults();

  //     searchBox.value = '';

  //     // Resetting state
  //     contactNodes = null;
  //     searchTextCache = {};
  //     resetState();

  //     inSearchMode = false;
  //   }, 0);

  //   window.removeEventListener('input', onInput);
  // };

  function resetState() {
    prevTextToSearch = '';
    currentTextToSearch = '';
    currentSearchTerms = [];
    searchableNodes = null;
    canReuseSearchables = false;
    currentSet = {};
    // We don't know if the user will launch a new search later
    theClones = {};
    utils.dom.removeChildNodes(searchList);
    emptySearch = true;
    remainingPending = true;
  }

  function addRemainingResults(nodes, from) {
    if (remainingPending !== true) {
      return;
    }

    var fragment = document.createDocumentFragment();

    for (var i = from; i < hardLimit && i < nodes.length; i++) {
      var node = nodes[i].node;
      var clon = getClone(node);
      highlightNode(clon);
      fragment.appendChild(clon);
      currentSet[node.getAttribute('data-uuid')] = clon;
    }

    if (fragment.hasChildNodes()) {
      searchList.appendChild(fragment);
      imgLoader.reload();
    }

    remainingPending = false;
  }

  function onSearchBlur(e) {
    if (canReuseSearchables && searchableNodes &&
      searchView.classList.contains('insearchmode') && blurList) {
      // All the searchable nodes have to be added
      addRemainingResults(searchableNodes, searchPageSize);
    } else if (emptySearch === true && remainingPending === true) {
      var lastNode = searchList.querySelector('li:last-child');
      if (lastNode) {
        var lastNodeUid = lastNode.getAttribute('data-uuid');
        var startNode = source.getNextNode(source.getNodeById(lastNodeUid));
        fillIdentityResults(startNode, hardLimit - searchPageSize);
        remainingPending = false;

        imgLoader.reload();
      }
    }
  }

  function fillIdentityResults(startNode, number) {
    var fragment = document.createDocumentFragment();

    var contact = startNode;
    for (var i = 0; i < number && contact &&
        !contact.classList.contains('search-form-list') &&
        contact.dataset.group !== 'ice'; i++) {
      var clonedNode = getClone(contact);
      fragment.appendChild(clonedNode);
      currentSet[contact.getAttribute('data-uuid')] = clonedNode;
      contact = source.getNextNode(contact);
    }

    if (fragment.hasChildNodes()) {
      searchList.appendChild(fragment);
    }
  }

  function getClone(node) {
    var id = node.getAttribute('data-uuid');
    var out = theClones[id];

    if (!out) {
      out = source.clone(node);
      cacheClone(id, out);
    }

    return out;
  }

  function cacheClone(id, clone) {
    theClones[id] = clone;
  }

  function deleteClone(id) {
    delete theClones[id];
  }

  var showViewMode = function (modeName) {
    if (modeName === 'list') {
      contactsGroupList.classList.remove('hide');
      searchView.classList.add('hide');
      if (!Contacts.selectionMode) {
        TabNavigation && TabNavigation.enabled();
        if (!Contacts.isSelectedSpeedDial) {
          OptionHelper.show('contact-list');
        }
      }
      //because of list of contacts could be changed during
      // filter (removed or added)
      window.NavigationManager.reset(contacts.List.navigationSelector, null);
    } else {
      searchView.classList.remove('hide');
      contactsGroupList.classList.add('hide');
      TabNavigation && TabNavigation.disabled();
      !searchEnabled && enableSearch();
      searchBox.setSelectionRange(searchBox.value.length, searchBox.value.length);
    }
  };

  var onInput = function seacrh_onInput(e) {
    var target;
    if (e.detail && e.detail.custom && e.detail.target) {
      target =e.detail.target;
    } else {
      target = e.target;
    }
    if (typeof e.isComposing !== 'undefined' && !!e.isComposing) {
      return;
    }
    if (prevSearchBoxText !== target.value && target.id === searchBox.id) {
      prevSearchBoxText = target.value;
        if (target.value.length > 0) {
          if (!onInput._searchInit) {
            onInput._searchInit = true;
            showViewMode('search');
          }
          search(() => {
            window.NavigationManager.delNavId(SEARCH_RESULT_NAVIGATION_SELECTOR);
            window.NavigationManager.reset(SEARCH_RESULT_NAVIGATION_SELECTOR, null);
          });
          // window.NavigationManager.reset(SEARCH_RESULT_NAVIGATION_SELECTOR, null);

        } else if (onInput._searchInit) {
          resetSearch();
        }
      return this;
    }
  };

  var resetSearch = function () {
    prevSearchBoxText = '';
    searchBox.value = '';
    onInput._searchInit = false;
    inSearchMode = false;
    showViewMode('list');
  };

  var resetSearchHidenView = function () {
    prevSearchBoxText = '';
    searchBox.value = '';
    onInput._searchInit = false;
    inSearchMode = false;
    contactsGroupList.classList.remove('hide');
    searchView.classList.add('hide');
    TabNavigation && TabNavigation.enabled();
  };

  var enterSearchMode = function searchMode(evt) {
    evt.preventDefault();

    if (!inSearchMode) {
      window.addEventListener('input', onInput);
      searchView.classList.add('insearchmode');
      if (selectableForm) {
        selectableForm.classList.add('insearchmode');
      }

      doInit();
      fillInitialSearchPage();
      inSearchMode = true;
      emptySearch = true;
      if (navigationController) {
        navigationController.go('search-view', 'none');
      }

      setTimeout(function nextTick() {
        searchBox.focus();
      });
    }
  };

  function fillInitialSearchPage(done) {

    var startContact = source.getFirstNode();
    var numToFill = searchPageSize;

    // Calculate rows visible on a single page the first time we get a row
    // that we can measure.
    if (startContact && searchPageSize < 1) {
      fillIdentityResults(startContact, 1);

      /*var viewHeight = searchList.getBoundingClientRect().height;
      var rowHeight = searchList.children[0].getBoundingClientRect().height;*/
      searchPageSize = 1000000; //Math.ceil(viewHeight / rowHeight);
      hardLimit = ~~ (3.5 * searchPageSize);

      startContact = source.getNextNode(startContact);
      numToFill = searchPageSize - 1;
    }

    fillIdentityResults(startContact, numToFill);

    if (typeof done === 'function') {
      done();
    }

    if (imgLoader) {
      imgLoader.reload();
    }
  }

  function doSearch(contacts, from, searchText, pattern, state) {
    // Check whether the user enter a new term or not
    if (currentTextToSearch.localeCompare(searchText) !== 0) {
      canReuseSearchables = false;
      window.console.warn('**** Cancelling current search ****');
      return;
    }
    // Search the next chunk of contacts
    var end = from + CHUNK_SIZE;
    currentSearchTerms = pattern.source.split(/\s+/);
    for (var c = from; c < end && c < contacts.length; c++) {
      var contact = contacts[c].node || contacts[c];
      var contactText = contacts[c].text || getSearchText(contacts[c]);
      contactText = contactText.replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      if (!checkContactMatch(currentSearchTerms, contactText)) {
        if (contact.getAttribute('data-uuid') in currentSet) {
          searchList.removeChild(currentSet[contact.getAttribute('data-uuid')]);
          delete currentSet[contact.getAttribute('data-uuid')];
        }
      } else {
        if (state.count === 0) {
          hideProgressResults();
        }
        // Only an initial page of elements is loaded in the search list
        if (Object.keys(currentSet).length < searchPageSize &&
          !(contact.getAttribute('data-uuid') in currentSet)) {
          var clonedNode = getClone(contact);
          currentSet[contact.getAttribute('data-uuid')] = clonedNode;
          searchList.appendChild(clonedNode);
        }

        if (currentSet[contact.getAttribute('data-uuid')]) {
          // We clear the highlights here because parts of the node could
          // been already highlighted from a previous, more general search.
          clearHighlights(currentSet[contact.getAttribute('data-uuid')]);
          highlightNode(currentSet[contact.getAttribute('data-uuid')]);
        }

        state.searchables.push({
          node: contact,
          text: contactText
        });
        state.count++;
      }
    }

    // If we are still searching through the list, then schedule
    // the next batch of search comparisons.
    if (c < contacts.length) {
      searchTimer = window.setTimeout(function do_search() {
        searchTimer = null;
        doSearch(contacts, from + CHUNK_SIZE, searchText,
          pattern, state);
      }, 0);
      return;

      // If we expect to get more nodes, for example if the source is
      // still loading, then delay finalizing the end of the search
    } else if (source.expectMoreNodes()) {
      // Since we're blocked waiting on more contacts to be provided,
      // use some delay here to avoid a tight spin loop.
      var delay = 250;
      searchTimer = window.setTimeout(function do_search() {
        doSearch(contacts, Math.min(end, contacts.length), searchText,
          pattern, state);
      }, delay);
      return;

      // Or we are complete with no results found
    } else if (state.count === 0) {
      showNoResults();

      canReuseSearchables = false;

      // Or we are complete with results that might have images to render
    } else {
      imgLoader.reload();
      searchableNodes = state.searchables;
      canReuseSearchables = true;
      // If the user wished to scroll let's add the remaining results
      if (blurList === true) {
        searchTimer = window.setTimeout(function () {
          searchTimer = null;
          addRemainingResults(searchableNodes, searchPageSize);
        }, 0);
      }
    }

    if (typeof state.searchDoneCb === 'function') {
      state.searchDoneCb();
    }
  }

  var enableSearch = function enableSearch() {
    if (searchEnabled) {
      return;
    }

    searchEnabled = true;
    // We perform the search when all the info have been loaded and the
    // user wrote something in the entry field
    invalidateCache();
    search();
  };

  // Allow the main contacts list to asynchronously tell us about additional
  // nodes as they are loaded.
  var appendNodes = function appendNodes(nodes) {
    if (!nodes || !nodes.length || !contactNodes) {
      return;
    }

    contactNodes.push.apply(contactNodes, nodes);

    // If there are no searches in progress, then we are done
    if (!currentTextToSearch || !canReuseSearchables || !searchableNodes) {
      return;
    }

    // If we have a current search then we need to determine whether the
    // new nodes should show up in that search.
    for (var i = 0, n = nodes.length; i < n; ++i) {
      var node = nodes[i];
      var nodeText = getSearchText(node);
      if (!checkContactMatch(currentSearchTerms, nodeText)) {
        searchableNodes.push({
          node: node,
          text: nodeText
        });
      }
    }
  };

  var checkContactMatch = function checkContactMatch(searchTerms, text) {
    for (var i = 0, m = searchTerms.length; i < m; i++) {
      if (!RegExp(searchTerms[i], 'i').test(text)) {
        return false;
      }
    }
    return true;
  };

  var search = function performSearch(searchDoneCb) {
    inSearchMode = true;
    prevTextToSearch = currentTextToSearch;

    currentTextToSearch = Normalizer.toAscii(searchBox.value.trim());
    currentTextToSearch = Normalizer.escapeRegExp(currentTextToSearch);
    var thisSearchText = String(currentTextToSearch);

    if (thisSearchText.length === 0) {
      resetState();
      window.setTimeout(fillInitialSearchPage, 0, searchDoneCb);
    } else {
      showProgress();
      if (!searchEnabled) {
        resetState();
        return;
      }
      emptySearch = false;
      // The remaining results have not been added yet
      remainingPending = true;
      var pattern = new RegExp(thisSearchText, 'i');
      var contactsToSearch = getContactsToSearch(thisSearchText,
        prevTextToSearch);
      var state = {
        count: 0,
        searchables: [],
        searchDoneCb: searchDoneCb
      };
      searchTimer = window.setTimeout(function do_search() {
        searchTimer = null;
        doSearch(contactsToSearch, 0, thisSearchText, pattern, state);
      }, 0);
    }
  };

  function getSearchText(contact) {
    var out = '';

    var uuid = contact.getAttribute('data-uuid');
    if (uuid) {
      out = searchTextCache[uuid];
      if (!out) {
        out = source.getSearchText(contact);
        searchTextCache[uuid] = out;
      }
    } else {
      window.console.error('Search: Not uuid found for the provided node');
    }

    return out;
  }

  var getContactsDom = function contactsDom() {
    contactNodes = source.getNodes();
    return contactNodes;
  };

  var getContactsToSearch = function getContactsToSearch(newText, prevText) {
    var out;
    if (canReuseSearchables && newText.length > prevText.length &&
      prevText.length > 0 && newText.indexOf(prevText) === 0) {
      out = searchableNodes || getContactsDom();
    } else {
      var listNodes = searchList.querySelectorAll('li');
      for (var i = 0;i < listNodes.length; i++) {
        if (!listNodes[i].classList.contains('search-form-input')) {
          searchList.removeChild(listNodes[i]);
        }
      }
      //utils.dom.removeChildNodes(searchList);
      currentSet = {};
      out = getContactsDom();
      canReuseSearchables = false;
    }

    return out;
  };

  var isInSearchMode = function isInSearchMode() {
    return inSearchMode;
  };

  var checkEmptySearchSet = function checkEmptySearchSet() {
    if (searchList.childElementCount === 0) {
      showNoResults();
    }
  }

  var invalidateCache = function s_invalidate() {
    if (searchTimer) {
      window.clearTimeout(searchTimer);
      searchTimer = null;
    }
    currentTextToSearch = '';
    canReuseSearchables = false;
    searchableNodes = null;
    contactNodes = null;
    currentSet = {};
    searchTextCache = {};
  };

  var removeContact = function s_removeContact(id) {
    var contact = searchList.querySelector('li[data-uuid=\"' + id + '\"]');
    if(contact) {
      searchList.removeChild(contact);
      deleteClone(id);
      delete currentSet[id];
      delete searchTextCache[id];
    }
  };

  var selectRow = function s_selectRow(id, value) {
    var check = searchList.querySelector(
      '#search-view input[value="' + id + '"]');
    if (check) {
      check.checked = value;
    }
  };

  function showProgress() {
    searchNoResult.classList.add('hide');
    searchProgress.classList.remove('hidden');
  }

  function showNoResults() {
    if(ActivityHandler.currentlyHandling || Contacts.selectionMode) {
      OptionHelper.hideMenu();
    } else {
      if (!Contacts.isSelectedSpeedDial) {
        OptionHelper.show('contact-list-empty');
      }
    }
    searchNoResult.classList.remove('hide');
    searchProgress.classList.add('hidden');

  }

  function hideProgressResults() {
    if(ActivityHandler.currentlyHandling || Contacts.selectionMode) {
      OptionHelper.showMenu();
    } else {
      if (!Contacts.isSelectedSpeedDial) {
        OptionHelper.show('contact-list');
      }
    }
    searchNoResult.classList.add('hide');
    searchProgress.classList.add('hidden');
  }

  function isSearchActive() {
    return onInput._searchInit;
  }

  return {
    'init': init,
    'invalidateCache': invalidateCache,
    'appendNodes': appendNodes,
    'removeContact': removeContact,
    'search': search,
    'enterSearchMode': enterSearchMode,
    // 'exitSearchMode': exitSearchMode,
    'isInSearchMode': isInSearchMode,
    'enableSearch': enableSearch,
    'selectRow': selectRow,
    'updateSearchList': updateSearchList,
    'resetSearch' : resetSearch,
    'resetSearchHidenView' : resetSearchHidenView,
    'checkEmptySearchSet' : checkEmptySearchSet,
    'showViewMode': showViewMode,
    'getHighlightClass': function () {
      return highlightClass;
    },
    'isSearchActive': isSearchActive,
    get navigationSelector() {
      return SEARCH_RESULT_NAVIGATION_SELECTOR;
    },
    get currentSet() {
      return currentSet;
    }
  };
})();
