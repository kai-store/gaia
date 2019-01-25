(function(exports) {

	var doc  = window.document;
	var body = doc.body;

	var lastParams;

	var div = document.createElement('div');
	div.setAttribute('id', 'Symbols');

	var pageNum = 0;

	var cSymbX = 0;
	var cSymbY = 0;
	var currentSymbol;

	var evtDel = false;

	var digit = [['1',  '2', '3'],
				 ['4',  '5', '6'],
				 ['7',  '8', '9'],
				 ['*',  '0', '#']];

	var symbol = [[['.',  '@', '?' ],
				   ['!',  '-', ',' ],
				   ['&',  ':', '\''],
				   ['\"', '+', '=' ]],
				  [['/',  '$', '*' ],
				   ['#',  '%', ';' ],
				   ['¡',  '¿', '\\'],
				   ['<',  '>', '(' ]],
				  [[')',  '[', ']' ],
				   ['_',  '{', '}' ],
				   ['^',  '~', '`' ],
				   ['|'            ]]];

	function sendEvent(key) {
		var evt = new CustomEvent('symbol-accepted', { bubbles: true, cancelable: false, detail: key });
		window.dispatchEvent(evt);
	};

	function removeTable() {
		if (document.getElementById('Symbols')) {
			document.getElementById('Symbols').remove();
		}
	};

	function createSymbolTable(pageIndex) {
		console.log('Debug::createSymbolTable::');
		div.style.position = 'absolute';
		div.style.zIndex = 65000;
		div.style.width = '25rem';
		div.style.height = '30rem';
		div.style.top = '12%';
		div.style.left = '10%';
		div.style.textAlign = 'center';
		div.style.fontSize = '4rem';
		div.style.lineHeight = 'normal';
		div.style.backgroundColor = '#333333';
		div.style.color = '#FFFFFF';
		div.innerHTML = 'Symbols '+(pageIndex+1);
		body.appendChild(div);
		
		var table = document.createElement('table');
		table.setAttribute('id', "symbol-table");
		table.style.width = '100%';
		table.style.height = '85%';
		table.align = "center";
		table.style.tableLayout = "fixed";

		var row;
		var cell;
		for (i=0; i<symbol[pageIndex].length; i++) {
			row = table.insertRow(i);
			for (j=0; j<symbol[pageIndex][i].length; j++) {
				cell = row.insertCell(j);
				cell.innerHTML = '<b style="background-color: #999999;">' + digit[i][j] + '</b>' + ' ' + symbol[pageIndex][i][j];
			}
			row.style.color = '#FFFFFF';
		}

		div.appendChild(table);
	};

	function selectCell(x, y) {
		x = x || 0;
		y = y || 0;
		var symbolTable = document.getElementById('symbol-table');
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

		var currentCell = symbolTable.rows[cSymbY].cells[cSymbX];
		if (currentCell===undefined) {
			cSymbX = symbolTable.rows[cSymbY].cells.length - 1;
			currentCell = symbolTable.rows[cSymbY].cells[cSymbX];
		}
		currentCell.style.outline = "1px solid #00CCFF";
		var cellContent = currentCell.innerHTML.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
		currentSymbol = cellContent.charAt(cellContent.length-1);
		// console.log('Debug::createSymbolTable::symbolTable currentSymbol '+currentSymbol);
	};

	function processKey(key) {
		var x = 0;
		var y = 0;

		switch (key) {
			case 'ArrowRight':
				// selectCell(1, 0);
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

		createSymbolTable(pageNum);
		selectCell(x, y);

		if (evtDel) {
			removeTable();
			evtDel = false;
		}
	};

	var symbolInput = function (){};

	symbolInput.prototype.initSymbols = function initSymbols() {

		createSymbolTable(pageNum);

        lastParams = OptionHelper.getLastParamName();
        // console.log('Debug::initSymbols:: lastParams '+lastParams);
        OptionHelper.show('symbol-option');
	};

	symbolInput.prototype.inKey = function inKey(key) {
		switch (key) {
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
		OptionHelper.show(lastParams);
	};

	symbolInput.prototype.initOptions = function initOptions(OptionHelper) {
		var params = {
			menuClassName: 'menu-button',
			items: [
				{
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
					method: function func2() {
					}
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
		OptionHelper.optionParams['symbol-option'] = params;
	};

	symbolInput.prototype.isTable = function isTable() {
		if (document.getElementById('Symbols')) {
			return true;
		}
	};

	exports.SymbolInput = new symbolInput();

})(window);