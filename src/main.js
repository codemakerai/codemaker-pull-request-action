import * as core from '@actions/core'
import * as github from '@actions/github'
import {readFile, writeFile} from 'fs-extra';
import {Client} from 'codemaker-sdk';
import {commitAndPushSingleFile, getReviewComments} from './utils/githubUtils';
import {isFileSupported, langFromFileExtension} from './utils/languageUtils';
import {createProcessRequest, processTask} from './utils/codemakerUtils';
import {lineNumber, orderComments} from "./utils/commentUtils";

export const runAction = async () => {
    // git action inputs
    const accessToken = core.getInput("access-token");
    const apiKey = core.getInput("api-key");

    const owner = github.context.payload.repository.owner.login;
    const repository = github.context.payload.repository.name;
    const branch = github.context.payload.pull_request["head"]["ref"];

    const pullRequestNumber = github.context.payload.pull_request.number;
    const reviewId = github.context.payload["review"]["id"];
    const authorLogin = github.context.payload["review"]["user"]["login"];

    console.log(`Processing code review ${reviewId} on pull request ${pullRequestNumber}.`);

    const comments = await getReviewComments(accessToken, owner, repository, pullRequestNumber, reviewId);
    orderComments(comments);

    const client = new Client(() => apiKey);

    const modified = new Set();
    for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        const path = comment.path;
        if (!isFileSupported(path)) {
            console.log(`Skipping unsupported file ${path}`);
            continue;
        }

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
    await commitAndPushSingleFile(accessToken, owner, repository, branch, paths, `Updated PR base on comments from code review by ${authorLogin}`);
}
