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

var cssObject      = {}; // Object to push into array
var cssArray       = [];
var rootSelector   = '';
var buffer         = '';
var rootStart      = 0; // Start position of current root item
var rootOpen       = 0; // Position of opening bracket
var rootClose      = 0; // Position of closing bracket
var comment        = '';
var x              = 0;
var depth          = 0;
var nestedOpen     = 0;
var nestedClose    = 0;
var currentCode    = ''; // Current point in analyzed CSS
var hasNested      = false;

var getNestedUntilClose = function(data,index,nestedArray) {
  var nextOpen  = data.indexOf('{',index+1);
  var nextClose = data.indexOf('}',index+1);
  var lastColon = 0;
  var lastOpen  = 0;
  var lastClose = 0;
  var nestedSelector = '';
  var nestedStart    = 0; // Start index of nested selector

  // Loop through deep nested items
  while (nextOpen > -1 && nextOpen < nextClose) {

    // Get last semicolon or open bracket for start current item
    // Check for opening bracket in case parent is empty
    // Must be assigned AFTER selector but BEFORE cssObject
    currentCode = data.substring(0, nextOpen);
    lastColon   = currentCode.lastIndexOf(';');
    lastOpen    = currentCode.lastIndexOf('{');
    lastClose   = currentCode.lastIndexOf('}');
    nestedStart = Math.max(lastColon, lastOpen, lastClose) + 1;


    // Get selector
    nestedSelector = data.substring(nestedStart, nextOpen);

    // Remove line breaks
    nestedSelector = nestedSelector.replace(/(\r\n|\n|\r)/gm,"").trim();

    cssObject = {
      'selector': nestedSelector,
      'start':    nextOpen,
    };
    console.log(cssObject);
    nestedArray.push(cssObject);

    nextOpen = data.indexOf('{',nextOpen+1);
  }
  console.log('loop end');
  return nestedArray;
}; // End get nested until close

var processFile = function(file, output) {

  // Open & read file
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    } else {
      var nestedArray = []; // Array for nested item selectors
      var nextOpen       = 0; // Next opening bracket check for nested items
      var nextClose      = 0; // Next closing bracket check for nested items

      // Loop & search for opening brackets
      while ((rootOpen = data.indexOf('{',rootStart)) > -1) {
        hasNested = false;
        // Get selector
        rootSelector = data.substring(rootClose, rootOpen);

        // Remove line breaks
        rootSelector = rootSelector.replace(/(\r\n|\n|\r)/gm,"").trim();

        cssObject = {
          'selector': rootSelector,
          'start':    rootOpen,
        };
        nestedArray.push(cssObject);

        // Check position for next opening and closing bracket
        nextOpen  = data.indexOf('{',rootOpen + 1);

        // Set closing bracket for current item
        // Must be assigned AFTER selector but BEFORE cssObject
        // May be overwritten if nested items are found
        rootClose = data.indexOf('}',rootOpen + 1) + 1;

        // Check if next opening bracket is before closest closing bracket
        // If true, we have nested styles (SASS / Media Queries)
        if (nextOpen > -1 && nextOpen < rootClose) {
          hasNested = true;
          nestedArray = getNestedUntilClose(data,rootOpen,nestedArray);
          nextClose = rootClose;

          while (nextClose > -1) {


            cssObject = nestedArray.pop();
            cssObject.end = nextClose+1;

            cssArray.push(cssObject);

            nestedArray = getNestedUntilClose(data,nextClose,nestedArray);
            nextClose = data.indexOf('}',nextClose+1);

            if (nestedArray.length <= 1) {
              console.log('break');
              break;
            }

          }

          // Update index close to continue root rules
          rootClose = nextClose;

        } // End nested check

        cssObject = nestedArray.pop();
        cssObject.end = rootClose;
        // cssObject = {
        //   'selector': rootSelector,
        //   'start':    rootOpen,
        //   'end':      rootClose
        // };

        cssArray.push(cssObject);


        // Initialize next loop after current index
        // Check if there are any nested items to skip over
        if (hasNested) {
          rootStart = nextOpen + 1; // Use nested open for start of next loop
        } else {
          rootStart = rootOpen + 1; // Use root open for start of next loop
        }
      }

      // Reverse array before processing to prevent position leapfrogging
      cssArray.reverse();

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
