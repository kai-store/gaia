(function(exports) {

    var doc = window.document;
    var body = doc.body;

    var lastParams;

    var div = document.createElement('div');
    div.setAttribute('id', 'Symbols');

    var softkeyDiv = document.createElement('div');
    softkeyDiv.setAttribute('id', 'softkey-div');

    var pageNum;

    var cSymbX = 0;
    var cSymbY = 0;
    var nSymbX = 0;
    var nSymbY = 0;
    var currentSymbol;

    var evtDel = false;
    var evtBack = false;

    var setSymbByNumber = false;

    var digit = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['*', '0', '#']
    ];

    var symbol = [
        [
            ['.', '@', '?'],
            ['!', '-', ','],
            ['&', ':', '\''],
            ['\"', '+', '=']
        ],
        [
            ['/', '$', '*'],
            ['#', '%', ';'],
            ['¡', '¿', '\\'],
            ['<', '>', '(']
        ],
        [
            [')', '[', ']'],
            ['_', '{', '}'],
            ['^', '~', '`'],
            ['|']
        ]
    ];

    var softkey;
    var skPanels;

    var settings = window.navigator.mozSettings;
    settings.addObserver('symbol.input.endkey', function(evt) {
        removeTable();
        var evt = new CustomEvent('end-key-pressed');
        window.dispatchEvent(evt);
        softkey && softkey.hide();
    });

    function sendEvent(key) {
        var evt = new CustomEvent('symbol-accepted', {
            bubbles: true,
            cancelable: false,
            detail: key
        });
        window.dispatchEvent(evt);
    };

    function sendBackEvent() {
        var evt = new CustomEvent('back-accepted');
        window.dispatchEvent(evt);
    };

    function removeTable() {
        if (document.getElementById('Symbols')) {
            document.getElementById('Symbols').remove();
        }
        if (skPanels) {
            skPanels.classList.add('visible', 'focused');
        }
    };

    function createSymbolTable(pageIndex) {
        div.style.position = 'absolute';
        div.style.zIndex = 65000;
        div.style.width = '100%';
        div.style.height = 'calc(100% - var(--statusbar-height) - var(--softkeybar-height) - var(--header-height))';
        div.style.top = 'calc(var(--statusbar-height) + var(--header-height))';
        div.style.left = '0';
        div.style.textAlign = 'center';
        div.style.fontSize = '2.4rem';
        div.style.lineHeight = 'normal';
        div.style.backgroundColor = '#333333';
        div.style.color = '#FFFFFF';
        div.style.outline = '5.6rem solid rgba(0, 0, 0, 0.6)';
        div.innerHTML = 'Symbols ' + (pageIndex + 1) + '/3';
        body.appendChild(div);

        var table = document.createElement('table');
        table.setAttribute('id', 'symbol-table');
        table.style.width = '100%';
        table.style.height = '83%';
        table.style.textAlign = 'left';
        table.style.tableLayout = 'fixed';
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '0.3rem';

        var row;
        var cell;
        for (i = 0; i < symbol[pageIndex].length; i++) {
            row = table.insertRow(i);
            for (j = 0; j < symbol[pageIndex][i].length; j++) {
                cell = row.insertCell(j);
                cell.innerHTML = '<b style="background-color: #999999; margin-left: 1.5rem;">' + digit[i][j] + '</b>' + ' ' + symbol[pageIndex][i][j];
                cell.style.verticalAlign = 'middle';
            }
            row.style.color = '#FFFFFF';
        }
        div.appendChild(table);
    };

    function selectCell(x, y) {
        if (x === undefined && y === undefined) {
            x = 0;
            y = 0;
            cSymbX = 0;
            cSymbY = 0;
        }

        if (skPanels && skPanels.classList.contains('visible')) {
            skPanels.classList.remove('visible', 'focused');
        }

        var symbolTable = document.getElementById('symbol-table');

        if (setSymbByNumber) {
            cSymbX = nSymbX;
            cSymbY = nSymbY;
            setSymbByNumber = false;
        } else {
            if (x != 0) {
                cSymbX += x;
                if (cSymbX >= symbolTable.rows[cSymbY].cells.length) {
                    cSymbX = 0;
                } else if (cSymbX == -1) {
                    cSymbX = symbolTable.rows[cSymbY].cells.length - 1;
                }
            }

            if (y != 0) {
                cSymbY += y;
                if (cSymbY >= symbolTable.rows.length) {
                    cSymbY = 0;
                } else if (cSymbY == -1) {
                    cSymbY = symbolTable.rows.length - 1;
                } else if (cSymbX >= symbolTable.rows[cSymbY].cells.length) {
                    cSymbX = symbolTable.rows[cSymbY].cells.length - 1;
                }
            }
        }

        var currentCell = symbolTable.rows[cSymbY].cells[cSymbX];
        if (currentCell === undefined) {
            cSymbX = symbolTable.rows[cSymbY].cells.length - 1;
            currentCell = symbolTable.rows[cSymbY].cells[cSymbX];
        }
        currentCell.style.outline = '0.1rem solid #00CCFF';
        var cellContent = currentCell.innerHTML.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        currentSymbol = cellContent.charAt(cellContent.length - 1);
    };

    function setSymbol(x, y) {
        nSymbX = x;
        nSymbY = y;
        setSymbByNumber = true;
    }

    function processKey(key) {
        var x = 0;
        var y = 0;

        switch (key) {
            case '1':
                setSymbol(0, 0);
                break;
            case '2':
                setSymbol(1, 0);
                break;
            case '3':
                setSymbol(2, 0);
                break;
            case '4':
                setSymbol(0, 1);
                break;
            case '5':
                setSymbol(1, 1);
                break;
            case '6':
                setSymbol(2, 1);
                break;
            case '7':
                setSymbol(0, 2);
                break;
            case '8':
                setSymbol(1, 2);
                break;
            case '9':
                setSymbol(2, 2);
                break;
            case '*':
                setSymbol(0, 3);
                break;
            case '0':
                setSymbol(1, 3);
                break;
            case '#':
                setSymbol(2, 3);
                break;
            case 'BrowserBack':
                sendBackEvent();
                if (!evtBack) {
                    evtBack = true;
                }
                break;
            case 'ArrowRight':
                x = 1;
                y = 0;
                break;
            case 'ArrowDown':
                x = 0;
                y = 1;
                break;
            case 'ArrowLeft':
                x = -1;
                y = 0;
                break;
            case 'ArrowUp':
                x = 0;
                y = -1;
                break;
            case 'Enter':
                if (currentSymbol !== undefined) {
                    sendEvent(currentSymbol);
                    if (!evtDel) {
                        evtDel = true;
                    }
                }
                break;
            default:
                break;
        }

        if (!evtDel && !evtBack) {
            createSymbolTable(pageNum);
            selectCell(x, y);
        }

        if (evtDel) {
            evtDel = false;
        }

        if (evtBack) {
            evtBack = false;
        }
    };

    var symbolInput = function() {};

    symbolInput.prototype.initSymbols = function initSymbols() {
        pageNum = 0;
        createSymbolTable(pageNum);
        selectCell();

        body.appendChild(softkeyDiv);

        if (softkey === undefined) {
            softkey = new SoftkeyPanel(this.initOptions(), null, softkeyDiv);
        }

        softkey.show();

        skPanels = document.getElementById('softkeyPanel');
        if (skPanels.classList.contains('visible')) {
            skPanels.classList.remove('visible', 'focused');
        }
    };

    symbolInput.prototype.inKey = function inKey(key) {
        switch (key) {
            case 'BrowserBack':
            case 'Enter':
            case 'ArrowLeft':
            case 'ArrowRight':
            case 'ArrowUp':
            case 'ArrowDown':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
            case '*':
            case '#':
                processKey(key);
                break;
            default:
                break;
        }
    };

    symbolInput.prototype.deleteTable = function deleteTable() {
        removeTable();
        softkey && softkey.hide();
    };

    symbolInput.prototype.initOptions = function initOptions() {
        if (!this.params) {
            this.params = {
                menuClassName: 'menu-button',
                items: [{
                        name: 'Prev',
                        priority: 1,
                        method: function func1() {
                            if (pageNum > 0) {
                                pageNum -= 1;
                            } else {
                                pageNum = 2;
                            }
                            createSymbolTable(pageNum);
                            selectCell();
                        }
                    },

                    {
                        name: 'OK',
                        priority: 2,
                        method: function func2() {}
                    },

                    {
                        name: 'Next',
                        priority: 3,
                        method: function func3() {
                            if (pageNum < 2) {
                                pageNum += 1;
                            } else {
                                pageNum = 0;
                            }
                            createSymbolTable(pageNum);
                            selectCell();
                        }
                    }
                ]
            }
        }

        return this.params;
    };

    symbolInput.prototype.isTable = function isTable() {
        if (document.getElementById('Symbols')) {
            return true;
        } else {
            return false;
        }
    };

    exports.SymbolInput = new symbolInput();

})(window);

