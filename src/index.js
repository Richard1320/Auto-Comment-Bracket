#!/usr/bin/env node

'use strict';


var program = require('commander');
var parseFile = require('./parseFile.js');
var parseDirectory = require('./parseDirectory.js');


program
.arguments('<path>')
.version('1.0.3', '-v, --version')
.option('-o, --output <path>', 'The output path to be written')
.option('-u, --undo', 'Remove comments added using this module')
.option('-d, --directory', 'Loop through all files in directory')
.option('-r, --recursive', 'Loop through all files in subdirectories')
// .option('-p, --password <password>', 'The user\'s password')
.action(function(path) {
  // console.log(program);

  // Check if looping through directory
  if (program.directory) {
    parseDirectory.loopDir(path,program);
  } else {
    parseFile.processFile(path,program);
  }
})
.parse(process.argv);
