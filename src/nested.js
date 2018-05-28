#!/usr/bin/env node

'use strict';

var comments = require('./comments.js');

// Lock selector start position
// Needs to be assigned outside as get nested function is called multiple times in a loop
// var lockSelectorStart = false;

exports.getNestedUntilClose = function(data,index,nestedArray,commentsArray) {
  var nextOpen          = data.indexOf('{',index+1);
  var nextClose         = data.indexOf('}',index+1);
  var lastColon         = 0; // Last semicolon before selector start
  var lastOpen          = 0; // Last opening bracket before selector start
  var lastClose         = 0; // Last closing bracket before selector start
  var selector          = '';
  var selectorStart     = 0; // Start index of nested selector
  var cssObject         = {}; // Object to push into array
  var currentCode       = ''; // Code up to current point in analyzed CSS
  var commentLineStart  = 0; // Position of last line comment start
  var commentBlockStart = 0; // Position of last block comment start
  var commentStart      = 0; // Position of last comment start

  // Keep looking if bracket is in array
  while (comments.checkRanges(nextClose,commentsArray)) {
    nextClose = data.indexOf('}',nextClose+1);
  }

  // Loop through nested items
  while (nextOpen > -1 && nextOpen < nextClose) {

    // If bracket is inside a comment, move onto next item
    if (comments.checkRanges(nextOpen,commentsArray)) {
      nextOpen = data.indexOf('{',nextOpen+1);
      continue;
    }

    // If bracket is preceded by a hash symbol,
    // move onto next item
    // It is probably a sass function variable e.g. .block--#{$i}
    if (data.charAt(nextOpen - 1) == '#') {
      // Lock opening search start in order to grab the proper selector
      // if (!lockSelectorStart) {
      //   lockSelectorStart = nextOpen;
      // }

      // Push empty object to skip on opposite closing bracket
      nestedArray.push({});

      // Skip to next opening bracket
      nextOpen = data.indexOf('{',nextOpen+1);
      continue;
    }

    // Get last semicolon or open bracket before current open bracket
    // Check for opening bracket in case parent is empty
    // Must be assigned AFTER selector but BEFORE cssObject
    currentCode = data.substring(0, nextOpen);
    // if (lockSelectorStart) {
    //   currentCode = data.substring(0, lockSelectorStart);
    //   lockSelectorStart = false;
    // }
    lastColon     = currentCode.lastIndexOf(';');
    lastOpen      = currentCode.lastIndexOf('{');
    lastClose     = currentCode.lastIndexOf('}');
    selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;

    // Use previous close if close is inside a bracket
    while (comments.checkRanges(selectorStart,commentsArray)) {
      commentBlockStart = currentCode.lastIndexOf('/*');
      commentLineStart  = currentCode.lastIndexOf('//');
      commentStart      = Math.max(commentBlockStart, commentLineStart);
      currentCode       = data.substring(0, commentStart);
      lastColon         = currentCode.lastIndexOf(';');
      lastOpen          = currentCode.lastIndexOf('{');
      lastClose         = currentCode.lastIndexOf('}');
      selectorStart     = Math.max(lastColon, lastOpen, lastClose) + 1;
    }

    // Get selector
    selector = data.substring(selectorStart, nextOpen);

    // Remove /* */ comments
    selector = comments.removeComments(selector);

    // Remove double-slash comments
    selector = comments.removeComments(selector,'//','\n');

    // Remove file imports
    selector = comments.removeComments(selector,'@import',';');

    // Remove SASS variable declarations
    selector = comments.removeComments(selector,'$',';');

    // Remove line breaks
    selector = selector.replace(/(\r\n|\n|\r)/gm," ").trim();

    // Concatenate spaces
    selector = selector.replace(/\s\s+/g, ' ');

    cssObject = {
      'selector': selector,
      'start':    nextOpen,
    };
    nestedArray.push(cssObject);

    nextOpen = data.indexOf('{',nextOpen+1);
  }
  return nestedArray;
}; // End get nested until close
