#!/usr/bin/env node

/*
 * example from package 'ansi' adapted for this package.
 */

/**
 * Like GNU ncurses "clear" command.
 * https://github.com/mscdex/node-ncurses/blob/master/deps/ncurses/progs/clear.c
 */

process.title = 'clear'

function lf () { return '\n' }

require('../../')(process.stdout)
  .write(Array.apply(null, Array(process.stdout.getWindowSize()[1])).map(lf).join(''))
  .eraseData(2)
  .goto(1, 1)
