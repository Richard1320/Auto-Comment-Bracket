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

        let options = Object.assign({}, program);

        // Check if output directory is defined
        if (program.output) {
          let outputDir = program.output;
          let lastChar  = outputDir.substr(-1); // Selects the last character
          if (lastChar != '/') {               // If the last character is not a slash
            outputDir = outputDir + '/';       // Append a slash to it.
          }
          options.output = outputDir + file;
        } else {
          options.output = path + file;
        }

        // Check if current item is a file
        if (stats.isFile()) {
          // Check if file is CSS or SCSS extension
          let extension = filepath.split('.').pop().toLowerCase();
          if (extension == 'css' || extension == 'scss') {
            parseFile.processFile(filepath,options);
          }
          // console.log(extension);
        }


        // Check if current item is directory and recursive option is enabled
        if (stats.isDirectory() && program.recursive) {
          // console.log(options.output);
          if (!fs.existsSync(options.output)){
            fs.mkdirSync(options.output);
          }
          exports.loopDir(filepath,options);
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
