#!/usr/bin/env node

'use strict';

if (!String.prototype.cut) {
  String.prototype.cut = function(i0, i1) {
    return this.substring(0, i0)+this.substring(i1);
  }
}

// Remove comments from string
exports.removeComments = function(data,commentPrefix) {
  if (!commentPrefix) {
    commentPrefix = '/*';
  }
  var commentSuffix       = '*/';
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
