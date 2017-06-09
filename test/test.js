var assert  = require('assert')
var Emitter = require('events').EventEmitter

var strung = require('strung')

var build = require('../lib/index.js')

var fake = function() {
  var result = new Emitter
  result.chunks = []
  result.write = function(data) { result.chunks.push(data) }
  return result
}

describe('test ansi2', function() {

  it('should build', function() {
    assert(build(fake()))
  })

  it('should cache it and return that cached value', function() {
    var stream = fake()
    var ansi = build(stream)
    assert(ansi)
    assert.equal(stream._ansi2, ansi)
    assert.equal(build(stream), ansi)
  })

  it('should build Ansi w/out new', function() {
    assert(build.Ansi(fake()))
  })

  it('should error if not provided an object', function() {
    assert.throws(function() {
      new build.Ansi('string')
    })
  })

  it('should error if not provided an object with a write() function', function() {
    assert.throws(function() {
      new build.Ansi({})
    })
  })

  it('should be enabled (true) based on isTTY w/out options', function() {
    var stream   = fake()
    stream.isTTY = true
    var ansi     = build(stream)
    assert(ansi)
    assert.equal(ansi.enabled, true)
  })

  it('should be enabled (false) based on isTTY w/out options', function() {
    var stream   = fake()
    stream.isTTY = false
    var ansi    = build(stream)
    assert(ansi)
    assert.equal(ansi.enabled, false)
  })

  it('should build w/option enabled=true', function() {
    var stream  = fake()
    var options = { enabled: true }
    var ansi    = build(stream, options)
    assert(ansi)
    assert.equal(ansi.enabled, true)
  })

  it('should build w/option enabled=false', function() {
    var options = { enabled: false }
    var ansi = build(fake(), options)
    assert(ansi)
    assert.equal(ansi.enabled, false)
  })

  it('should build and start in buffer mode w/option buffering=true', function() {
    var options = { buffering: true }
    var ansi = build(fake(), options)
    assert(ansi)
    assert.equal(ansi.write, ansi.bufferWrite)
  })

  it('should build and start in write mode w/option buffering=false', function() {
    var options = { buffering: false }
    var ansi = build(fake(), options)
    assert(ansi)
    assert.equal(ansi.write, ansi.sendWrite)
  })

  it('should not override write if it already has been', function() {
    function fn() {}
    var stream = fake()
    var original = stream.write
    stream.realWrite = fn
    var ansi = build(stream)
    assert(ansi)
    assert.equal(stream.realWrite, fn)
    assert.equal(stream.write, original)
  })

  it('should buffer content', function() {
    var stream = fake()
    var ansi = build(stream)
    ansi.buffer()
    ansi.write('one')
    ansi.write('two').write('three')
    ansi.flush()
    assert.deepEqual(stream.chunks, ['one', 'two', 'three'])
  })

  it('should beep...', function() {
    build(fake(), {enabled:true}).beep()
  })

  it('should NOT beep when disabled', function() {
    build(fake(), {enabled:false}).beep()
  })

  it('should move to the far left and erase line', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.write('testing')
    ansi.write(' testing2')
    ansi.restartLine().write('retest it')
    assert.equal(target.string, 'testing testing2\x1b[G\x1b[0Kretest it')
  })

  it('should goto(1, 2)', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.goto(1, 2)
    assert.equal(target.string, '\x1b[2;1H')
  })

  it('should not goto() when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.goto(1, 2)
    assert.equal(target.string, null)
  })

  it('should back()', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.back()
    assert.equal(target.string, '\x1b[D')
  })

  it('should back(2)', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.back(2)
    assert.equal(target.string, '\x1b[2D')
  })

  it('should not back() when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.back()
    assert.equal(target.string, null)
  })


  it('should reset', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.is.bold = true
    ansi.is.italic = true
    ansi.is.underline = true
    ansi.is.inverse = true
    ansi.fgCurrent = 123
    ansi.bgCurrent = 123
    ansi.reset()
    assert.equal(target.string, '\x1b[0m')
    assert.equal(ansi.is.bold, false)
    assert.equal(ansi.is.italic, false)
    assert.equal(ansi.is.underline, false)
    assert.equal(ansi.is.inverse, false)
    assert.equal(ansi.fgCurrent, 39)
    assert.equal(ansi.bgCurrent, 49)
  })

  it('should reset() w/out writing reset when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.is.bold = true
    ansi.is.italic = true
    ansi.is.underline = true
    ansi.is.inverse = true
    ansi.fgCurrent = 123
    ansi.bgCurrent = 123
    ansi.reset()
    assert.equal(target.string, null)
    assert.equal(ansi.is.bold, false)
    assert.equal(ansi.is.italic, false)
    assert.equal(ansi.is.underline, false)
    assert.equal(ansi.is.inverse, false)
    assert.equal(ansi.fgCurrent, 39)
    assert.equal(ansi.bgCurrent, 49)
  })

  it('should resetFg()', function() {
    var ansi = build(fake(), {enabled:true})
    ansi.fgCurrent = 123
    ansi.resetFg()
    assert.equal(ansi.fgCurrent, 39)
  })

  it('should resetBg()', function() {
    var ansi = build(fake(), {enabled:true})
    ansi.bgCurrent = 123
    ansi.resetBg()
    assert.equal(ansi.bgCurrent, 49)
  })

  it('should use RGB value (black) in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.rgb(0, 0, 0)
    assert.equal(target.string, '\x1b[38;5;16m')
  })

  it('should use RGB value (white) in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.rgb(255, 255, 255)
    assert.equal(target.string, '\x1b[38;5;231m')
  })

  it('should use RGB value (black) in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.rgbBg(0, 0, 0)
    assert.equal(target.string, '\x1b[48;5;16m')
  })

  it('should use RGB value (white) in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.rgbBg(255, 255, 255)
    assert.equal(target.string, '\x1b[48;5;231m')
  })

  it('should use hex color 000000 in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hex('000000')
    assert.equal(target.string, '\x1b[38;5;16m')
  })

  it('should use hex color #000000 in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hex('#000000')
    assert.equal(target.string, '\x1b[38;5;16m')
  })

  it('should use hex color FFFFFF in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hex('FFFFFF')
    assert.equal(target.string, '\x1b[38;5;231m')
  })

  it('should use hex color #FFFFFF in foreground', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hex('#FFFFFF')
    assert.equal(target.string, '\x1b[38;5;231m')
  })

  it('should use hex color 000000 in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hexBg('000000')
    assert.equal(target.string, '\x1b[48;5;16m')
  })

  it('should use hex color #000000 in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hexBg('#000000')
    assert.equal(target.string, '\x1b[48;5;16m')
  })

  it('should use hex color FFFFFF in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hexBg('FFFFFF')
    assert.equal(target.string, '\x1b[48;5;231m')
  })

  it('should use hex color #FFFFFF in background', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.hexBg('#FFFFFF')
    assert.equal(target.string, '\x1b[48;5;231m')
  })

  it('should skip setting the same foreground color', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.blue()
    ansi.blue()
    ansi.blue()
    assert.equal(target.string, '\x1b[34m')
  })

  it('should skip setting the same background color', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.blueBg()
    ansi.blueBg()
    ansi.blueBg()
    assert.equal(target.string, '\x1b[44m')
  })

  it('should skip writing the foreground color when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.blue()
    ansi.blue()
    ansi.blue()
    assert.equal(target.string, null)
  })

  it('should skip writing the background color when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.blueBg()
    ansi.blueBg()
    ansi.blueBg()
    assert.equal(target.string, null)
  })

  it('should write data provided to a foreground color function', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.blue('test')
    assert.equal(target.string, '\x1b[34mtest')
  })

  it('should write data provided to a background color function', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.blueBg('test')
    assert.equal(target.string, '\x1b[44mtest')
  })

  it('should bold() and boldReset()', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.bold().write('test').boldReset()
    assert.equal(target.string, '\x1b[1mtest\x1b[22m')
  })

  it('should bold(\'test\') and boldReset()', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.bold('test').boldReset()
    assert.equal(target.string, '\x1b[1mtest\x1b[22m')
  })

  it('should not output bold() when already bolded', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.is.bold = true
    ansi.bold('test')
    assert.equal(target.string, 'test')
  })

  it('should not output boldReset() when not bolded', function() {
    var target = strung()
    var ansi = build(target, {enabled:true})
    ansi.boldReset()
    assert.equal(target.string, null)
  })

  it('should not output bold() when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.bold('test')
    assert.equal(target.string, 'test')
  })

  it('should not output boldReset() when disabled', function() {
    var target = strung()
    var ansi = build(target, {enabled:false})
    ansi.is.bold = true
    ansi.boldReset()
    assert.equal(target.string, null)
  })

})
