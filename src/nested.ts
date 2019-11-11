import {ICommentPosition, ICssObject} from "../types";
import {checkRanges, removeComments} from "./comments";

export function getNestedUntilClose(data: string, index: number, nestedArray: ICssObject[], commentsArray: ICommentPosition[]) {
	let nextOpen: number = data.indexOf('{', index + 1);
	let nextClose: number = data.indexOf('}', index + 1);
	let lastColon: number = 0; // Last semicolon before selector start
	let lastOpen: number = 0; // Last opening bracket before selector start
	let lastClose: number = 0; // Last closing bracket before selector start
	let selector: string = '';
	let selectorStart: number = 0; // Start index of nested selector
	let cssObject: ICssObject; // Object to push into array
	let currentCode: string = ''; // Code up to current point in analyzed CSS
	let commentLineStart: number = 0; // Position of last line comment start
	let commentBlockStart: number = 0; // Position of last block comment start
	let commentStart: number = 0; // Position of last comment start

	// Keep looking if bracket is in array
	while (checkRanges(nextClose, commentsArray)) {
		nextClose = data.indexOf('}', nextClose + 1);
	}

	// Loop through nested items
	while (nextOpen > -1 && nextOpen < nextClose) {

		// If bracket is inside a comment, move onto next item
		if (checkRanges(nextOpen, commentsArray)) {
			nextOpen = data.indexOf('{', nextOpen + 1);
			continue;
		}

		// If bracket is preceded by a hash symbol,
		// move onto next item
		// It is probably a sass function variable e.g. .block--#{$i}
		if (data.charAt(nextOpen - 1) == '#') {

			// Push empty object to skip on opposite closing bracket
			nestedArray.push({});

			// Skip to next opening bracket
			nextOpen = data.indexOf('{', nextOpen + 1);
			continue;
		}

		// Get last semicolon or open bracket before current open bracket
		// Check for opening bracket in case parent is empty
		// Must be assigned AFTER selector but BEFORE cssObject
		currentCode = data.substring(0, nextOpen);
		lastColon = currentCode.lastIndexOf(';');
		lastOpen = currentCode.lastIndexOf('{');
		lastClose = currentCode.lastIndexOf('}');
		selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;

		// Use previous close if close is inside a bracket
		while (checkRanges(selectorStart, commentsArray)) {
			commentBlockStart = currentCode.lastIndexOf('/*');
			commentLineStart = currentCode.lastIndexOf('//');
			commentStart = Math.max(commentBlockStart, commentLineStart);
			currentCode = data.substring(0, commentStart);
			lastColon = currentCode.lastIndexOf(';');
			lastOpen = currentCode.lastIndexOf('{');
			lastClose = currentCode.lastIndexOf('}');
			selectorStart = Math.max(lastColon, lastOpen, lastClose) + 1;
		}

		// Get selector
		selector = data.substring(selectorStart, nextOpen);

		// Remove /* */ comments
		selector = removeComments(selector);

		// Remove double-slash comments
		selector = removeComments(selector, '//', '\n');

		// Remove file imports
		selector = removeComments(selector, '@import', ';');

		// Remove SASS variable declarations
		selector = removeComments(selector, '$', ';');

		// Remove line breaks
		selector = selector.replace(/(\r\n|\n|\r)/gm, " ").trim();

		// Concatenate spaces
		selector = selector.replace(/\s\s+/g, ' ');

		cssObject = {
			selector: selector,
			start: nextOpen,
		};
		nestedArray.push(cssObject);

		nextOpen = data.indexOf('{', nextOpen + 1);
	}
	return nestedArray;
} // End get nested until close
