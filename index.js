#!/usr/bin/env node

'use strict';


var fs      = require('fs');
var program = require('commander');

var openingArray   = {};
var selector       = '';
var indexStart     = 0; // Start position of current item
var indexOpen      = 0; // Position of opening bracket
var indexClose     = 0; // Position of closing bracket
var selectorLength = 0; // String length of selector

program
.arguments('<file>')
.option('-u, --username <username>', 'The user to authenticate as')
.option('-p, --password <password>', 'The user\'s password')
.action(function(file) {

  // Open & read file
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    } else {
      // console.log(data);
      // indexOpen = data.indexOf('{',indexStart);
      // console.log(indexOpen);
      // Loop & search for opening brackets
      while ((indexOpen = data.indexOf('{',indexStart)) > -1) {
        selector = data.substring(indexClose, indexOpen);
        selectorLength = selector.length;
        console.log(selector);
        indexClose = data.indexOf('}',indexOpen) + 1;
        indexStart = indexOpen + selectorLength;
      }
    }


  });

  //  console.log('user: %s pass: %s file: %s',
  //      program.username, program.password, file);
})
.parse(process.argv);
