// 'ansi2' is adapted from package 'ansi'. thank you.

var NEWLINE      = '\n'.charCodeAt(0)
var PREFIX       = '\x1b['
var COLOR_SUFFIX = 'm'
var RESET        = PREFIX + '0' + COLOR_SUFFIX

module.exports      = build
module.exports.Ansi = Ansi // export it as a sub-property

// return one we already made or make a new one
function build(writable, options) {
  return writable && writable._ansi2 || (writable._ansi2 = new Ansi(writable, options))
}

function Ansi(writable, options) {

  if (!(this instanceof Ansi)) {
    return new Ansi(writable, options)
  }

  if (typeof writable != 'object' || typeof writable.write != 'function') {
    throw new Error('writable required')
  }

  this.writable  = writable
  this.enabled   = options ? (options.enabled === true) : writable.isTTY === true
  this.write     = (options && options.buffering) ? this.bufferWrite : this.sendWrite
  this._buffer   = []
  this.newlines  = 0
  this.fgCurrent = 39
  this.bgCurrent = 49
  this.is = {
    bold     : false,
    italic   : false,
    underline: false,
    inverse  : false,
  }

  if (!writable.realWrite) { // ensure writable notifies us of newlines
    writable.realWrite = writable.write
    writable.write = function ansi2Write(chunk, encoding, next) {
      var i, get

      get = (typeof chunk === 'string') ? char : byte

      for (i = 0; i < chunk.length; i++) {
        if (get(chunk, i) === NEWLINE) writable.emit('newline')
      }

      return writable.realWrite(chunk, encoding, next)
    }
  }

  // the build() function sets our instance on the writable, so use it:
  writable.on('newline', function() { writable._ansi2.newlines++ })
}

// helpers for the write() looking for newlines.
function byte(buffer, i) { return buffer[i] }
function char(string, i) { return string.charCodeAt(i) }


Ansi.prototype = {

  // one of these two are assigned to this.write to handle buffering/writing.
  sendWrite  : function(data) { this.writable.write(data) ; return this },
  bufferWrite: function(data) { this._buffer.push(data)   ; return this },

  // switch to buffer mode by changing write() from sendWrite() to bufferWrite()
  buffer: function () { this.write = this.bufferWrite ; return this },

  // switch to non-buffer mode by changing write() from bufferWrite() to sendWrite().
  // and sends buffered content.
  flush: function () {
    var i
    this.write = this.sendWrite
    for (i = 0; i < this._buffer.length; i++) this.write(this._buffer[i])
    this._buffer.length = 0
    return this
  },

  restartLine: function(pos) { return this.left(pos || 0).eraseAfter() },

  beep: function beep() {
    if (this.enabled) this.write('\x07')
    return this
  },

  goto: function goto(x, y) {
    if (this.enabled) this.write(PREFIX + (y | 0) + ';' + (x | 0) + 'H')
    return this
  },

  reset: function reset() {
    if (this.enabled) this.write(RESET)
    this.is.bold      = false
    this.is.italic    = false
    this.is.underline = false
    this.is.inverse   = false
    this.fgCurrent    = 39
    this.bgCurrent    = 49
    return this
  },

  resetFg: function resetFg() { return this._setFgColor('39', '\x1b[39m') },
  resetBg: function resetBg() { return this._setBgColor('49', '\x1b[49m') },

  rgb: function rgb(r, g, b) {
    return this._setFgColor('38;5;' + this._rgb(r, g, b), null)
  },

  rgbBg: function rgb(r, g, b) {
    return this._setBgColor('48;5;' + this._rgb(r, g, b), null)
  },

  // convert trio of 8 bit color values to single ansi color code.
  _rgb: function (r, g, b) {
    return 16
      + (Math.round(r / 255 * 5) * 36)
      + (Math.round(g / 255 * 5) *  6)
      + (Math.round(b / 255 * 5) *  1)
  },

  hex: function (color) {
    var colors = this._hex(color)
    return this.rgb(colors[0], colors[1], colors[2])
  },

  hexBg: function (color) {
    var colors = this._hex(color)
    return this.rgbBg(colors[0], colors[1], colors[2])
  },

  _hex: function (color) { // accepts CSS style color code
    var s = color[0] === '#' ? 1 : 0  // start index
    return [
      parseInt(color[s    ], 16) * 16 + parseInt(color[s + 1], 16),
      parseInt(color[s + 2], 16) * 16 + parseInt(color[s + 3], 16),
      parseInt(color[s + 4], 16) * 16 + parseInt(color[s + 5], 16),
    ]
  },

  _setFgColor: function setFgColor(code, string) {
    if (this.fgCurrent != code) {
      if (this.enabled) this.write(string || PREFIX + code + COLOR_SUFFIX)
      this.fgCurrent = code
    }
    return this
  },

  _setBgColor: function setBgColor(code, string) {
    if (this.bgCurrent != code) {
      if (this.enabled) this.write(string || PREFIX + code + COLOR_SUFFIX)
      this.bgCurrent = code
    }
    return this
  },
};


