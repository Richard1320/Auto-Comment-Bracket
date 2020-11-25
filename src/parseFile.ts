import fs from "fs";
import {checkRanges, commentsArray, removePreviousComments} from "./comments";
import {getNestedUntilClose} from "./nested";
import {ICommentPosition, ICssObject} from "../types";
import {CommanderStatic} from "commander";

/**
 * {JSDoc}
 *
 * The splice() method changes the content of a string by removing a range of
 * characters and/or adding new characters.
 *
 * @this {String}
 * @param {string} oldString The string before the splice.
 * @param {number} start Index at which to start changing the string.
 * @param {number} delCount An integer indicating the number of old chars to remove.
 * @param {string} newSubStr The String that is spliced in.
 * @return {string} A new string with the spliced substring.
 */
function splice(oldString: string, start: number, delCount: number, newSubStr: string): string {
	return (
		oldString.slice(0, start) + newSubStr + oldString.slice(start + Math.abs(delCount))
	);
}


export function writeFile(data: string, output: string) {
	try {
		const fd = fs.openSync(output, "w");
		fs.writeFileSync(fd, data);
		fs.closeSync(fd);
	} catch (err) {
		console.error("writefile err", err);
	}
}

export function applyBrackets(file: string, output: string): void {
	try {
		// Open & read file
		let data: string = fs.readFileSync(file, 'utf8');

		// Remove previous comments from data
		data = removePreviousComments(data);

		const comments: ICommentPosition[] = commentsArray(data);
		let nestedArray = getNestedUntilClose(data, 0, [], comments); // Get first set of items
		let nextClose = data.indexOf('}'); // First closing bracket check
		let cssObject: ICssObject = {}; // Object to push into array
		let cssArray: ICssObject[] = []; // Array holding all selectors
		let comment: string = '';
		let x: number;

		// Keep looking if bracket is in array
		while (checkRanges(nextClose, comments)) {
			nextClose = data.indexOf('}', nextClose + 1);
		}

		// Loop through all closing brackets
		while (nextClose > -1) {
			// If bracket is inside a comment, move onto next item
			if (checkRanges(nextClose, comments)) {
				nextClose = data.indexOf('}', nextClose + 1);
				// nestedArray = nested.getNestedUntilClose(data,nextClose,nestedArray,commentsArray);
				continue;
			}
			cssObject = nestedArray.pop() as ICssObject;
			cssObject.end = nextClose + 1;

			cssArray.push(cssObject);
			nestedArray = getNestedUntilClose(
				data,
				nextClose + 1,
				nestedArray,
				comments
			);
			nextClose = data.indexOf('}', nextClose + 1);
			// console.log(nestedArray);
		}

		// Reverse array before processing to prevent position leapfrogging
		cssArray.reverse();

		// Loop through & create new CSS file
		for (x = 0; x < cssArray.length; x++) {
			cssObject = cssArray[x];

			// Skip if object is empty
			if (!cssObject.selector) continue;

			comment = ' /* ACB: // ' + cssObject.selector + ' */';
			// console.log(cssObject);
			data = splice(data, cssObject.end as number, 0, comment);
		}
		// Add in credit at top
		data = splice(
			data,
			0,
			0,
			'/* ACB: // This file has been commented by Auto-Comment-Bracket - https://github.com/Richard1320/Auto-Comment-Bracket */ \n'
		);

		// Overwrite original file if no output file specified
		if (!output) {
			output = file;
		}

		writeFile(data, output);

	} catch (err) {
		console.error("apply brackets err", err);
	}

}

export function undoFile(file: string, output: string): void {
	try {
		// Open & read file
		let data: string = fs.readFileSync(file, 'utf8');
		// Overwrite original file if no output file specified
		if (!output) {
			output = file;
		}

		// Remove previous comments from data
		data = removePreviousComments(data);

		writeFile(data, output);

	} catch (err) {
		console.error("undofile err", err);
	}

}

export function processFile(file: string, program: CommanderStatic) {
	if (program.undo) {
		undoFile(file, program.output);
	} else {
		applyBrackets(file, program.output);
	}
}
