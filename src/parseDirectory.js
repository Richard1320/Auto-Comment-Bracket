#!/usr/bin/env node

'use strict';

var fs       = require('fs');
var parseFile = require('./parseFile.js');

exports.loopDir = function(path, program) {
  fs.readdir( path, function( err, files ) {
    if( err ) {
      console.error( "Could not list the directory.", err );
      process.exit( 1 );
    }

    let lastChar = path.substr(-1); // Selects the last character
    if (lastChar != '/') {          // If the last character is not a slash
      path = path + '/';            // Append a slash to it.
    }
    // console.log(path);

  } );

}; // end loop directory
