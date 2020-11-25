import fs from "fs";
import {CommanderStatic} from "commander";
import {processFile} from "./parseFile";

export function loopDir(path: string, program: CommanderStatic) {
	try {
		const files = fs.readdirSync(path);

		let lastChar: string = path.substr(-1); // Selects the last character
		if (lastChar != '/') {          // If the last character is not a slash
			path = path + '/';            // Append a slash to it.
		}
		// console.log(path);

		files.forEach(function (file) {
			const filepath: string = path + file;

			// Check filetype
			const stats = fs.lstatSync(filepath);

			let options = Object.assign({}, program);

			// Check if output directory is defined
			if (program.output) {
				let outputDir = program.output;
				let lastChar = outputDir.substr(-1); // Selects the last character
				if (lastChar != '/') {               // If the last character is not a slash
					outputDir = outputDir + '/';       // Append a slash to it.
				}
				options.output = outputDir + file;
			} else {
				options.output = path + file;
			}

			// Check if path does not match excluded files
			if (!program.exclude || filepath.indexOf(program.exclude) == -1) {
				// Check if current item is a file
				if (stats.isFile()) {
					// Check if file is CSS or SCSS extension
					const extension: string = filepath.split('.').pop() as string;
					const extensionLower: string = extension.toLowerCase();
					if (extensionLower == 'css' || extensionLower == 'scss') {
						processFile(filepath, options);
					}
				}


				// Check if current item is directory and recursive option is enabled
				if (stats.isDirectory() && program.recursive) {
					if (!fs.existsSync(options.output)) {
						fs.mkdirSync(options.output);
					}
					loopDir(filepath, options);
				}
			}


			// console.log(`Is file: ${stats.isFile()}`);
			// console.log(`Is directory: ${stats.isDirectory()}`);
			// console.log(`Is symbolic link: ${stats.isSymbolicLink()}`);
			// console.log(`Is FIFO: ${stats.isFIFO()}`);
			// console.log(`Is socket: ${stats.isSocket()}`);
			// console.log(`Is character device: ${stats.isCharacterDevice()}`);
			// console.log(`Is block device: ${stats.isBlockDevice()}`);
		});

	} catch (err) {
		console.error("loopdir error", err);

	}

}
