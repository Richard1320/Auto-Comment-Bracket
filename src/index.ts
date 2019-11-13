#!/usr/bin/env node

import program from "commander";
import {loopDir} from "./parseDirectory";
import {processFile} from "./parseFile";

program
	.arguments('<inputPath>')
	.version('1.1.5', '-v, --version')
	.option('-o, --output <outputPath>', 'The output path to be written')
	.option('-e, --exclude <excludePath>', 'Excluded file path from directory loop')
	.option('-u, --undo', 'Remove comments added using this module')
	.option('-d, --directory', 'Loop through all files in directory')
	.option('-r, --recursive', 'Loop through all files in subdirectories')
	.action(function (inputPath) {
		// console.log(program);

		// Check if looping through directory
		if (program.directory) {
			loopDir(inputPath, program);
		} else {
			processFile(inputPath, program);
		}
	})
	.parse(process.argv);