(function(exports) {

    const timeInterval = 1000;
    var longPressTimer = null;
    var timeoutFinish = false;
    var pressedCount = 0;
    var digitIndex = 0;
    var lastKeyPressed;
    var finalKey = null;
    var lastFinalKey = null;
    var outKeyArray = [
        ['.', ',', '?', '!', '1', ';', ':', '/', '@', '-', '+', '_', '='],
        ['a', 'b', 'c', '2'],
        ['d', 'e', 'f', '3'],
        ['g', 'h', 'i', '4'],
        ['j', 'k', 'l', '5'],
        ['m', 'n', 'o', '6'],
        ['p', 'q', 'r', 's', '7'],
        ['t', 'u', 'v', '8'],
        ['w', 'x', 'y', 'z', '9'],
        [' ', '0']
    ];

    window.addEventListener('resetPressedCount', function(evt) {
        pressedCount = 0;
    });

    function sendEvent(key) {
        var evt = new CustomEvent('key-accepted', {
            bubbles: true,
            cancelable: false,
            detail: key
        });
        window.dispatchEvent(evt);
    };

    var arrowArray = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    function processDigit(key) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;

        if (key !== '0') {
            digitIndex = key - 1;
        } else {
            digitIndex = 9;
        }

        if (lastKeyPressed && lastKeyPressed !== key) {
            pressedCount = 0;
            if (!timeoutFinish) {
                sendEvent(lastFinalKey);
            }
        }
        timeoutFinish = false;

        finalKey = outKeyArray[digitIndex][pressedCount];
        pressedCount++;
        if (pressedCount == outKeyArray[digitIndex].length) {
            pressedCount = 0;
        }

        lastKeyPressed = key;
        lastFinalKey = finalKey;

        longPressTimer = window.setTimeout(function() {
            pressedCount = 0;
            timeoutFinish = true;
            sendEvent(finalKey);
        }, timeInterval)
    };

    var abcInput = function() {};

    abcInput.prototype.inDigit = function inDigit(key) {
        switch (key) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                processDigit(key);
                break;
            default:
                break;
        }
    };

    abcInput.prototype.outLetter = function outLetter() {
        return finalKey;
    };

    exports.abcInput = abcInput;

})(window);

var inputMode = 'T9';
var currentLetter = null;
var isKeyupAvailable = false;
const timeInterval = 1000;
const ArrowLeft = 'ArrowLeft';
const ArrowRight = 'ArrowRight';
const ArrowUp = 'ArrowUp';
const ArrowDown = 'ArrowDown';
const Backspace = 'Backspace';
const Enter = 'Enter';
const SoftLeft = 'SoftLeft';
const SoftRight = 'SoftRight';
const BrowserBack = 'BrowserBack';
const F1 = 'F1';

var enterAsterisk = false;
var enterSharp = false;
var sharpLongPressTimer = null;
var longPressTimer = null;

var t9keyboard = new T9Keyboard();

var symbol = window.SymbolInput;

var lastInputMode;

var nodeChanged = false;
var cursorBackward = false;
var defaultCursor = true;
var addNewLine = false;
var lastKeyPressed;

