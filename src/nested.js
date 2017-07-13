#!/usr/bin/env node

'use strict';

var comments = require('./comments.js');

exports.getNestedUntilClose = function(data,index,nestedArray,commentsArray) {
  var nextOpen      = data.indexOf('{',index+1);
  var nextClose     = data.indexOf('}',index+1);
  var lastColon     = 0; // Last semicolon before selector start
  var lastOpen      = 0; // Last opening bracket before selector start
  var lastClose     = 0; // Last closing bracket before selector start
  var selector      = '';
  var selectorStart = 0; // Start index of nested selector
  var cssObject     = {}; // Object to push into array
  var currentCode   = ''; // Code up to current point in analyzed CSS
  var commentStart  = 0; // Position of comment start

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

    // Get last semicolon or open bracket for start current item
    // Check for opening bracket in case parent is empty
    // Must be assigned AFTER selector but BEFORE cssObject
    currentCode   = data.substring(0, nextOpen);
    lastColon     = currentCode.lastIndexOf(';');
    lastOpen      = currentCode.lastIndexOf('{');
    lastClose     = currentCode.lastIndexOf('}');
    selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;

    // Use previous close if close is inside a bracket
    if (comments.checkRanges(selectorStart,commentsArray)) {
      commentStart  = currentCode.lastIndexOf('/*');
      currentCode   = data.substring(0, commentStart);
      lastColon     = currentCode.lastIndexOf(';');
      lastOpen      = currentCode.lastIndexOf('{');
      lastClose     = currentCode.lastIndexOf('}');
      selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;
    }

    // Get selector
    selector = data.substring(selectorStart, nextOpen);

    // Remove /* */ comments
    selector = comments.removeComments(selector);

    // Remove double-slash comments
    selector = comments.removeComments(selector,'//','\n');

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
