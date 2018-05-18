var assert = require('assert');
var fs = require('fs');
var exec = require('child_process').exec;
// describe('Array', function() {
//   describe('#indexOf()', function() {
//     it('should return -1 when the value is not present', function() {
//       assert.equal([1,2,3].indexOf(4), -1);
//     });
//   });
// });
let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
  return;
}



function checksumFile(path) {
  return new Promise(function(resolve, reject) {
    let hash = crypto.createHash('md5');
    let stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}


function runCommandAndtestPath(done,command,testPath,compareFile,outputFile) {

  if (!outputFile) {
    outputFile = testPath;
  }
  var promiseCompare = checksumFile(compareFile);
  var promiseTest    = new Promise(function(resolve, reject) {
    exec(command, function callback(error, stdout, stderr){
      checksumFile(outputFile).then(hash_test => {
        resolve(hash_test);
      }).catch(err => {
        reject(err);
      });
    });
  });


  Promise.all([promiseCompare, promiseTest]).then(function(values) {
    // console.log(values);
    if (values[0] == values[1]) {
      done();
    } else {
      done('Files do not match.');
    }
  });

}

describe('Auto Comment Bracket', function() {
  describe('Test single file', function() {
    // Test single file replace
    it('should return overwritten file with applied comments', function (done) {
      let testPath    = './test/single_file/file_test.scss';
      let outputFile  = './test/single_file/file_test.scss';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test single file replace undo
    it('should return overwritten file back to its original state', function (done) {
      let testPath    = './test/single_file/file_test.scss';
      let outputFile  = './test/single_file/file_test.scss';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -u';
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // Test single file new output
    it('should return a new file with applied comments', function (done) {
      let testPath    = './test/single_file/file_test.scss';
      let outputFile  = './test/single_file/file_output.scss';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -o '+ outputFile;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test single file new output undo
    it('should return a new file back to its original state', function (done) {
      let testPath    = './test/single_file/file_test.scss';
      let outputFile  = './test/single_file/file_output.scss';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -u -o '+ outputFile;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });
  }); // End file test



  describe('Test directory loop', function() {
    // Test directory loop replace
    it('should return overwritten file with applied comments', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/src/style.scss';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d';
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test directory loop replace undo
    it('should return overwritten file back to its original state', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/src/style.scss';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -u';
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // Test directory loop new output
    it('should return a new file with applied comments', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/dest/style.scss';
      let outputPath  = './test/directory_loop/dest/';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -o '+ outputPath;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test directory loop new output undo
    it('should return a new file back to its original state', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/dest/style.scss';
      let outputPath  = './test/directory_loop/dest/';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -u -o '+ outputPath;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });
  });

  describe('Test recursive directory loop', function() {
    // Test directory loop replace
    it('should return overwritten file with applied comments', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/src/folder/subdir2/subdir.scss';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -r';
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test directory loop replace undo
    it('should return overwritten file back to its original state', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/src/folder/subdir2/subdir.scss';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -r -u';
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // Test directory loop new output
    it('should return a new file with applied comments', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/dest/folder/subdir2/subdir.scss';
      let outputPath  = './test/directory_loop/dest/';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -r -o '+ outputPath;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });

    // test directory loop new output undo
    it('should return a new file back to its original state', function (done) {
      let testPath    = './test/directory_loop/src/';
      let outputFile  = './test/directory_loop/dest/folder/subdir2/subdir.scss';
      let outputPath  = './test/directory_loop/dest/';
      let compareFile = './test/single_file/file_no_comments.scss';
      let command     = 'auto-comment-bracket '+ testPath +' -d -r -u -o '+ outputPath;
      runCommandAndtestPath(done,command,testPath,compareFile,outputFile);
    });
  });
});