function T9Keyboard() {

    if (!window.Xt9Connect)
        return;

    this.setInputMode = function(mode) {
        if (getAllModes().indexOf(mode) !== -1) {
            inputMode = mode;
            showToast('Input Method: ' + inputMode);
        } else if (mode == 'Symbol') {
            sendSharpLongPressEvent();
        }
    }

    this.getInputModeList = function() {
        return getAllModes();
    }

    this.getActiveInputMode = function() {
        return inputMode;
    }

    function getAllModes() {
        var activeType = 'textNode';
        var indexType = inputFieldMapping.types.indexOf(activeType);
        return inputFieldMapping.modes[indexType];
        setInputField();
        if (!inputField) {
            return;
        } else {
            var activeType = getInputFieldType();
            var indexType = inputFieldMapping.types.indexOf(activeType);
            return inputFieldMapping.modes[indexType];
        }
    }

    window.addEventListener('keyup', function(evt) {
        var key = evt.key;
        if (key === '*' && isKeyupAvailable) {
            if (inputMode == '123' && getInputFieldType() != 'number') {
                evt.preventDefault();
                if (enterAsterisk == false) {
                    setInputFieldValue(xt9output.substring(0, cursorPos) + '*' +
                        xt9output.substring(cursorPos, xt9output.length));
                    cursorPos++;
                    setSelection(cursorPos, cursorPos);
                    xt9output = getInputFieldValue();
                    sendInputEvent();
                }
            }
            if (!!longPressTimer)
                window.clearTimeout(longPressTimer);
            if (enterAsterisk == true)
                enterAsterisk = false;
        }

        if (key === '#' && isKeyupAvailable) {
            isKeyupAvailable = false;
            if (inputMode == '123' && getInputFieldType() != 'number') {
                evt.preventDefault();
                if (enterSharp == false) {
                    setInputFieldValue(xt9output.substring(0, cursorPos) + '#' +
                        xt9output.substring(cursorPos, xt9output.length));
                    cursorPos++;
                    setSelection(cursorPos, cursorPos);
                    xt9output = getInputFieldValue();
                    sendInputEvent();
                }
            }

            if (inputMode == 'Abc' || inputMode == 'abc' || inputMode == 'ABC') {
                evt.preventDefault();
                if (enterSharp == false) {
                    setInputFieldValue(xt9output.substring(0, cursorPos) + ' ' +
                        xt9output.substring(cursorPos, xt9output.length));
                    cursorPos++;
                    setSelection(cursorPos, cursorPos);
                    xt9output = getInputFieldValue();
                }
            }

            if (inputMode == 'T9') {
                t9_ApplyCurrentChanges();
                t9EditCurrentInputField(evt);
            }

            if (!!sharpLongPressTimer) {
                window.clearTimeout(sharpLongPressTimer);
            }

            if (enterSharp == true)
                enterSharp = false;
        }
    });

    window.addEventListener('keyup', function(evt) {
        var key = evt.key;
        if ((key === '0' || key == Backspace) && isKeyupAvailable) {
            window.clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    });

    var card = document.getElementsByTagName('cards-setup-account-info')[0];
    if (card) {
        card.addEventListener('keydown', function(evt) {
            var key = evt.key;
            if (key == 'BrowserBack' && symbol.isTable()) {
                symbol.inKey(key);
                breakEventListen(evt);
            }
        });
    }

    function handleDivFocus(evt) {
        nodeChanged = true;
        setInputField();
        inNewInput = true;
    }

    function handleDivCursor(evt) {
        defaultCursor = false;
        setCursorPosition(evt);
    }

    function acceptCurrentLetter() {
        if (isKeyTimerActive) {
            keyAcceptedHandler({
                'detail': currentLetter
            });
        }
    }

    function setCursorPosition(evt) {
        var key = evt.key;
        var node = window.getSelection().getRangeAt(0).startContainer;
        if (inputMode == 'T9') {
            if (t9bar.wordCount >= 1)
                if (key == ArrowLeft || key == ArrowRight || key == ArrowUp || key == ArrowDown) {
                    breakEventListen(evt);
                    keydownHandler(evt);
                    return;
                }
                //return;
        }
        if (key == ArrowLeft) {
            acceptCurrentLetter();
            if (inputMode != 'T9')
                cursorPos--;
            if (inputMode == 'T9') {
                xt9connect.cursorPosition = cursorPos;
            }
            if (cursorPos == -1) {
                cursorPos = 0;
                nodeChanged = true;
            }
            if (inputMode != 'T9')
                setCursorSelection(node, cursorPos, cursorPos);
        } else if (key == ArrowRight) {
            acceptCurrentLetter();
            if (inputMode != 'T9')
                cursorPos++;
            if (inputMode == 'T9') {
                xt9connect.cursorPosition = cursorPos;
            }

            if (cursorPos == xt9output.length + 1) {
                cursorPos = xt9output.length;
                nodeChanged = true;
            }
            if (inputMode != 'T9')
                setCursorSelection(node, cursorPos, cursorPos);
        } else if (key == ArrowUp || key == ArrowDown) {
            nodeChanged = true; //needs for refreshing cursor position on changing text node
        }
    }

    function cursorOnExactDiv(div) {
        if (div) {
            div.addEventListener('keydown', handleDivCursor);
        }

    }

    function handleDivUpDown(evt) {
        var key = evt.key;
        if (key == ArrowUp || key == ArrowDown) {
            nodeChanged = true;
        }
    }

    function divHandleBackspace() {
        if (cursorPos == 0) {
            var focusNode = window.getSelection().focusNode;
            if (focusNode.previousSibling && focusNode.previousSibling.tagName == 'BR') {
                focusNode.previousSibling.remove();
                document.activeElement.removeChild(focusNode);
                return;
            }
        }
        if (cursorPos > 0) {
            acceptCurrentLetter();
            cursorPos--;
            cursorBackward = true;
            setInputFieldValue(xt9output.substring(0, cursorPos) + xt9output.substring(cursorPos + 1, xt9output.length));
            xt9output = getInputFieldValue();
            sendInputEvent();
        }
    }

    function setCursorSelection(currentNode, start, end) {
        window.getSelection().getRangeAt(0).setStart(currentNode, start);
        window.getSelection().getRangeAt(0).setEnd(currentNode, end);
    }

    function divHandlLongBackspace() {
        cursorBackward = true;
        var previousCursor = cursorPos;
        cursorPos = 0;
        setInputFieldValue(xt9output.substring(previousCursor, xt9output.length));
        xt9output = getInputFieldValue();
        //console.log('keyboard.js:: xt9output = ' + xt9output);
        setInputField();
        //console.log('keyboard.js:: init t9 with text: ' + xt9output);
        if (inputMode == 'T9')
            t9_Init();
        sendInputEvent();
    }

    function sendLongPressEvent(evtName) {
        longPressTimer = window.setTimeout(function() {
            var evt = new CustomEvent(evtName);
            window.dispatchEvent(evt);
        }, timeInterval);
    }

    function sendInputEvent(keyDetail) {
        keyDetail = keyDetail || 'not-back-key';
        var evt = new CustomEvent('input', {
            bubbles: true,
            detail: keyDetail
        });
        document.activeElement.dispatchEvent(evt);
    }

    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('changedView', onChangedView);

    var inputField;
    var inNewInput = true;
    var xt9connect = new Xt9Connect();
    var xt9CandidateWordArray = [];
    var t9bar = new T9Panel();
    var xt9output = '';
    var cursorPos = 0;
    var remapArrows = false;
    var reselectionMode = false;
    var i = 0;
    var useDefaultInputMode = true;
    var sendInput = true;
    var isKeyTimerActive = false;

    function abc_load(key) {
        var abc = new abcInput;
        abc.inDigit(key);
        currentLetter = abc.outLetter();
    }

    function symbol_init() {
        symbol.initSymbols();
    }

    function symbol_load(key) {
        symbol.inKey(key);
    }

    function symbol_unload() {
        symbol.deleteTable();
    }

    function onChangedView() {
        onBlur();
    }

    var keys = [Enter, /*Backspace, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,*/ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '#'];
    var numericArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    var arrowKeys = [ArrowUp, ArrowDown, ArrowLeft, ArrowRight];

    function onBlur() {
        t9_ApplyCurrentChanges();
        inNewInput = true;
        useDefaultInputMode = true;
        cursorPos = xt9output.length;
        setSelection(cursorPos, cursorPos);
        inputField = false;
    }

    function isActiveElementTextInput() {
        return (document.activeElement.tagName == 'INPUT' /*&& document.activeElement.getAttribute('type') == 'text'*/ ) ||
            (document.activeElement.tagName == 'DIV' && document.activeElement.getAttribute('contenteditable') == 'true') ||
            (document.activeElement.tagName == 'TEXTAREA');
    }

    function getInputFieldValue() {
        if (inputField.tagName == 'INPUT')
            return inputField.value;
        if (inputField.nodeName == '#text') {
            if (window.getSelection().getRangeAt(0).startContainer.nodeValue == null) {
                return '';
            } else {
                return window.getSelection().getRangeAt(0).startContainer.nodeValue;
            }
        }
    }

    function sendKeyToXt9connect(key) {
        var keyPrefix = 0;
        var keyChar;

        switch (key) {
            case Enter:
                if (!reselectionMode)
                    keyChar = 13;
                else {
                    keyPrefix = 224;
                    keyChar = 133;
                }
                //reselectionMode = false;
                break;
            case Backspace:
                keyChar = 8;
                break;
            case '#':
                keyChar = 32;
                break;
            case ArrowUp:
                keyPrefix = 224;
                keyChar = 72;
                break;
            case ArrowDown:
                keyPrefix = 224;
                keyChar = 80;
                break;
            case ArrowLeft:
                keyPrefix = 224;
                if (!remapArrows)
                    keyChar = 75;
                else
                    keyChar = 72
                break;
            case ArrowRight:
                keyPrefix = 224;
                if (!remapArrows)
                    keyChar = 77;
                else
                    keyChar = 80;
                break;
            default:
                keyChar = key.charCodeAt(0);
                break;
        }
        xt9connect.setLetter(keyPrefix, keyChar);
    }

    function setInputField() {
        var textNode = document.createTextNode('');
        var signatureInput = document.getElementsByClassName('signature-button')[0];
        if (signatureInput) {
            signatureInput.addEventListener('focus', handleDivFocus);
        }
        inputField = false;
        if (isActiveElementTextInput()) {
            if (document.activeElement.tagName == 'DIV') {
                var messageInput = document.getElementById('messages-input');
                cursorOnExactDiv(messageInput);
                if (messageInput) {
                    messageInput.addEventListener('keydown', handleDivCursor);
                }

                var recipientsDiv = document.getElementById('messages-recipients-list-container');
                cursorOnExactDiv(recipientsDiv);

                cursorOnExactDiv(signatureInput);
                if (recipientsDiv) {
                    recipientsDiv.addEventListener('keydown', handleDivUpDown);
                }

                if (signatureInput) {
                    signatureInput.addEventListener('keydown', handleDivCursor);
                }

                var currentTextNode = window.getSelection().getRangeAt(0).startContainer;

                if (addNewLine) {
                    addNewLine = false;
                    nodeChanged = true;

                    window.getSelection().modify('extend', 'right', 'word');

                    var divFocusOffset = window.getSelection().focusOffset;
                    var divAnchorOffset = window.getSelection().anchorOffset;

                    if (divFocusOffset > divAnchorOffset) {
                        window.getSelection().modify('extend', 'left', 'word');
                    } else {
                        window.getSelection().getRangeAt(0).insertNode(textNode);
                        setCursorSelection(textNode, 0, 0);
                    }

                    currentTextNode = window.getSelection().getRangeAt(0).endContainer;
                    setCursorSelection(currentTextNode, 0, 0);
                    if (inputMode == 'T9') {
                        t9_Init();
                        xt9output = currentTextNode.nodeValue;
                    }
                }

                if (currentTextNode.nodeValue == null) {
                    window.getSelection().modify('extend', 'left', 'word');
                    currentTextNode = window.getSelection().getRangeAt(0).startContainer;
                    setCursorSelection(currentTextNode, currentTextNode.length, currentTextNode.length);
                    xt9output = currentTextNode.nodeValue;
                    cursorPos = window.getSelection().getRangeAt(0).endOffset;
                }

                if (nodeChanged || currentTextNode.nodeValue == '' || inNewInput) {
                    nodeChanged = false;
                    xt9output = currentTextNode.nodeValue;
                    if (signatureInput) {
                        cursorPos = window.getSelection().getRangeAt(0).endOffset || currentTextNode.length; //cursor on blur
                    } else {
                        cursorPos = window.getSelection().getRangeAt(0).endOffset;
                    }

                    if (inputMode == 'T9') {
                        inputField = currentTextNode;
                        xt9connect.wholeWord = xt9output;
                        xt9connect.cursorPosition = cursorPos;
                    }
                }

                if (currentTextNode.nodeValue == null) {
                    window.getSelection().getRangeAt(0).insertNode(textNode);
                    setCursorSelection(textNode, 0, 0);

                    inputField = textNode;
                    xt9output = '';
                    cursorPos = 0;
                } else {
                    inputField = currentTextNode;
                }
                document.activeElement.addEventListener('blur', divOnBlur, false);
                return;
            }

            if (document.activeElement.tagName == 'INPUT') {
                inputField = document.activeElement;
                var currentInputFieldType = getInputFieldType();
                var currentInputFieldTypeIndex = inputFieldMapping.types.indexOf(currentInputFieldType);

                if (currentInputFieldTypeIndex == -1) {
                    inputField = false;
                    return;
                }
                inputField.addEventListener('blur', onBlur, false);
            }
        }
    }

    function divOnBlur() {
        useDefaultInputMode = true;
        inNewInput = true;
    }

    function getXt9connectOutputString() {
        return xt9connect.wholeWord;

    }

    function setInputFieldValue(value) {
        if (inputField.tagName == 'INPUT')
            inputField.value = value;
        if (inputField.nodeName == '#text') {
            inputField.nodeValue = value;
            var range = window.getSelection().getRangeAt(0);
            if (cursorBackward || inputMode == 'T9') {
                cursorBackward = false;
                range.setEnd(inputField, cursorPos);
                range.setStart(inputField, cursorPos);
            } else {
                range.setEnd(inputField, cursorPos + 1);
                range.setStart(inputField, cursorPos + 1);
            }
        }
    }

    function setSelection(start, end) {
        if (getInputFieldType() != 'textNode') {
            if (inputField.setSelectionRange) {
                inputField.setSelectionRange(start, end);
            }
        } else {
            var range = window.getSelection().getRangeAt(0);
            range.setStart(inputField, start);
            range.setEnd(inputField, end);
        }
    }

    function breakEventListen(evt) {
        evt.stopImmediatePropagation();
        evt.preventDefault();
    }

    function createT9Panel(param) {
        t9bar.hide();
        t9bar.setWordArray(param);

        t9bar.show();
    }

    function deleteT9Panel() {
        t9bar.hide();
    }

    function getCandidateWordArray() {
        var candidateWord = xt9connect.candidateWord;
        candidateWordArray = candidateWord.split(' ');
        candidateWordArray.length--;
        return candidateWordArray;
    }

    function setCurrentWordPosition(evt) {
        t9bar.wordCount = xt9connect.totalWord;
        if (arrowKeys.indexOf(evt.key) == -1 && keys.indexOf(evt.key) != -1) {
            t9bar.currentWordPosition = t9bar.wordIndex;
        } else if (evt.key == ArrowRight || evt.key == ArrowDown) {
            t9bar.currentWordPosition++;
        } else if (evt.key == ArrowLeft || evt.key == ArrowUp)
            t9bar.currentWordPosition--;
        t9bar.setArrowsLabel();
    }

    function deleteReselectionWord() {
        var txt = getInputFieldValue();
        var start, end = cursorPos;
        while (txt[start] != ' ') {
            start--;
            if (start == 0)
                break;
        }
        while (txt[end] != ' ') {
            end++;
            if (end == txt.length)
                break;
        }
    }

    function t9_Init() {
        var initText = getInputFieldValue(inputField);
        if (initText != '' && initText != undefined) {
            xt9connect.wholeWord = initText;
            xt9connect.cursorPosition = cursorPos;
        } else {
            xt9connect.initEmptyWord = true;
            xt9connect.cursorPosition = 0;
        }
        xt9CandidateWordArray = [];
        xt9output = getInputFieldValue(inputField);
        //cursorPos = xt9output.length;
        setSelection(cursorPos, cursorPos);
        remapArrows = false;
        reselectionMode = false;
    }

    function t9_ApplyCurrentChanges() {
        if (inputMode == 'T9') {
            var txt = getInputFieldValue();
            setInputFieldValue(txt);
            reselectionMode = false;
            if (xt9CandidateWordArray.length > 0) {
                sendKeyToXt9connect(Enter);
                cursorPos = xt9connect.cursorPosition;

            } else {
                sendKeyToXt9connect(Enter);
            }

            xt9output = xt9connect.wholeWord;
            //cursorPos = xt9output.length; //xt9connect.cursorPosition;
            setSelection(cursorPos, cursorPos);
            remapArrows = false;
            xt9CandidateWordArray = [];
            xt9connect.wholeWord = xt9output;
            deleteT9Panel();
        }
    }

    function endKeyHandler() {
        deleteT9Panel();
    }

    function setReselectionMode(key) {
        if (key == Enter && reselectionMode) {
            reselectionMode = false;
        } else if (xt9CandidateWordArray.length == 0 && key == Enter && (xt9output[cursorPos] != ' ' || xt9output[cursorPos - 1] != ' ')) {
            if (!(cursorPos == 0 && xt9output[cursorPos] == ' ') && !(cursorPos == xt9output.length && xt9output[cursorPos - 1] == ' ') && !(xt9output[cursorPos] == ' ' && xt9output[cursorPos - 1] == ' ') && xt9output != '') {
                reselectionMode = true;
            }
        }
    }

    function t9EditCurrentInputField(evt) {
        console.log('keyboard.js:: t9EditCurrentInputField');
        if (!(evt.key == Enter && inputMode == 'T9' && xt9output.substring(cursorPos - 1, cursorPos) == ' ' && t9bar.wordCount == 0))
            evt.preventDefault();
        if (keys.indexOf(evt.key) != -1 || arrowKeys.indexOf(evt.key) != -1 || evt.key == Backspace || evt.key == '#') {
            setReselectionMode(evt.key);
            sendKeyToXt9connect(evt.key);
            xt9CandidateWordArray = getCandidateWordArray();
            if (xt9CandidateWordArray.length > 0) {
                remapArrows = true;
                if (evt.key == ArrowDown) {
                    while (xt9CandidateWordArray[0].indexOf('>') != 0) {
                        sendKeyToXt9connect(ArrowRight);
                        xt9CandidateWordArray = getCandidateWordArray();
                        setCurrentWordPosition(evt);
                    }
                }
                if (evt.key == ArrowUp) {
                    while (xt9CandidateWordArray[0].indexOf('>') != 0) {
                        sendKeyToXt9connect(ArrowLeft);
                        xt9CandidateWordArray = getCandidateWordArray();
                        setCurrentWordPosition(evt);
                    }
                }
                createT9Panel(xt9CandidateWordArray);
                if (!(evt.key == Enter && inputMode == 'T9' && xt9output.substring(cursorPos - 1, cursorPos) == ' ' && t9bar.wordCount == 0))
                    breakEventListen(evt);
                setCurrentWordPosition(evt);
                if (!reselectionMode) {
                    setInputFieldValue(xt9output.substring(0, cursorPos) + t9bar.currentWord.replace('>', '') +
                        xt9output.substring(cursorPos, xt9output.length));
                    setSelection(cursorPos, cursorPos + t9bar.currentWord.replace('>', '').length);
                } else {
                    var txt = xt9output;
                    var start = cursorPos;
                    var end = cursorPos;
                    for (var q = cursorPos - 1; q >= 0; --q) {
                        if (txt[q] == ' ') {
                            q++;
                            start = q;
                            break;
                        }
                        start = q;
                    }
                    for (end = cursorPos; end < txt.length; end++) {
                        if (txt[end] == ' ') {
                            break;
                        }
                    }
                    setInputFieldValue(xt9output.substring(0, start) + t9bar.currentWord.replace('>', '') +
                        xt9output.substring(end, xt9output.length));
                    setSelection(start, start + t9bar.currentWord.replace('>', '').length);
                }
            } else {
                remapArrows = false;
                deleteT9Panel();
                xt9output = xt9connect.wholeWord;
                if (xt9output == undefined) xt9output = '';
                if (xt9output == '') cursorPos = 0;
                else
                    cursorPos = xt9connect.cursorPosition;
                setInputFieldValue(xt9output);
                setSelection(cursorPos, cursorPos);
            }
        }
    }

    function keyAcceptedHandler(evt) {
        if (isKeyTimerActive) {
            isKeyTimerActive = false;
            if (inputMode == 'abc') {
                setInputFieldValue(xt9output.substring(0, cursorPos) + evt.detail +
                    xt9output.substring(cursorPos, xt9output.length));
            } else if (inputMode == 'ABC') {
                setInputFieldValue(xt9output.substring(0, cursorPos) + evt.detail.toUpperCase() +
                    xt9output.substring(cursorPos, xt9output.length));
            } else if (inputMode == 'Abc') {
                setInputFieldValue(xt9output.substring(0, cursorPos) + getAbcLetter(evt.detail) +
                    xt9output.substring(cursorPos, xt9output.length));
            }
            cursorPos++;
            setSelection(cursorPos, cursorPos);
            xt9output = getInputFieldValue();

            var evt = new Event('input', {
                bubbles: true
            });
            document.activeElement.dispatchEvent(evt);
            sendInput = true;

            var evt = new CustomEvent('resetPressedCount', {
                bubbles: true,
                cancelable: false,

            });
            window.dispatchEvent(evt);
            sendArrowToNavigation = false;
        }
    }

    var loadSymbolTable = true;

    function symbolAcceptedHandler(evt) {
        setInputFieldValue(xt9output.substring(0, cursorPos) + evt.detail +
            xt9output.substring(cursorPos, xt9output.length));
        cursorPos++;
        setSelection(cursorPos, cursorPos);
        xt9output = getInputFieldValue();
        symbol_unload();
        loadSymbolTable = true;
        inputMode = lastInputMode;
        if (inputMode == 'T9') {
            t9_Init();
        }
    }

    function backAcceptedHandler(evt) {
        symbol_unload();
        loadSymbolTable = true;
        inputMode = lastInputMode;
    }

    function getInputFieldType() {
        if (inputField) {
            if (inputField.nodeName == '#text' && inputField.parentNode.tagName == 'DIV') {
                return 'textNode';
            } else {
                return inputField.getAttribute('type');
            }
        }
    }

    var inputFieldMapping = {
        types: ['textNode', 'text', 'email', 'tel', 'search', 'password', 'number', 'visiblepassword'],
        modes: [
            ['Abc', 'ABC', 'abc', 'T9', '123'], //textNode
            ['Abc', 'ABC', 'abc', 'T9', '123'], //text
            ['abc', '123'], //email
            ['123'], //tel
            ['abc', '123'], //search
            ['123', 'ABC', 'abc'], //password
            ['123'], //number
            ['123', 'ABC', 'abc'] // visiblepassword
        ]
    };

    function createToast() {
      var toast = document.getElementById('toast');

      if (!toast) {
        toast = document.createElement('span');
        toast.setAttribute('id', 'toast');
        document.body.appendChild(toast);

        toast.style.opacity = 0;
        toast.style.transition = 'opacity 300ms ease-in-out';
        toast.style.position = 'absolute';
        toast.style.top = 'var(--statusbar-height)';
        toast.style.left = '0';
        toast.style.width = '100%';
        toast.style.padding = '1rem';
        toast.style.boxSizing = 'border-box';
        toast.style.fontSize = '1.7rem';
        toast.style.textAlign = 'center';
        toast.style.color = 'var(--color-gs90)';
        toast.style.backgroundColor = 'var(--color-gs20)';
        toast.style.zIndex = '65000';
      }

      return toast;
    }

    function showToast(msg) {
        var instance = createToast();

        instance.textContent = msg;
        instance.style.opacity = 1;

        function removeToast() {
          instance.removeEventListener('transitionend', removeToast);
          instance.remove();
        }

        window.setTimeout(() => {
          instance.addEventListener('transitionend', removeToast);
          instance.style.opacity = 0;
        }, 1000);
    }

    function getNextInputModeForCurrentField() {
        var currentInputFieldType = getInputFieldType();
        var currentInputFieldTypeIndex = inputFieldMapping.types.indexOf(currentInputFieldType);
        var currentInputModeIndex = inputFieldMapping.modes[currentInputFieldTypeIndex].indexOf(inputMode);
        if (currentInputModeIndex == -1) {
            return inputFieldMapping.modes[currentInputFieldTypeIndex][0];
        }
        if (inputFieldMapping.modes[currentInputFieldTypeIndex].length > 1) {
            if (currentInputModeIndex == inputFieldMapping.modes[currentInputFieldTypeIndex].length - 1) {
                return inputFieldMapping.modes[currentInputFieldTypeIndex][0];
            } else {
                return inputFieldMapping.modes[currentInputFieldTypeIndex][currentInputModeIndex + 1];
            }
        } else {
            return inputFieldMapping.modes[currentInputFieldTypeIndex][currentInputModeIndex];
        }
    }

    function zeroLongPressHandler() {
        setInputFieldValue(xt9output.substring(0, cursorPos - 1) + '+' +
            xt9output.substring(cursorPos, xt9output.length));
        xt9output = getInputFieldValue();
        setSelection(cursorPos, cursorPos);
    }

    function asteriskLongPressHandler(evt) {
        if (inputMode == 'Symbol') return;
        if (inputMode == 'T9') {
            t9_ApplyCurrentChanges();
        }
        var nextInputMode = getNextInputModeForCurrentField();
        inputMode = nextInputMode;
        showToast('Input Method: ' + inputMode);
        if (inputMode == 'T9') {
            setInputField();
            t9_Init();
        }
        useDefaultInputMode = false;
    }

    function sharpLongPressHandler() {
        if (inputMode !== 'Symbol') {
            lastInputMode = inputMode;
        }
        inputMode = 'Symbol';
        useDefaultInputMode = false;
        if (loadSymbolTable) {
            symbol_init();
            loadSymbolTable = false;
        } else {
            symbol_unload();
            loadSymbolTable = true;
            inputMode = lastInputMode;
        }
    }

    window.addEventListener('asterisk-long-press', asteriskLongPressHandler);
    window.addEventListener('backspace-long-press', backspaceHandler);
    window.addEventListener('backspace-long-press-div', divHandlLongBackspace);
    window.addEventListener('zero-long-press', zeroLongPressHandler);
    window.addEventListener('sharp-long-press', sharpLongPressHandler);
    window.addEventListener('key-accepted', keyAcceptedHandler);
    window.addEventListener('symbol-accepted', symbolAcceptedHandler);
    window.addEventListener('back-accepted', backAcceptedHandler);
    window.addEventListener('end-key-pressed', endKeyHandler);

    function setDefaultInputMethod() {
        var inputFieldType = getInputFieldType();
        var typeIndex = inputFieldMapping.types.indexOf(inputFieldType);
        inputMode = inputFieldMapping.modes[typeIndex][0];
        useDefaultInputMode = false;
    }

    function getAbcLetter(letter) {
        var endSymbols = ['.', '!', '?']
        for (var p = cursorPos - 1; cursorPos >= 0; p--) {
            if (xt9output[p] != ' ') {
                break;
            }
        }
        if (xt9output[p + 1] == ' ' && endSymbols.indexOf(xt9output[p]) != -1 || xt9output == '')
            return letter.toUpperCase();
        else
            return letter;

    }

    function backspaceHandler() {
        console.log('keyboard.js:: backspaceHandler');
        if (inputMode == 'T9') {
            if (xt9CandidateWordArray.length == 0) {
                setInputFieldValue(xt9output.substring(cursorPos, xt9output.length));
                cursorPos = 0;
                setSelection(cursorPos, cursorPos);
                xt9output = getInputFieldValue();
                t9_Init();
            }
        } else {
            setInputFieldValue(xt9output.substring(cursorPos, xt9output.length));
            cursorPos = 0;
            setSelection(cursorPos, cursorPos);
            xt9output = getInputFieldValue();
        }
        var evt = new Event('input', {
            bubbles: true
        });
        document.activeElement.dispatchEvent(evt);
    }

    function sendSharpLongPressEvent() {
        t9_ApplyCurrentChanges();
        var evt = new CustomEvent('sharp-long-press');
        window.dispatchEvent(evt);
        enterSharp = true;
    }

    var sendArrowToNavigation = true;

    function keydownHandler(evt) {
        sendArrowToNavigation = true;
        var key = evt.key;

        if (key == 'Notification') useDefaultInputMode = false;

        if (key == 'Enter') {
            acceptCurrentLetter();
        }
        if (lastKeyPressed == 'Enter') addNewLine = true;
        if (document.activeElement.tagName == 'DIV' && !symbol.isTable() && (inputMode != 'T9' || (inputMode == 'T9' && xt9output.substring(cursorPos - 1, cursorPos) == ' ') && t9bar.wordCount == 0)) {
            lastKeyPressed = key;
        }
        //if (!inputField || inNewInput)
        if (key == Enter && inputMode == 'T9' && xt9output.substring(cursorPos - 1, cursorPos) == ' ' && t9bar.wordCount == 0)
            return;
        setInputField();

        var currentInputFieldType = getInputFieldType();
        var currentInputFieldTypeIndex = inputFieldMapping.types.indexOf(currentInputFieldType);

        if (!!inputField && currentInputFieldTypeIndex != -1) {
            isKeyupAvailable = true;
            if (useDefaultInputMode) {
                setDefaultInputMethod();
            }

            if (inputMode == 'T9') {
                if (inNewInput) {
                    inNewInput = false;
                    t9_Init();
                    console.log('keyboard.js:: t9 init');
                }
            } else {
                if (inNewInput) {
                    inNewInput = false;
                    xt9output = getInputFieldValue();
                    console.log('keyboard.js:: xt9output(2): ' + xt9output);
                    if (getInputFieldType() == 'textNode') {
                        if (cursorPos > xt9output.length) {
                            cursorPos = xt9output.length;
                        }
                        setSelection(cursorPos, cursorPos);
                    } else {
                        cursorPos = inputField.selectionStart;
                    }
                } else {
                    if (getInputFieldValue() == '') {
                        cursorPos = 0;
                        xt9output = '';
                    }
                }
            }

            cursorPositionBefore = cursorPos;

            if (inputMode == 'Symbol') {
                breakEventListen(evt);
                symbol_load(key);
                if (currentInputFieldType == 'textNode') {
                    sendInputEvent();
                }
            }

            if (key == '*') {
                evt.preventDefault();
                longPressTimer = window.setTimeout(function() {
                    var evt = new CustomEvent('asterisk-long-press');
                    window.dispatchEvent(evt);
                    enterAsterisk = true;
                }, timeInterval);


            } else if (key == '#' && getInputFieldType() != 'number') {
                evt.preventDefault();
                sharpLongPressTimer = window.setTimeout(sendSharpLongPressEvent, timeInterval);
            } else {
                if (inputMode == 'T9') {

                    if (!!inputField) {
                        if (inNewInput) {
                            inNewInput = false;
                            t9_Init();
                        }
                        if (!(t9bar.wordCount <= 5 && t9bar.wordCount >= 1 && (key == ArrowUp || key == ArrowDown)))
                            t9EditCurrentInputField(evt);
                        else
                            breakEventListen(evt);
                        if (key == Backspace) {
                            if (currentInputFieldType == 'textNode') {
                                breakEventListen(evt);
                                sendLongPressEvent('backspace-long-press-div');
                                return;
                            }
                            longPressTimer = window.setTimeout(function() {
                                var evt = new CustomEvent('backspace-long-press');
                                window.dispatchEvent(evt);
                            }, timeInterval);
                        }
                    }
                }
                if (inputMode == 'abc' || inputMode == 'ABC' || inputMode == 'Abc') {
                    if (!!inputField) {
                        if (keys.indexOf(evt.key) != -1 && key != Enter)
                            breakEventListen(evt);

                        if (key == ArrowLeft) {
                            if (!defaultCursor) {
                                defaultCursor = true;
                                return;
                            }
                            acceptCurrentLetter();
                            cursorPos--;
                            if (cursorPos == -1) {
                                cursorPos = 0;
                            }
                            setSelection(cursorPos, cursorPos);
                        } else if (key == ArrowRight) {
                            if (!defaultCursor) {
                                defaultCursor = true;
                                return;
                            }
                            if (isKeyTimerActive) {
                                keyAcceptedHandler({
                                    'detail': currentLetter
                                });
                            } else
                                cursorPos++;
                            if (cursorPos == xt9output.length + 1) {
                                cursorPos = xt9output.length;
                            }
                            setSelection(cursorPos, cursorPos);
                        } else if (key == Backspace) {
                            if (currentInputFieldType == 'textNode') {
                                breakEventListen(evt);
                                divHandleBackspace();
                                sendLongPressEvent('backspace-long-press-div');
                                return;
                            }
                            if (cursorPos > 0) {
                                acceptCurrentLetter();
                                setInputFieldValue(xt9output.substring(0, cursorPos - 1) +
                                    xt9output.substring(cursorPos, xt9output.length));
                                cursorPos--;
                                setSelection(cursorPos, cursorPos);
                                xt9output = getInputFieldValue();
                                longPressTimer = window.setTimeout(function() {
                                    var evt = new CustomEvent('backspace-long-press');
                                    window.dispatchEvent(evt);
                                }, timeInterval);
                            }

                        } else if (numericArray.indexOf(key) != -1) {
                            sendInput = false;
                            abc_load(key);
                            isKeyTimerActive = true;
                            if (inputMode == 'abc') {
                                setInputFieldValue(xt9output.substring(0, cursorPos) + currentLetter +
                                    xt9output.substring(cursorPos, xt9output.length));
                                setSelection(cursorPos, cursorPos + 1);
                            } else if (inputMode == 'ABC') {
                                setInputFieldValue(xt9output.substring(0, cursorPos) + currentLetter.toUpperCase() +
                                    xt9output.substring(cursorPos, xt9output.length));
                                setSelection(cursorPos, cursorPos + 1);
                            } else if (inputMode == 'Abc') {
                                setInputFieldValue(xt9output.substring(0, cursorPos) + getAbcLetter(currentLetter) +
                                    xt9output.substring(cursorPos, xt9output.length));
                                setSelection(cursorPos, cursorPos + 1);
                            }
                            if (currentInputFieldType == 'textNode') {
                                if (!(document.activeElement.classList.contains('focus') && document.activeElement.classList.contains('recipient'))) {
                                    sendInputEvent();
                                }
                            }
                        }
                    }
                }
                if (inputMode == '123') {
                    if (!!inputField) {
                        if (keys.indexOf(evt.key) != -1 && key != Enter)
                            breakEventListen(evt);
                        if (key != '*') {
                            if (key == ArrowLeft) {
                                if (!defaultCursor) {
                                    defaultCursor = true;
                                    return;
                                }
                                cursorPos--;
                                if (cursorPos == -1)
                                    cursorPos = 0;
                                setSelection(cursorPos, cursorPos);
                            } else
                            if (key == ArrowRight) {
                                if (!defaultCursor) {
                                    defaultCursor = true;
                                    return;
                                }
                                cursorPos++;
                                if (cursorPos == xt9output.length + 1)
                                    cursorPos = xt9output.length;
                                setSelection(cursorPos, cursorPos);
                            } else if (key == Backspace) {
                                if (currentInputFieldType == 'textNode') {
                                    breakEventListen(evt);
                                    divHandleBackspace();
                                    sendLongPressEvent('backspace-long-press-div');
                                    return;
                                }
                                if (cursorPos > 0) {
                                    setInputFieldValue(xt9output.substring(0, cursorPos - 1) +
                                        xt9output.substring(cursorPos, xt9output.length));
                                    cursorPos--;
                                    setSelection(cursorPos, cursorPos);
                                    xt9output = getInputFieldValue();
                                    longPressTimer = window.setTimeout(function() {
                                        var evt = new CustomEvent('backspace-long-press');
                                        window.dispatchEvent(evt);
                                    }, timeInterval);
                                }

                            } else if (numericArray.indexOf(key) != -1 || ((key == '*' || key == '#') && getInputFieldType() != 'number')) {
                                setInputFieldValue(xt9output.substring(0, cursorPos) + key +
                                    xt9output.substring(cursorPos, xt9output.length));
                                cursorPos++;
                                if (key === '0' && getInputFieldType() != 'number') {
                                    evt.preventDefault();
                                    longPressTimer = window.setTimeout(function() {
                                        var evt = new CustomEvent('zero-long-press');
                                        window.dispatchEvent(evt);
                                    }, timeInterval)
                                }
                                setSelection(cursorPos, cursorPos);
                                xt9output = getInputFieldValue();
                            }
                        }
                    }
                }
            }
            if (arrowKeys.indexOf(key) != -1 || key == Backspace) {
                if (cursorPos != cursorPositionBefore || sendArrowToNavigation == false) {
                    console.log('keyboard.js:: break arrow event, sendArrowToNavigation = ' + sendArrowToNavigation);
                    breakEventListen(evt);
                } else {
                    console.log('keyboard.js:: send arrow to navigation: ' + key);
                }
            }
            if (key != Enter && key != ArrowDown && key != ArrowUp && key != SoftRight && key != SoftLeft &&
                key !== F1 && sendInput) {
                if (key == BrowserBack && inputMode == 'T9' && t9bar.wordCount > 0)
                    t9_ApplyCurrentChanges();
                if (document.activeElement.classList.contains('focus') && document.activeElement.classList.contains('recipient') && sendInput) {
                    console.log('keyboard.js:: in "to" field in messages');
                } else {
                    if (key == '*' || key == '#') return;
                    if (key != BrowserBack) {
                        sendInputEvent();
                    } else {
                        sendInputEvent('back-key');
                    }
                }
            }
        }
    }
}

function T9Panel() {
    this.currentWord = '';
    this.currentWordPosition = 0;
    this.wordCount = 0;
    this.wordIndex = 0;
    var self = this;
    var wordsArray = '';
    var scrollValue = 0;

    this.show = function() {
        self.hide();
        var divT9 = document.createElement('div');
        divT9.setAttribute('id', 't9bar');

        var wordsList = document.createElement('div');
        wordsList.setAttribute('id', 'content');

        var arrows = document.createElement('div');
        arrows.setAttribute('id', 'arrows');
        arrows.innerHTML = '↓';

        divT9.appendChild(wordsList);
        if (document.getElementById('softkeyPanel')) {
            var softKeyPanel = document.getElementById('softkeyPanel');
            softKeyPanel.parentNode.insertBefore(divT9, softKeyPanel);
            softKeyPanel.parentNode.insertBefore(arrows, softKeyPanel);
        } else {

            document.body.appendChild(divT9);
            document.body.appendChild(arrows);
        }
        for (var i = 0; i < wordsArray.length; i++) {
            var wordsListItem = document.createElement('div');
            wordsListItem.innerHTML = wordsArray[i].replace('>', '');
            wordsListItem.setAttribute('id', wordsArray[i]);
            if (wordsArray[i].indexOf('>') == 0) {
                wordsListItem.style.backgroundColor = 'CornflowerBlue';
                self.currentWord = wordsArray[i];
                self.wordIndex = i;
            }
            wordsList.appendChild(wordsListItem);
        }
        self.scrollValue = self.scrollCenter();
        divT9.scrollLeft = self.scrollValue;
    }

    function div(val, by) {
        return (val - val % by) / by;
    }

    this.setArrowsLabel = function() {
        var arrowsDiv = document.getElementById('arrows');
        if (self.currentWordPosition == -1) self.currentWordPosition = self.wordCount - 1;
        if (self.currentWordPosition == self.wordCount) self.currentWordPosition = 0;

        if (self.wordCount > 5) {
            if (self.currentWordPosition >= 0 && self.currentWordPosition <= 4)
                arrowsDiv.innerHTML = '↓';
            else if (self.currentWordPosition <= self.wordCount - 1 && (self.currentWordPosition >= div(self.wordCount, 5) * 5))
                arrowsDiv.innerHTML = '↑';
            else arrowsDiv.innerHTML = '↑↓';
            arrowsDiv.style.display = 'block';
            document.getElementById('t9bar').style.width = 'calc(100% - 1cm)';
        } else {
            arrowsDiv.style.display = 'none';
            document.getElementById('t9bar').style.width = '100%';
        }

    };

    this.hide = function() {
        var element = document.getElementById('t9bar');
        if (!!element) element.parentNode.removeChild(element);
        var element = document.getElementById('arrows');
        if (!!element) element.parentNode.removeChild(element);
        self.wordCount = 0;
    }

    this.setWordArray = function(array) {
        wordsArray = array;
    }

    this.scrollCenter = function() {
        var childArray = child('content', 'div');
        for (var i = 0; i < childArray.length; i++) {
            if (childArray[i].getAttribute('id').indexOf('>') == 0) {
                var pos = childArray[i].getBoundingClientRect();
                var contentDiv = document.getElementById('content');
                var contentDivWidth = contentDiv.clientWidth;
                scrollValue = (pos.left - contentDivWidth / 2) + (pos.right - pos.left) / 2;
                return scrollValue;
            }
        }
    }

    function child(id, tag) {
        var node = document.getElementById(id),
            children = node.childNodes,
            i, length = children.length,
            array = [];
        tag = tag.toUpperCase();
        for (i = 0; i < length; i++) {
            if (children[i].tagName == tag) {
                array.push(children[i]);
            }
        }
        return array;
    }

    function isElemOnScreen(elem) {
        var pos = elem.getBoundingClientRect();
        var contentDiv = document.getElementById('content');
        var contentDivWidth = contentDiv.clientWidth;
        if ((pos.left > 0) && (pos.right < contentDivWidth)) {
            return true;
        } else {
            return false;
        }
    }

    this.getWordArray = function() {
        return wordArray;
    }
}
