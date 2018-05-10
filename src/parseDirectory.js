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

    // console.log(path);

  } );

}; // end loop directory
