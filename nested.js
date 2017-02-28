#!/usr/bin/env node

'use strict';

var undo = require('./undo.js');

exports.getNestedUntilClose = function(data,index,nestedArray) {
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

    // Ignore any comments
    selector = undo.removeComments(selector);

    // Remove line breaks
    // selector = selector.replace(/(\r\n|\n|\r)/gm," ").trim();
    selector = selector.replace(/\s\s+/g, ' ').trim();

    cssObject = {
      'selector': selector,
      'start':    nextOpen,
    };
    nestedArray.push(cssObject);

    nextOpen = data.indexOf('{',nextOpen+1);
  }
  return nestedArray;
}; // End get nested until close
