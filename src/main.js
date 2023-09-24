import * as core from '@actions/core'
import {readFile, writeFile} from 'fs-extra';
import {Client} from 'codemaker-sdk';
import {commitAndPushSingleFile, getReviewComments} from './utils/githubUtils';
import {langFromFileExtension} from './utils/languageUtils';
import {createProcessRequest, processTask} from './utils/codemakerUtils';
import {lineNumber, orderComments} from "./utils/commentUtils";

export const runAction = async () => {
    // git action inputs
    const accessToken = core.getInput("access-token");
    const apiKey = core.getInput("api-key");

    const owner = core.getInput("owner");
    const repository = core.getInput("repository");
    const branch = core.getInput("branch");

    const pullRequestNumber = core.getInput("pull-request-number");
    const reviewId = core.getInput("review-id");

    console.log(`Processing code review ${reviewId} on pull request ${pullRequestNumber}.`);

    const comments = await getReviewComments(accessToken, owner, repository, pullRequestNumber, reviewId);
    orderComments(comments);

    const client = new Client(() => apiKey);

    const modified = new Set();
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const path = comment.path;
        const line = lineNumber(comment);
        const language = langFromFileExtension(path);
        console.log(`Running code generation for file ${path}. Language detected: ${language}. Line number: ${line}. Prompt: ${comment.body}`);

        const source = await readFile(path, 'utf8');
        const request = createProcessRequest(language, source, line, comment.body);
        const generatedSource = await processTask(client, request);

        console.log("Write generated code back to file");
        await writeFile(path, generatedSource);

        modified.add(path);
    }

    console.log("Commit and push");
    const paths = [...modified]
    await commitAndPushSingleFile(accessToken, owner, repository, branch, paths, "Updated PR base on comments");
}
