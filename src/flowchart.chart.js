function FlowChart(container, options) {
  options = options || {};

  this.paper = new Raphael(container);

  this.options = f.defaults(options, o);

  this.symbols = [];
  this.lines = [];
  this.start = null;
}

FlowChart.prototype.handle = function(symbol) {
  if (this.symbols.indexOf(symbol) <= -1) {
    this.symbols.push(symbol);
  }

  var flowChart = this;

  if (symbol instanceof(Condition)) {
    symbol.yes = function(nextSymbol) {
      symbol.yes_symbol = nextSymbol;
      if(symbol.no_symbol) {
        symbol.pathOk = true;
      }
      return flowChart.handle(nextSymbol);
    };
    symbol.no = function(nextSymbol) {
      symbol.no_symbol = nextSymbol;
      if(symbol.yes_symbol) {
        symbol.pathOk = true;
      }
      return flowChart.handle(nextSymbol);
    };
  } else {
    symbol.then = function(nextSymbol) {
      symbol.next = nextSymbol;
      symbol.pathOk = true;
      return flowChart.handle(nextSymbol);
    };
  }

  return symbol;
};

FlowChart.prototype.startWith = function(symbol) {
  this.start = symbol;
  return this.handle(symbol);
};

FlowChart.prototype.render = function() {
  var maxWidth = 0,
      i = 0,
      len = 0,
      maxX = 0,
      maxY = 0,
      symbol;

  for (i = 0, len = this.symbols.length; i < len; i++) {
    symbol = this.symbols[i];
    if (symbol.width > maxWidth) {
      maxWidth = symbol.width;
    }
  }

  for (i = 0, len = this.symbols.length; i < len; i++) {
    symbol = this.symbols[i];
    symbol.shiftX((maxWidth - symbol.width)/2);
  }

  this.start.render();
  // for (i = 0, len = this.symbols.length; i < len; i++) {
  //   symbol = this.symbols[i];
  //   symbol.render();
  // }

  for (i = 0, len = this.symbols.length; i < len; i++) {
    symbol = this.symbols[i];
    symbol.renderLines();
  }

  maxX = this.maxXFromLine;

  for (i = 0, len = this.symbols.length; i < len; i++) {
    symbol = this.symbols[i];
    var x = symbol.getX() + symbol.width;
    var y = symbol.getY() + symbol.height;
    if (x > maxX) {
      maxX = x;
    }
    if (y > maxY) {
      maxY = y;
    }
  }

  this.paper.setSize(maxX + this.options['line-width'], maxY + this.options['line-width']);
};

FlowChart.prototype.clean = function() {
  if (this.paper) {
    var paperDom = this.paper.canvas;
    paperDom.parentNode.removeChild(paperDom);
  }
};