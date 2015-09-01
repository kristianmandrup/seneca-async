/* Copyright (c) 2010-2015 Richard Rodger, MIT License */
/* jshint node:true, asi:true, eqnull:true */
// <style> p,ul,li { margin:5px !important; } </style>
'use strict';

// Current version, access using _seneca.version_ property.

// Node API modules
var net    = require('net');
var repl   = require('repl');
var assert = require('assert');
var vm     = require('vm');
var init  = require('./seneca/init');

// External modules.
var stats        = require('rolling-stats');

// Internal modules.
// Create utilities.

// module.exports.lib = require('./lib');

// Module exports.
// Primary export function, creates a new Seneca instance.
// function init( seneca_options, more_options )
module.exports = require('./seneca/init');
