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

    files.forEach( function( file, index ) {
      var filepath = path + file;

      // Check filetype
      fs.lstat(filepath, (err, stats) => {
        if(err) {
          return console.log(err); //Handle error
        }


        // console.log(`Is file: ${stats.isFile()}`);
        // console.log(`Is directory: ${stats.isDirectory()}`);
        // console.log(`Is symbolic link: ${stats.isSymbolicLink()}`);
        // console.log(`Is FIFO: ${stats.isFIFO()}`);
        // console.log(`Is socket: ${stats.isSocket()}`);
        // console.log(`Is character device: ${stats.isCharacterDevice()}`);
        // console.log(`Is block device: ${stats.isBlockDevice()}`);
      });
    } );
  } );

}; // end loop directory
