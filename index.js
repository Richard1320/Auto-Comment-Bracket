#!/usr/bin/env node

'use strict';


var program = require('commander');
var parseFile = require('./parseFile.js');


program
.arguments('<file>')
.option('-o, --output <filename>', 'The output file to be written')
// .option('-u, --username <username>', 'The user to authenticate as')
// .option('-p, --password <password>', 'The user\'s password')
.action(function(file) {
  parseFile.processFile(file,program.output);
  // console.log(program.output);
  //  console.log('user: %s pass: %s file: %s',
  //      program.username, program.password, file);
})
.parse(process.argv);
