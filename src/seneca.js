/* Copyright (c) 2010-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
// <style> p,ul,li { margin:5px !important; } </style>
'use strict';

// Current version, access using _seneca.version_ property.
var VERSION = '0.6.4'

// Node API modules
var util   = require('util');
var events = require('events');
var net    = require('net');
var repl   = require('repl');
var assert = require('assert');
var vm     = require('vm');

// External modules.
var stats        = require('rolling-stats');

// Internal modules.
var common        = require('./lib/common');

// Create utilities.
var arr = common.arrayify

var error = eraro({
  package:  'seneca',
  msgmap:   ERRMSGMAP(),
  override: true
})

// Module exports.
// Primary export function, creates a new Seneca instance.
// function init( seneca_options, more_options )
module.exports = require('./seneca/init');

// ### Declarations

// Seneca is an EventEmitter.
function Seneca() {
  events.EventEmitter.call(this)
  this.setMaxListeners(0)
}
util.inherits(Seneca, events.EventEmitter)
