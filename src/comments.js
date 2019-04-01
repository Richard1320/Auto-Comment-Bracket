#!/usr/bin/env node

'use strict';

if (!String.prototype.cut) {
  String.prototype.cut = function(i0, i1) {
    return this.substring(0, i0) + this.substring(i1);
  };
}
// Remove comments from string
exports.removeComments = function(data, commentPrefix, commentSuffix) {
  if (!commentPrefix) {
    commentPrefix = '/*';
  }
  if (!commentSuffix) {
    commentSuffix = '*/';
  }
  var commentSuffixLength = commentSuffix.length;
  var commentStart = data.indexOf(commentPrefix, commentStart);
  var commentEnd =
    data.indexOf(commentSuffix, commentStart) + commentSuffixLength;

  // While comment start is found
  // And comment end is found
  // And comment end point is after start point
  while (commentStart > -1 && commentEnd > -1 && commentEnd > commentStart) {
    // Cut current comment
    data = data.cut(commentStart, commentEnd);

    // Get next comment start
    commentStart = data.indexOf(commentPrefix);
    commentEnd =
      data.indexOf(commentSuffix, commentStart) + commentSuffixLength;
  }
  return data;
}; // End remove comments

exports.removePreviousComments = function(data) {
  // Remove credit at top
  data = exports.removeComments(
    data,
    '/* ACB: // This file has been commented by Auto-Comment-Bracket',
    '\n'
  );

  // Remove ACB comments from previous executions
  data = exports.removeComments(data, ' /* ACB: // ');

  // Remove ACB comments without a space in front
  data = exports.removeComments(data, '/* ACB: // ');

  return data;
};

exports.checkRanges = function(number, ranges) {
  var x = 0;
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
exports.commentsArrayLoop = function(data, prefix, suffix, array) {
  var suffixLength = suffix.length;
  var commentStart = data.indexOf(prefix);
  var commentEnd = -1;
  var obj = {};

  // Loop through block comments
  while (commentStart > -1) {
    // check if comment start is not inside an existing comment
    if (!exports.checkRanges(commentStart, array)) {
      commentEnd = data.indexOf(suffix, commentStart) + suffixLength;

      obj = {
        start: commentStart,
        end: commentEnd,
      };
      array.push(obj);
    }
    // Get next comment start
    commentStart = data.indexOf(prefix, commentStart + 1);
  }

  return array;
}; // End comments array loop

exports.commentsArray = function(data) {
  var array = [];

  // Add a new line to data. If last line is a line comment, it won't find the "end" and won't be added to the comment array.
  data = data + '\n';

  // Loop through block comments
  array = exports.commentsArrayLoop(data, '/*', '*/', array);

  // Loop through line comments
  array = exports.commentsArrayLoop(data, '//', '\n', array);

  return array;
}; // End comments array
