#!/usr/bin/env node

/*
 * example from package 'ansi' adapted for this package.
 */

/**
 * Invokes the terminal "beep" sound once per second on every exact second.
 */

process.title = 'beep'

var ansi = require('../../')(process.stdout)

function beep () {
  ansi.beep()
  setTimeout(beep, 1000 - (new Date()).getMilliseconds())
}

setTimeout(beep, 1000 - (new Date()).getMilliseconds())
