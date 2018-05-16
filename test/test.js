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
  return new Promise((resolve, reject) => {
    let hash = crypto.createHash('md5');
    let stream = fs.createReadStream(path);
    stream.on('error', err => reject(err));
    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}


function runCommandAndTestFile(command,testFile,compareFile,done) {
  checksumFile(compareFile).then(hash_expected => {

    exec(command, function callback(error, stdout, stderr){
      checksumFile(testFile).then(hash_test => {
        if (hash_expected == hash_test) {
          done();
        } else {
          done('Files do not match.');
        }
      }).catch(err => {
        // throw new Error(err)
        done(err);
      });

    });

  }).catch(err => {
    // throw new Error(err)
    done(err);
  });

}

// Test single file replace
describe('Auto Comment Bracket', function() {
  describe('Test single file replace', function() {
    it('should return file with applied comments', function (done) {
      let testFile    = './test/single_file/file_test.scss';
      let compareFile = './test/single_file/file_has_comments.scss';
      let command     = 'auto-comment-bracket '+ testFile;
      runCommandAndTestFile(command,testFile,compareFile,done);
    });
  });
});






// test single file replace undo

// Test single file new output

// test single file new output undo





// Test directory loop replace

// test directory loop replace undo

// Test directory loop new output

// test directory loop new output undo
