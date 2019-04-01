#!/usr/bin/env node

'use strict';

var fs = require('fs');
var comments = require('./comments.js');
var nested = require('./nested.js');

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
    return (
      this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount))
    );
  };
}

exports.writeFile = function(data, output) {

  if (output) {

    fs.open(output, 'w', function(err, fd) {
      if (err) {
        throw 'error opening file: ' + err;
      }

      fs.writeFile(fd, data, function(err) {
        if (err) throw 'error writing file: ' + err;
        fs.close(fd, function() {
          console.log('file written to ' + output);
        });
      });
    });
  } else {
    console.log(data);
  }
}; // End write file
exports.applyBrackets = function(file, output) {
  // Open & read file
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    } else {
      // Remove previous comments from data
      data = comments.removePreviousComments(data);

      var commentsArray = comments.commentsArray(data);
      var nestedArray = nested.getNestedUntilClose(data, 0, [], commentsArray); // Get first set of items
      var nextClose = data.indexOf('}'); // First closing bracket check
      var cssObject = {}; // Object to push into array
      var cssArray = []; // Array holding all selectors
      var comment = '';
      var x = 0;

      // Keep looking if bracket is in array
      while (comments.checkRanges(nextClose, commentsArray)) {
        nextClose = data.indexOf('}', nextClose + 1);
      }

      // Loop through all closing brackets
      while (nextClose > -1) {
        // If bracket is inside a comment, move onto next item
        if (comments.checkRanges(nextClose, commentsArray)) {
          nextClose = data.indexOf('}', nextClose + 1);
          // nestedArray = nested.getNestedUntilClose(data,nextClose,nestedArray,commentsArray);
          continue;
        }
        cssObject = nestedArray.pop();
        cssObject.end = nextClose + 1;

        cssArray.push(cssObject);
        nestedArray = nested.getNestedUntilClose(
          data,
          nextClose + 1,
          nestedArray,
          commentsArray
        );
        nextClose = data.indexOf('}', nextClose + 1);
        // console.log(nestedArray);
      }

      // Reverse array before processing to prevent position leapfrogging
      cssArray.reverse();

      // Loop through & create new CSS file
      for (x = 0; x < cssArray.length; x++) {
        cssObject = cssArray[x];

        // Skip if object is empty
        if (!cssObject.selector) continue;

        comment = ' /* ACB: // ' + cssObject.selector + ' */';
        // console.log(cssObject);
        data = data.splice(cssObject.end, 0, comment);
      }
      // Add in credit at top
      data = data.splice(
        0,
        0,
        '/* ACB: // This file has been commented by Auto-Comment-Bracket - https://github.com/Richard1320/Auto-Comment-Bracket */ \n'
      );

      // Overwrite original file if no output file specified
      if (!output) {
        output = file;
      }

      exports.writeFile(data, output);
    }
  });
}; // End apply brackets
exports.undoFile = function(file, output) {
  // Open & read file
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    } else {
      // Overwrite original file if no output file specified
      if (!output) {
        output = file;
      }

      // Remove previous comments from data
      data = comments.removePreviousComments(data);

      exports.writeFile(data, output);
    }
  });
}; // End process file

exports.processFile = function(file, program) {
  if (program.undo) {
    exports.undoFile(file, program.output);
  } else {
    exports.applyBrackets(file, program.output);
  }
}; // End process file
