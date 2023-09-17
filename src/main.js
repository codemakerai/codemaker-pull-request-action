const core = require('@actions/core');
const { commitAndPushSingleFile } = require('./github');
const { isEmptyString } = require('./utils');

const accessToken = core.getInput("access-token");
const apiKey = core.getInput("api-key");
const commentFilePath = core.getInput("comment-file-path");
const commentBody = core.getInput("comment-body");
const commentLine = core.getInput("comment-line");
const commentStartLine = core.getInput("comment-start-line");
const owner = core.getInput("owner");
const repository = core.getInput("repository");
const branch = core.getInput("branch");

// determine the comment line number
var lineNumber;
if (isEmptyString(commentStartLine) || commentStartLine === "-1") {
    console.log("Processing a single-line comment.");
    lineNumber =  commentLine;
} else {
    console.log("Processing a multi-line comment.");
    lineNumber = commentStartLine;
}

// run CodeMaker generation
// TODO

// commit and push
commitAndPushSingleFile(accessToken, owner, repository, branch, commentFilePath,
    "Updating PR according to comment: " + commentBody);
