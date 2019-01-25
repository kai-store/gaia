function T9Keyboard() {

    var inputField; 
    document.addEventListener("keydown", keydownHandler);
    var inNewInput = true;
    var xt9connect = new Xt9Connect();
    var array = [];
    var t9bar = new T9Panel();
    var output = '';
    var cursorPos = 0;
    var remapArrows = false;
    var reselectionMode = false;
    var i = 0;


    var keys = ["Enter", "Clear", "0", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];
    var arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

    function onBlur() {
        inNewInput = true;

        this.setSelectionRange(this.value.length, this.value.length);
        console.log("debug::ruazotov:: text input blur event");
    }

    function isActiveElementTextInput() {
        return (document.activeElement.tagName == "INPUT" && document.activeElement.getAttribute('type') == "text") ||
            (document.activeElement.tagName == "DIV" && document.activeElement.getAttribute('contenteditable') == "true");
    }

    function getInputFieldValue() {
        if (inputField.tagName == "INPUT")
            return inputField.value;
        if (inputField.tagName == "DIV")
            return inputField.innerHTML;
    }

    function sendKeyToXt9connect(key) {

        var keyPrefix = 0;
        var keyChar;

        switch (key) {
            case 'Enter':
                if (!reselectionMode)
                    keyChar = 13;
                else {
                    keyPrefix = 224;
                    keyChar = 133;
                }
                //reselectionMode = false;
                break;
            case 'Clear':
                keyChar = 8;
                break;
            case '0':
                keyChar = 32;
                break;
            case 'ArrowUp':
                keyPrefix = 224;
                keyChar = 72;
                break;
            case 'ArrowDown':
                keyPrefix = 224;
                keyChar = 80;
                break;
            case 'ArrowLeft':
                keyPrefix = 224;
                if (!remapArrows)
                    keyChar = 75;
                else
                    keyChar = 72
                break;
            case 'ArrowRight':
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
        inputField = false;
        if (isActiveElementTextInput()) {
            inputField = document.activeElement;
            inputField.removeEventListener("blur", onBlur, false);
            inputField.addEventListener("blur", onBlur, false);
        }
    }

    function getXt9connectOutputString() {
        return xt9connect.wholeWord;

    }

    function setInputFieldValue(value, startCursorPos, endCursorPos) {
        if (inputField.tagName == "INPUT")
            inputField.value = value;
        if (inputField.tagName == "DIV")
            inputField.innerHTML = value;


        if (inputField.setSelectionRange) {
            inputField.setSelectionRange(startCursorPos, endCursorPos);
        } else {
            setSelection(inputField, startCursorPos, endCursorPos);
        }
    }

    function setSelection(elem, startPos, endPos) {
        var charIndex = 0;
        var range = document.createRange();
        range.setStart(elem, 0);
        range.collapse(true);
        var nodeStack = [elem],
            node, foundStart = false,
            stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && startPos >= charIndex && startPos <= nextCharIndex) {
                    range.setStart(node, startPos - charIndex);
                    foundStart = true;
                }
                if (foundStart && endPos >= charIndex && endPos <= nextCharIndex) {
                    range.setEnd(node, endPos - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
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

    /*function isInWordSelectionMode() {
        var candidateWordArray = getCandidateWordArray();
        if (candidateWordArray.length > 0) return true;
        return false;
    }*/

    function setCurrentWordPosition(evt) {
        t9bar.wordCount = xt9connect.totalWord;
        if (arrowKeys.indexOf(evt.key) == -1 && keys.indexOf(evt.key) != -1) {
            t9bar.currentWordPosition = t9bar.wordIndex;
        } else if (evt.key == "ArrowRight" || evt.key == "ArrowDown") {
            t9bar.currentWordPosition++;
        } else if (evt.key == "ArrowLeft" || evt.key == "ArrowUp")
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

    function editCurrentInputField(evt) {
        evt.preventDefault();
        if (keys.indexOf(evt.key) != -1) {

            var txt = getInputFieldValue();
            if (evt.key == "Enter" && reselectionMode) {
                console.log("debug::ruazotov:: exit from reselection mode");
                reselectionMode = false;
            } else if (array.length == 0 && evt.key == "Enter" && (txt[cursorPos] != ' ' || txt[cursorPos - 1] != ' ')) {
                if (!(cursorPos == 0 && txt[cursorPos] == ' ') && !(cursorPos == txt.length && txt[cursorPos - 1] == ' ') && !(txt[cursorPos] == ' ' && txt[cursorPos - 1] == ' ')) {
                    console.log("debug::ruazotov:: enter to reselection mode");
                    reselectionMode = true;

                }
            }

            sendKeyToXt9connect(evt.key);
            array = getCandidateWordArray();
            console.log("debug::ruazotov:: array: " + array);
            if (array.length > 0) {
                remapArrows = true;
                if (evt.key == "ArrowDown") {
                    //sendKeyToXt9connect("ArrowRight");
                    while (array[0].indexOf('>') != 0) {
                        sendKeyToXt9connect("ArrowRight");
                        array = getCandidateWordArray();
                        setCurrentWordPosition(evt);
                        console.log("debug::ruazotov:: right arrow, +1 step");
                    }

                }
                if (evt.key == "ArrowUp") {
                    while (array[0].indexOf('>') != 0) {
                        sendKeyToXt9connect("ArrowLeft");
                        array = getCandidateWordArray();
                        setCurrentWordPosition(evt);
                        console.log("debug::ruazotov:: right arrow, -1 step");
                    }
                }

                createT9Panel(array);
                breakEventListen(evt);
                setCurrentWordPosition(evt);
                if (!reselectionMode)
                    setInputFieldValue(output.substring(0, cursorPos) + t9bar.currentWord.replace('>', '') +
                        output.substring(cursorPos, output.length), cursorPos, cursorPos + t9bar.currentWord.replace('>', '').length);
                else {
                    console.log("debug::ruazotov:: calculating start/end position to reselection");
                    var txt = output;
                    var start = cursorPos;
                    var end = cursorPos;
                    for (var q = cursorPos-1; q >= 0; --q) {
                        //console.log("debug::ruazotov:: start: " + start);
                        if (txt[q] == ' ') {
                            q++;
                            start = q;
                            break;
                        }
                        start = q;
                    }
                    for (end = cursorPos; end < txt.length; end++) {
                        if (txt[end] == ' ') {
                            //start++;
                            break;
                        }
                    }
                    console.log("debug::ruazotov:: need to delete from " + start + " to " + end);
                    setInputFieldValue(output.substring(0, start) + t9bar.currentWord.replace('>', '') +
                        output.substring(end, output.length), start, start + t9bar.currentWord.replace('>', '').length);
                }
            } else {

                remapArrows = false;
                deleteT9Panel();
                output = xt9connect.wholeWord;
                console.log("debug::ruazotov:: output: " + output);
                if (output == '') cursorPos = 0;
                else
                    cursorPos = xt9connect.cursorPosition;

                //console.log("debug::ruazotov:: cursorPos: " + cursorPos);
                setInputFieldValue(output, cursorPos, cursorPos);
            }
        } else {
            var evnt = document.createEvent("Event")

            evnt.initEvent("keydown", true, true);
            evnt.key = "Enter";

            editCurrentInputField(evnt);
            inNewInput = true;
            //console.log("debug::ruazotov:: output: " + output);
        }

    }

    function xt9connectInit(initText) {

        if (initText != '') {
            xt9connect.wholeWord = initText;
            output = initText;
            console.log("debug::ruazotov:: init with non-empty value *" + output + '*, input text length is ' + output.length);
            var p = getInputFieldValue();
            cursorPos = p.length;
        } else {
            xt9connect.initEmptyWord = true;
            output = '';
            console.log("debug::ruazotov:: init with empty value");
            cursorPos = 0;
        }

        if (inputField.setSelectionRange)
            inputField.setSelectionRange(cursorPos, cursorPos);
        else {
            setSelection(inputField, startCursorPos, endCursorPos);
        }
    }

    function keydownHandler(evt) {
        setInputField();
        if (!!inputField) {
            if (inNewInput) {
                inNewInput = false;
                xt9connectInit(getInputFieldValue());
            }
            editCurrentInputField(evt);
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
        divT9.setAttribute("id", "t9bar");

        var wordsList = document.createElement('div');
        wordsList.setAttribute("id", "content");

        var arrows = document.createElement('div');
        arrows.setAttribute("id", "arrows");
        arrows.innerHTML = "↓";

        divT9.appendChild(wordsList);
        if (document.getElementById("softkeyPanel")) {
            var softKeyPanel = document.getElementById("softkeyPanel");
            softKeyPanel.parentNode.insertBefore(divT9, softKeyPanel);
            softKeyPanel.parentNode.insertBefore(arrows, softKeyPanel);
        } else {

            document.body.appendChild(divT9);
            document.body.appendChild(arrows);
        }
        for (var i = 0; i < wordsArray.length; i++) {
            var wordsListItem = document.createElement("div");
            wordsListItem.innerHTML = wordsArray[i].replace('>', '');
            wordsListItem.setAttribute("id", wordsArray[i]);
            if (wordsArray[i].indexOf(">") == 0) {
                wordsListItem.style.backgroundColor = "CornflowerBlue";
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
        var arrowsDiv = document.getElementById("arrows");
        if (self.currentWordPosition == -1) self.currentWordPosition = self.wordCount - 1;
        if (self.currentWordPosition == self.wordCount) self.currentWordPosition = 0;

        console.log("debug::ruazotov:: current word position: " + self.currentWordPosition + '/' + self.wordCount);
        //console.log("debug::ruazotov:: word count: " + self.wordCount);
        if (self.currentWordPosition >= 0 && self.currentWordPosition <= 4)
            arrowsDiv.innerHTML = '↓';
        else if (self.currentWordPosition <= self.wordCount - 1 && (self.currentWordPosition >= div(self.wordCount, 5) * 5))
            arrowsDiv.innerHTML = '↑';
        else arrowsDiv.innerHTML = '↑↓';
    };

    this.hide = function() {
        var element = document.getElementById("t9bar");
        if (!!element) element.parentNode.removeChild(element);
        var element = document.getElementById("arrows");
        if (!!element) element.parentNode.removeChild(element);
    }

    this.setWordArray = function(array) {
        wordsArray = array;
    }

    this.scrollLeft = function(wordIndex) {

    }

    this.scrollRight = function(wordIndex) {

    }

    this.scrollCenter = function() {
        var childArray = child('content', 'div');
        for (var i = 0; i < childArray.length; i++) {
            if (childArray[i].getAttribute("id").indexOf(">") == 0) {
                var pos = childArray[i].getBoundingClientRect();
                var contentDiv = document.getElementById("content");
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
        var contentDiv = document.getElementById("content");
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

var t9Bar = new T9Keyboard();