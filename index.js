#!/usr/bin/env node

'use strict';


var fs      = require('fs');
var program = require('commander');

var cssObject  = {};
var cssArray   = [];
var selector   = '';
var indexStart = 0; // Start position of current item
var indexOpen  = 0; // Position of opening bracket
var indexClose = 0; // Position of closing bracket

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

      // Loop & search for opening brackets
      while ((indexOpen = data.indexOf('{',indexStart)) > -1) {

        selector = data.substring(indexClose, indexOpen);

        // Remove line breaks
        selector = selector.replace(/(\r\n|\n|\r)/gm,"");

        // Get closing bracket for current item
        // Must be assigned AFTER selector but BEFORE cssObject
        indexClose = data.indexOf('}',indexOpen) + 1;

        cssObject = {
          'selector': selector,
          'start':    indexOpen,
          'end':      indexClose
        };

        cssArray.push(cssObject);

        // console.log(selector);

        indexStart = indexOpen + 1; // Initialize next loop after current index
      }
      console.log(cssArray);
    }


  });

  //  console.log('user: %s pass: %s file: %s',
  //      program.username, program.password, file);
})
.parse(process.argv);