[ // add position functions
  ['up'         , 'A'],
  ['down'       , 'B'],
  ['forward'    , 'C'],
  ['back'       , 'D'],
  ['next'       , 'E'],
  ['previous'   , 'F'],
  ['left'       , 'G'],
  ['clearBelow' , '0J'],
  ['clearAbove' , '1J'],
  ['clear'      , '2J'],
  ['clearAll'   , '3J'],
  ['eraseBefore', '1K'],
  ['eraseAfter' , '0K'],
  ['eraseLine'  , '2K'],
  ['scrollUp'   , 'S'],
  ['scrollDown' , 'T'],
  ['save'       , 's'],
  ['restore'    , 'u'],
  ['position'   , '6n'],
  ['hide'       , '?25l'],
  ['show'       , '?25h'],
].forEach(function (values) {

  var code = values[1]

  Ansi.prototype[values[0]] = function(first) {
    var output, i

    if (this.enabled) {

      if (first) {
        output = PREFIX + Math.round(first)

        // none of these take multiple arguments...
        // istanbul ignore next
        for (i = 1; i < arguments.length; i++) {
          output += ';' + Math.round(arguments[i])
        }
      }

      else {
        output = PREFIX
      }

      this.write(output + code)
    }

    return this
  }
});


[ // add style functions (name, code, reset)
  ['bold'     , 1, 22],
  ['italic'   , 3, 23],
  ['underline', 4, 24],
  ['inverse'  , 7, 27],
].forEach(function (values) {

  var name  = values[0];

  (function() {
    var code  = PREFIX + values[1] + COLOR_SUFFIX

    Ansi.prototype[name] = function(data) {
      if (!this.is[name]) {
        if (this.enabled) this.write(code)
        this.is[name] = true
      }

      if (data) this.write(data)

      return this
    }
  })();

  (function() {
    var reset = PREFIX + values[2] + COLOR_SUFFIX

    Ansi.prototype[name + 'Reset'] = function() {
      if (this.is[name]) {
        if (this.enabled) this.write(reset)
        this.is[name] = false
      }

      return this
    }
  })();
});


[ // add color functions  (color, foreground code)
  ['black', 30],
  ['red'    , 31],
  ['green'  , 32],
  ['yellow' , 33],
  ['blue'   , 34],
  ['magenta', 35],
  ['cyan'   , 36],
  ['white'  , 37],
  ['grey'   , 90],
  ['gray'   , 90],
  ['blackBright'  , 90],
  ['redBright'    , 91],
  ['greenBright'  , 92],
  ['yellowBright' , 93],
  ['blueBright'   , 94],
  ['magentaBright', 95],
  ['cyanBright'   , 96],
  ['whiteBright'  , 97],
].forEach(function(values) {

  (function() {
    var code   = values[1]
    var string = PREFIX + code + COLOR_SUFFIX

    Ansi.prototype[values[0]] = function(data) {
      this._setFgColor(code, string)
      if (data) this.write(data)
      return this
    }
  })();

  (function() {
    var code   = values[1] + 10
    var string = PREFIX + code + COLOR_SUFFIX

    Ansi.prototype[values[0] + 'Bg'] = function(data) {
      this._setBgColor(code, string)
      if (data) this.write(data)
      return this
    }
  })();
});
