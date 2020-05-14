'use strict';

var fancylog = require('fancy-log');
var util = require('util');

function log() {
  process.stdout.write(util.format.apply(this, arguments)); 
}

module.exports = function() {
  // HACK: In order to show rsync's transfer progress, override `console` temporarily...
  var orig = console.log;
  console.log = log;
  var retval = fancylog.apply(this, arguments);
  console.log = orig;
  return retval;
};
