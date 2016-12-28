#!/usr/bin/env node

'use strict';


var fs      = require('fs');
var program = require('commander');

program
 .arguments('<file>')
 .option('-u, --username <username>', 'The user to authenticate as')
 .option('-p, --password <password>', 'The user\'s password')
 .action(function(file) {
   fs.readFile(file, 'utf8', function (err,data) {
     if (err) {
       return console.log(err);
     }
     console.log(data);
   });

  //  console.log('user: %s pass: %s file: %s',
  //      program.username, program.password, file);
 })
 .parse(process.argv);
