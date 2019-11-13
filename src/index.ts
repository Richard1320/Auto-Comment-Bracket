#!/usr/bin/env node

import program from "commander";
import {loopDir} from "./parseDirectory";
import {processFile} from "./parseFile";

program
	.arguments('<path>')
	.version('1.1.5', '-v, --version')
	.option('-o, --output <path>', 'The output path to be written')
	.option('-e, --exclude <path>', 'Excluded file path from directory loop')
	.option('-u, --undo', 'Remove comments added using this module')
	.option('-d, --directory', 'Loop through all files in directory')
	.option('-r, --recursive', 'Loop through all files in subdirectories')
	.action(function (path) {
		// console.log(program);

		// Check if looping through directory
		if (program.directory) {
			loopDir(path, program);
		} else {
			processFile(path, program);
		}
	})
	.parse(process.argv);
