# Welcome to Auto Comment Bracket

SASS is probably the best thing to happen to CSS in a long time. It finally allowed us to store variables and have limited programming ability with mixin functions. It's also very useful for giving your styling code structure with its nested hierarchy. One common problem with large SASS files is that with a hierarchy multiple levels deep, it becomes difficult to tell which selector each bracket is actually closing.

Auto Comment Bracket is a tool to mark closing brackets in your CSS and SASS files.

## Before

```sass
.level-1-2 {
  .level-2-1 {
    margin:250px;
    .level-3-1 {
		padding:10px;
    }
    .level-3-2 {
		font-weight:700;
    }
    .level-3-3 {
		position:relative;
    }
  }
  .level-2-3 {
	background:blue;
  }
  .level-2-2 {
	color:green;
    .level-3-1 {
      font-size:14px;
    }
    .level-3-2 {
      font-style:italic;
      .level-4-1 {
        color:#333;
      }
    }
    .level-3-3 {
      margin:42px;
    }
  }
}
```

## After

```sass
.level-1-2 {
  .level-2-1 {
    margin:250px;
    .level-3-1 {
		padding:10px;
    } /* ACB: // .level-3-1 */
    .level-3-2 {
		font-weight:700;
    } /* ACB: // .level-3-2 */
    .level-3-3 {
		position:relative;
    } /* ACB: // .level-3-3 */
  } /* ACB: // .level-2-1 */
  .level-2-3 {
	background:blue;
  } /* ACB: // .level-2-3 */
  .level-2-2 {
	color:green;
    .level-3-1 {
      font-size:14px;
    } /* ACB: // .level-3-1 */
    .level-3-2 {
      font-style:italic;
      .level-4-1 {
        color:#333;
      } /* ACB: // .level-4-1 */
    } /* ACB: // .level-3-2 */
    .level-3-3 {
      margin:42px;
    } /* ACB: // .level-3-3 */
  } /* ACB: // .level-2-2 */
} /* ACB: // .level-1-2 */
```

## Installation

`npm install -g auto-comment-bracket`

## Usage

You are able to specify an output file to write the compiled CSS to. If you do not specify an output file, it will overwrite your input file.

`auto-comment-bracket input.scss -o output.scss`

### Undo

You can easily revert the CSS back to the original file by passing `-u` or `--undo`.

`auto-comment-bracket input.scss -u -o output.scss`

## Directory

It can also loop through and process files in a directory or subdirectories. It will only run on files with a .css and .scss extension. You can use `-d` or `--directory` to tell it to loop. The input and output options should be the directory file path.

Optionally, you can include `-r` or `--recursive` to go through subdirectories as well. It will attempt to preserve the folder structure if you specify an output folder.

`auto-comment-bracket ./src/ -d -r -o ./dest/`
