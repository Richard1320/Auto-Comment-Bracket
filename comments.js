#!/usr/bin/env node

'use strict';

if (!String.prototype.cut) {
  String.prototype.cut = function(i0, i1) {
    return this.substring(0, i0)+this.substring(i1);
  }
}

// Remove comments from string
exports.removeComments = function(data,commentPrefix,commentSuffix) {
  if (!commentPrefix) {
    commentPrefix = '/*';
  }
  if (!commentSuffix) {
    commentSuffix = '*/';
  }
  var commentSuffixLength = commentSuffix.length;
  var commentStart        = data.indexOf(commentPrefix,commentStart);
  var commentEnd          = -1;
  while (commentStart > -1) {
    commentEnd   = data.indexOf(commentSuffix,commentStart) + commentSuffixLength;
    data         = data.cut(commentStart,commentEnd);
    commentStart = data.indexOf(commentPrefix);
  }
  return data;
}; // End remove comments
exports.commentsArray = function(data) {
  var commentPrefix       = '/*';
  var commentSuffix       = '*/';
  var commentSuffixLength = commentSuffix.length;
  var commentStart        = data.indexOf(commentPrefix,commentStart);
  var commentEnd          = -1;
  var array               = [];
  var obj                 = {};
  while (commentStart > -1) {
    commentEnd = data.indexOf(commentSuffix,commentStart) + commentSuffixLength;

    obj = {
      start: commentStart,
      end: commentEnd,
    };
    array.push(obj);

    commentStart = data.indexOf(commentPrefix,commentStart+1);
  }
  return array;
}; // End comments array
exports.checkRanges = function(number,ranges) {
  var x    = 0;
  var test = false;
  for (x = 0; x < ranges.length; x++) {
    if (number > ranges[x].start && number < ranges[x].end) {
      // console.log('num in range '+number+' x '+x+ ' start '+ranges[x].start+ ' end '+ranges[x].end)
      test = true;
      break;
    }
  }
  return test;
}; // end check ranges
