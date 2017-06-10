var ansi = require('ansi')({
  write: function() {},
  on: function() {},
})

module.exports = function () {
  ansi.bold().italic().underline().inverse().resetBold().resetItalic().resetUnderline().resetInverse().reset()

  ansi.black().red().green().yellow().blue().magenta().cyan().white().grey().reset()

  ansi.up().up(5).down().down(5).forward().forward(5).back().back(5).reset()
      .nextLine().nextLine(5).previousLine().previousLine(5).reset()
      .horizontalAbsolute().horizontalAbsolute(5).eraseData().eraseLine().reset()
      .scrollUp().scrollUp(5).scrollDown().scrollDown(5).reset()
      .savePosition().restorePosition().show().hide().reset()
}
