import {ICommentPosition} from "../types";

function stringCut(oldString: string, startCut: number, endCut: number): string {
	return oldString.substring(0, startCut) + oldString.substring(endCut);
}

// Remove comments from string
export function removeComments(data: string, commentPrefix: string = "/*", commentSuffix: string = "*/"): string {
	const commentSuffixLength: number = commentSuffix.length;
	let commentStart: number = data.indexOf(commentPrefix, 0);
	let commentEnd: number = data.indexOf(commentSuffix, commentStart) + commentSuffixLength;

	// While comment start is found
	// And comment end is found
	// And comment end point is after start point
	while (commentStart > -1 && commentEnd > -1 && commentEnd > commentStart) {
		// Cut current comment
		data = stringCut(data, commentStart, commentEnd);

		// Get next comment start
		commentStart = data.indexOf(commentPrefix);
		commentEnd =
			data.indexOf(commentSuffix, commentStart) + commentSuffixLength;
	}
	return data;
}

export function removePreviousComments(data: string): string {
	// Remove credit at top
	data = removeComments(
		data,
		'/* ACB: // This file has been commented by Auto-Comment-Bracket',
		'\n'
	);

	// Remove ACB comments from previous executions
	data = removeComments(data, ' /* ACB: // ');

	// Remove ACB comments without a space in front
	data = removeComments(data, '/* ACB: // ');

	return data;
}

export function checkRanges(number: number, ranges: ICommentPosition[]): boolean {
	// Check if a number is between CSS object's start and end position
	let x: number;
	let test: boolean = false;
	for (x = 0; x < ranges.length; x++) {
		const start = ranges[x].start;
		const end = ranges[x].end;
		if (number > start && number < end) {
			// console.log('num in range '+number+' x '+x+ ' start '+ranges[x].start+ ' end '+ranges[x].end)
			test = true;
			break;
		}
	}
	return test;
}

// Recursive loop to get all comments in data
export function commentsArrayLoop(data: string, prefix: string, suffix: string, array: ICommentPosition[]): ICommentPosition[] {
	const suffixLength: number = suffix.length;
	let commentStart: number = data.indexOf(prefix);
	let commentEnd: number = -1;
	let obj: ICommentPosition;

	// Loop through block comments
	while (commentStart > -1) {
		// check if comment start is not inside an existing comment
		if (!checkRanges(commentStart, array)) {
			commentEnd = data.indexOf(suffix, commentStart) + suffixLength;

			obj = {
				start: commentStart,
				end: commentEnd,
			};
			array.push(obj);
		}
		// Get next comment start
		commentStart = data.indexOf(prefix, commentStart + 1);
	}

	return array;
}

export function commentsArray(data: string): ICommentPosition[] {
	let array: ICommentPosition[] = [];

	// Add a new line to data. If last line is a line comment, it won't find the "end" and won't be added to the comment array.
	data = data + '\n';

	// Loop through block comments
	array = commentsArrayLoop(data, '/*', '*/', array);

	// Loop through line comments
	array = commentsArrayLoop(data, '//', '\n', array);

	return array;
} // End comments array
