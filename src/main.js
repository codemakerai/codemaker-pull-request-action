const core = require('@actions/core');
import { readFile, writeFile } from 'fs-extra';
import { Client } from 'codemaker-sdk';
import { commitAndPushSingleFile } from './utils/githubUtils';
import { isEmptyString, stringifyObject, stringifyObjectAndReplaceValues } from './utils/commonUtils';
import { langFromFileExtension } from './utils/languageUtils';
import { createProcessRequest, processTask } from'./utils/codemakerUtils';

export const runAction = async () => {
    // git action inputs
    const accessToken = core.getInput("access-token");
    const apiKey = core.getInput("api-key");
    const commentFilePath = core.getInput("comment-file-path");
    const commentBody = core.getInput("comment-body");
    const commentLine = core.getInput("comment-line");
    const commentStartLine = core.getInput("comment-start-line");
    const owner = core.getInput("owner");
    const repository = core.getInput("repository");
    const branch = core.getInput("branch");

    // hardcode
    // TODO: allow users to set these values?
    const pollingIntervalMilliseconds = 100;
    const timeoutMilliseconds = 10 * 60 * 1000;

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
    const client = new Client(() => apiKey);
    const language = langFromFileExtension(commentFilePath);
    console.log(`Running code generation for file ${commentFilePath}. Language detected: ${language}. Line number: ${lineNumber}. Prompt: ${commentBody}`);

    console.log("Read original source code");
    const source = await readFile(commentFilePath, 'utf8');

    const request = createProcessRequest(language, source, lineNumber, commentBody);
    
    console.log(`Run generation. request: ${stringifyObjectAndReplaceValues(request,new Map([
        ["source", "NOT_PRINTING_FULL_SOURCE_CODE"]
    ]))}`);
    const generatedSource = await processTask(client, request, pollingIntervalMilliseconds, timeoutMilliseconds);

    console.log("Write generated code back to file");
    await writeFile(commentFilePath, generatedSource);

    console.log("Commit and push");
    await commitAndPushSingleFile(accessToken, owner, repository, branch, commentFilePath,
        "Updating PR according to comment: " + commentBody);
}
