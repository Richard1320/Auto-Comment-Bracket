#!/usr/bin/env node

'use strict';

if (!String.prototype.splice) {
  /**
  * {JSDoc}
  *
  * The splice() method changes the content of a string by removing a range of
  * characters and/or adding new characters.
  *
  * @this {String}
  * @param {number} start Index at which to start changing the string.
  * @param {number} delCount An integer indicating the number of old chars to remove.
  * @param {string} newSubStr The String that is spliced in.
  * @return {string} A new string with the spliced substring.
  */
  String.prototype.splice = function(start, delCount, newSubStr) {
    return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
}


var fs      = require('fs');
var program = require('commander');

var cssObject  = {};
var cssArray   = [];
var selector   = '';
var buffer     = '';
var indexStart = 0; // Start position of current item
var indexOpen  = 0; // Position of opening bracket
var indexClose = 0; // Position of closing bracket
var comment    = '';
var x          = 0;





var processFile = function(file, output) {

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
        selector = selector.replace(/(\r\n|\n|\r)/gm,"").trim();

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

      // Reverse array before processing to prevent position leapfrogging
      cssArray.reverse();
      // console.log(cssArray);

      // Loop through & create new CSS file
      for(x = 0; x < cssArray.length; x++) {
        cssObject = cssArray[x];
        comment = ' /* CCC: // '+ cssObject.selector +' */';
        // console.log(cssObject);
        data = data.splice(cssObject.end, 0, comment);
      }

      if (output) {
        buffer = new Buffer(data);

        fs.open(output, 'w', function(err, fd) {
          if (err) {
            throw 'error opening file: ' + err;
          }

          fs.write(fd, buffer, 0, buffer.length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
              console.log('file written');
            })
          });
        });
      } else {
          console.log(data);
        }

      }

    });

  }; // End process file

  program
  .arguments('<file>')
  .option('-o, --output <filename>', 'The output file to be written')
  // .option('-u, --username <username>', 'The user to authenticate as')
  // .option('-p, --password <password>', 'The user\'s password')
  .action(function(file) {
    processFile(file,program.output);
    // console.log(program.output);
    //  console.log('user: %s pass: %s file: %s',
    //      program.username, program.password, file);
  })
  .parse(process.argv);
