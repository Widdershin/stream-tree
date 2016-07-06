var diagram = require('./lib/diagram').default;
var xs = require('xstream').default;

module.exports = {
  require: {
    'stream-tree': diagram,
    'assert': require('assert'),
    'xstream': xs
  },

  globals: {
    diagram: diagram,
    xs: xs
  }
}

