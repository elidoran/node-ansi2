var ansi = require('../../lib/index.js')({
  write: function() {}
})

module.exports = function() {
  ansi.bold().italic().underline().inverse().boldReset().italicReset().underlineReset().inverseReset().reset()

  ansi.black().red().green().yellow().blue().magenta().cyan().white().gray().reset()

  ansi.up().up(5).down().down(5).forward().forward(5).back().back(5).reset()
      .next().next(5).previous().previous(5).reset()
      .left().left(5).clear().eraseLine().reset()
      .scrollUp().scrollUp(5).scrollDown().scrollDown(5).reset()
      .save().restore().show().hide().reset()
}
