#!/usr/bin/env node

'use strict';

var fs       = require('fs');
var comments = require('./comments.js');
var nested   = require('./nested.js');

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

exports.writeFile = function(data, output) {
  var buffer = '';

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

}; // End write file

exports.processFile = function(file, output) {

  // Open & read file
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    } else {

      // Remove comemnts from previous executions
      data = comments.removeComments(data,' /* CCC: // ');

      var commentsArray = comments.commentsArray(data);
      var nestedArray   = nested.getNestedUntilClose(data,0,[],commentsArray); // Get first set of items
      var nextClose     = data.indexOf('}'); // First closing bracket check
      var cssObject     = {}; // Object to push into array
      var cssArray      = []; // Array holding all selectors
      var comment       = '';
      var x             = 0;

      // Keep looking if bracket is in array
      while (comments.checkRanges(nextClose,commentsArray)) {
        nextClose = data.indexOf('}',nextClose+1);
      }

      // Loop through all closing brackets
      while (nextClose > -1) {

        // If bracket is inside a comment, move onto next item
        if (comments.checkRanges(nextClose,commentsArray)) {
          nextClose = data.indexOf('}',nextClose+1);
          // nestedArray = nested.getNestedUntilClose(data,nextClose,nestedArray,commentsArray);
          continue;
        }
        cssObject = nestedArray.pop();
        cssObject.end = nextClose+1;

        cssArray.push(cssObject);
        nestedArray = nested.getNestedUntilClose(data,nextClose+1,nestedArray,commentsArray);
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

      // Overwrite original file if no output file specified
      if (!output) {
        output = file;
      }

      exports.writeFile(data,output);
    }

  });

}; // End process file
exports.undoFile = function(file, output) {

  // Open & read file
  fs.readFile(file, 'utf8', function (err,data) {
    if (err) {
      return console.log(err);
    } else {
      // Overwrite original file if no output file specified
      if (!output) {
        output = file;
      }

      // Remove comemnts from previous executions
      data = comments.removeComments(data,' /* CCC: // ');

      exports.writeFile(data,output);

    }

  });

}; // End process file
