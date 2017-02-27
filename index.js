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


var getNestedUntilClose = function(data,index,nestedArray) {
  var nextOpen      = data.indexOf('{',index+1);
  var nextClose     = data.indexOf('}',index+1);
  var lastColon     = 0; // Last semicolon before selector start
  var lastOpen      = 0; // Last opening bracket before selector start
  var lastClose     = 0; // Last closing bracket before selector start
  var selector      = '';
  var selectorStart = 0; // Start index of nested selector
  var cssObject     = {}; // Object to push into array
  var currentCode   = ''; // Code up to current point in analyzed CSS

  // Loop through nested items
  while (nextOpen > -1 && nextOpen < nextClose) {

    // Get last semicolon or open bracket for start current item
    // Check for opening bracket in case parent is empty
    // Must be assigned AFTER selector but BEFORE cssObject
    currentCode   = data.substring(0, nextOpen);
    lastColon     = currentCode.lastIndexOf(';');
    lastOpen      = currentCode.lastIndexOf('{');
    lastClose     = currentCode.lastIndexOf('}');
    selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;


    // Get selector
    selector = data.substring(selectorStart, nextOpen);

    // Remove line breaks
    selector = selector.replace(/(\r\n|\n|\r)/gm,"").trim();

    cssObject = {
      'selector': selector,
      'start':    nextOpen,
    };
    nestedArray.push(cssObject);

    nextOpen = data.indexOf('{',nextOpen+1);
  }
  return nestedArray;
}; // End get nested until close

var processFile = function(file, output) {

  // Open & read file
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    } else {
      var nestedArray = getNestedUntilClose(data,0,[]); // Get first set of items
      var nextClose   = data.indexOf('}'); // First closing bracket check
      var cssObject   = {}; // Object to push into array
      var cssArray    = []; // Array holding all selectors
      var buffer      = '';
      var comment     = '';
      var x           = 0;

      // Loop through all
      while (nextClose > -1) {

        cssObject = nestedArray.pop();
        cssObject.end = nextClose+1;

        cssArray.push(cssObject);

        nestedArray = getNestedUntilClose(data,nextClose,nestedArray);
        nextClose = data.indexOf('}',nextClose+1);
        // console.log(nestedArray);
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
