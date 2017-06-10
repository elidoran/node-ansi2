var benchmarked, format, pad, chalk, bold, dim, grey, ask, Benchmark;

// configure benchmarkjs to run longer than the default.
Benchmark = require('benchmark')
Benchmark.options.initCount  = 1000000 // initial loop count, first time
Benchmark.options.minTime    = 1  // seconds
Benchmark.options.maxTime    = 10 // seconds
Benchmark.options.minSamples = 100

benchmarked = require('benchmarked');
format      = require('comma-number');
pad         = require('pad');
chalk       = require('chalk');

bold  = chalk.bold;
dim   = chalk.dim;
grey  = chalk.grey;

ask = require('readline').createInterface({
  input : process.stdin,
  output: process.stdout
});

console.log('ansi2 benchmark (' + process.pid + ' ' +
  (process.execArgv.indexOf('--turbo') > -1 ? '- turbo' : '') + ')');

ask.question('Begin benchmark? (y/N)  ', function(answer) {

  ask.close();

  if ((answer != null) && (answer[0] === 'y' || answer[0] === 'Y')) {

    return require('benchmarked')({
      cwd     : __dirname,
      fixtures: 'inputs/*.js',
      code    : 'implementations/*.js',

      format  : function(bm) {
        var ess, name, ops, rme, runs, size;

        name = bold(pad(6, bm.name));
        ops  = pad(10, format(bm.hz.toFixed(bm.hz < 100 ? 2 : 0)));
        rme  = '\xb1' + bm.stats.rme.toFixed(2).slice(0, 4) + '%';
        size = pad(2, bm.stats.sample.length);
        ess  = bm.stats.sample.length === 1 ? ' ' : 's';
        runs = grey('run' + ess + ' sampled)');

        return name + ' ' + (dim('x')) + ' ' + ops + ' ' + (grey('ops/sec')) +
          ' ' + rme + ' ' + (grey('(')) + size + ' ' + runs;
      },

      renameKey: function(file) {
        return (file.stem === '_this_library') ? 'ansi2' : file.stem;
      }
    }).run();

  } else {
    return console.log('quitting');
  }
});
