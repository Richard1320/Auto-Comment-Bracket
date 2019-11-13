import fs from "fs";
import {exec} from "child_process";
import * as assert from "assert";
import crypto from "crypto";

function checksumFile(path: string): Promise<string> {
	return new Promise<string>(function (resolve, reject) {
		const shasum = crypto.createHash('sha1');
		const stream = fs.createReadStream(path);
		stream.on('error', err => reject(err));
		stream.on('data', chunk => shasum.update(chunk));
		stream.on('end', () => {
			resolve(shasum.digest('hex'));
		});
	});
}


function runCommandAndtestPath(done: any, command: string, testPath: string, compareFile: string, outputFile?: string) {
	if (!outputFile) {
		outputFile = testPath;
	}
	const promiseCompare = checksumFile(compareFile);
	const promiseTest = new Promise((resolve, reject) => {
		exec(command, () => {
			checksumFile(outputFile as string).then(hash_test => {
				resolve(hash_test);
			}).catch(err => {
				reject(err);
			});
		});
	});


	Promise.all([promiseTest, promiseCompare]).then((values) => {
		// console.log("hash values", values);
		assert.equal(values[0], values[1]);
		done();
	});

}

describe('Auto Comment Bracket', () => {
	describe('Test single file', () => {
		// Test single file replace
		it('should return overwritten file with applied comments', (done) => {
			const testPath = './test/single_file/file_test.scss';
			const outputFile = './test/single_file/file_test.scss';
			const compareFile = './test/single_file/file_has_comments.scss';
			const command = 'node ./dist/index.js ' + testPath;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test single file replace undo
		it('should return overwritten file back to its original state', (done) => {
			const testPath = './test/single_file/file_test.scss';
			const outputFile = './test/single_file/file_test.scss';
			const compareFile = './test/single_file/file_no_comments.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -u';
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// Test single file new output
		it('should return a new file with applied comments', (done) => {
			const testPath = './test/single_file/file_test.scss';
			const outputFile = './test/single_file/file_output.scss';
			const compareFile = './test/single_file/file_has_comments.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -o ' + outputFile;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test single file new output undo
		it('should return a new file back to its original state', (done) => {
			const testPath = './test/single_file/file_test.scss';
			const outputFile = './test/single_file/file_output.scss';
			const compareFile = './test/single_file/file_no_comments.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -u -o ' + outputFile;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});
	}); // End file test


	describe('Test directory loop', () => {
		// Test directory loop replace
		it('should return overwritten file with applied comments', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/src/_print.scss';
			const compareFile = './test/directory_loop/has_comments/_print.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d';
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test directory loop replace undo
		it('should return overwritten file back to its original state', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/src/_print.scss';
			const compareFile = './test/directory_loop/no_comments/_print.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -u';
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// Test directory loop new output
		it('should return a new file with applied comments', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/dist/_print.scss';
			const outputPath = './test/directory_loop/dist/';
			const compareFile = './test/directory_loop/has_comments/_print.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -o ' + outputPath;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test directory loop new output undo
		it('should return a new file back to its original state', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/dist/_print.scss';
			const outputPath = './test/directory_loop/dist/';
			const compareFile = './test/directory_loop/no_comments/_print.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -u -o ' + outputPath;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});
	});

	describe('Test recursive directory loop', () => {
		// Test directory loop replace
		it('should return overwritten file with applied comments', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/src/mixins/_buttons.scss';
			const compareFile = './test/directory_loop/has_comments/mixins/_buttons.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -r';
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test directory loop replace undo
		it('should return overwritten file back to its original state', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/src/mixins/_buttons.scss';
			const compareFile = './test/directory_loop/no_comments/mixins/_buttons.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -r -u';
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// Test directory loop new output
		it('should return a new file with applied comments', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/dist/mixins/_buttons.scss';
			const outputPath = './test/directory_loop/dist/';
			const compareFile = './test/directory_loop/has_comments/mixins/_buttons.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -r -o ' + outputPath;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});

		// test directory loop new output undo
		it('should return a new file back to its original state', (done) => {
			const testPath = './test/directory_loop/src/';
			const outputFile = './test/directory_loop/dist/mixins/_buttons.scss';
			const outputPath = './test/directory_loop/dist/';
			const compareFile = './test/directory_loop/no_comments/mixins/_buttons.scss';
			const command = 'node ./dist/index.js ' + testPath + ' -d -r -u -o ' + outputPath;
			runCommandAndtestPath(done, command, testPath, compareFile, outputFile);
		});
	});
});
