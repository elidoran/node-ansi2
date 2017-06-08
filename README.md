# ansi2
[![Build Status](https://travis-ci.org/elidoran/node-ansi2.svg?branch=master)](https://travis-ci.org/elidoran/node-ansi2)
[![Dependency Status](https://gemnasium.com/elidoran/node-ansi2.png)](https://gemnasium.com/elidoran/node-ansi2)
[![npm version](https://badge.fury.io/js/ansi2.svg)](http://badge.fury.io/js/ansi2)
[![Coverage Status](https://coveralls.io/repos/github/elidoran/node-ansi2/badge.svg?branch=master)](https://coveralls.io/github/elidoran/node-ansi2?branch=master)

ANSI stream control of position, style, and color via fluent API.

ansi2 sends ANSI escape codes to a writable stream to:

1. move the cursor around
2. clear portions of the screen, or all of it
3. use standard ANSI colors and RGB colors for both foreground and background
4. accepts CSS style colors
5. show/hide the cursor
6. emit a beep sound


## Install

```sh
npm install --save ansi2
```


## Table of Contents

1. [Usage: Base](#usage-base)
2. [Usage: Colors](#usage-colors)
3. [Usage: Styles](#usage-styles)
4. [Usage: Position](#usage-position)


## Usage: Base

```javascript
// wrap a writable stream
var ansi = require('ansi2')(process.stdout)

// write a string to stream.
// it's affected by the current color/style/position.
// default styling + color:
ansi.write('boring default text')

// reset the foreground, background, and styling.
ansi.reset()

// Or, reset only the foreground:
ansi.resetFg()

// Or, reset only the background:
ansi.resetBg()

// all functions are chainable:
ansi.reset().blue().blackBg().write('blah').reset().write('\n')
```


## Usage: Colors

Available colors as functions:

1. black
2. red
3. green
4. yellow
5. blue
6. magenta
7. cyan
8. white
9. grey/gray

Use the "bright" versions of those by adding suffix "Bright" to the function name.

Apply the color to the background by adding suffix "Bg" to the function name.

Apply both suffixes for a bright background (add suffix "BrightBg").

Other color functions accept RGB values and CSS style hex codes:

1. `rgb(r, g, b)` - Also has a background version as `rgbBg(r, g, b)`
2. `hex(string)` - Also has a background version as `hexBg(string)`. May have a hash symbol prefix, or not.

Color functions called with an argument will change the color and then write the string.

```javascript
ansi.blue().write('blue text')
// Or, use a shorthand, provide the text to the color function:
ansi.blue('blue text')

// still using blue for foreground.
// change the background now.
// standard colors have a "background" version
// by adding 'Bg' to their function name.
ansi.blackBg().write('blue on black text')


// or specify colors via RGB or hex values.
// all these change the color to red.
ansi.rgb(255, 0, 0)
ansi.hex('FF0000')
ansi.hex('#FF0000')
```


## Usage: Styles

Available styles as functions:

1. bold
2. italic
3. underline
4. inverse

Reset the style by adding suffix "Reset" to the function name.

Style functions called with an argument will change the style and then write the string.

```javascript
ansi.bold().write('bold text')
// Or, use a shorthand, provide the text to the color function:
ansi.bold('bold text')

ansi.italic()
// then, undo the bold styling only, retaining italic.
ansi.boldReset()
```


## Usage: Position

Available position functions:

1. up - move cursor up one line, or, pass a number argument to specify line count
2. down - move cursor down one line, or, pass a number argument to specify line count
3. forward - move cursor right one column, or, pass a number argument to specify column count
4. back - move cursor left one column, or, pass a number argument to specify column count
5. next - move cursor to the beginning (left) one line down, or, pass a number argument to specify line count
6. previous - move cursor to the beginning (left) one line up, or, pass a number argument to specify line count
7. left - move cursor to the beginning of the current line, or, pass a number argument to specify the column to move to
8. clearBelow - clear all screen data below current cursor position
9. clearAbove - clear all screen data above current cursor position (not history)
10. clear - clear entire screen (not history)
11. clearAll - clear entire screen and all scroll history
12. eraseBefore - erase line content to the left of the cursor position
13. eraseAfter - erase line content to the right of the cursor position
14. eraseLine - erase entire current line
15. scrollUp - scroll up one line, or, specify a number argument to specify how many lines to scroll
16. scrollDown - scroll down one line, or, specify a number argument to specify how many lines to scroll
17. save - save current cursor position
18. restore - restore current cursor position
19. position - get the current cursor position
20. hide - hide the cursor
21. show - show the cursor
22. restartLine - convenience function to move to the beginning of the line and erase all line content. specify a number argument and it will go to that column and then erase content after that position.
23. goto - convenience function to move to a specific line and column on the screen (both default to 0)

```javascript
// example using default, this will move up one line:
ansi.up()

// example specifying amount to move, this moves up 5 lines:
ansi.up(5)

// moves to the top left:
ansi.goto()

// moves to line 5 column 7:
ansi.goto(7, 5) // think (x, y)

// erase current line and then write new content:
ansi.restartLine().write('new text overwriting current line')

// or, restart back at a certain column to overwrite only the later part:
ansi.write('label: some text')        // shows whole string
    .restartLine(7).write('new text') // shows: label: new text
```


## [MIT License](LICENSE)
