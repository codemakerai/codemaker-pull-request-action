/**
 * Helper functions to programatically commit and push
 */
const github = require('@actions/github');
import { readFile } from 'fs-extra';

/**
 * Commit and push to git repository. Currently only support commit one single file.
 * 
 * @param {*} accessToken  Github access token.
 * @param {*} owner        The repository owner (user/organization name).
 * @param {*} repository   The repository name.
 * @param {*} branch       The branch name to push to.
 * @param {*} path         The path of the file to commit and push.
 * @param {*} message      The commit message.
 */
export const commitAndPushSingleFile = async (accessToken, owner, repository, branch, path, message) => {
    const octokit = github.getOctokit(accessToken);
    // get current head commit
    const currentCommit = await getCurrentCommit(octokit, owner, repository, branch);

    // create new blob -> create new tree -> create new commit
    const { data: blobData } = await createBlob(octokit, owner, repository, path);
    const { data: treeData } = await createTree(octokit, owner, repository, blobData.sha, path, currentCommit.treeSha);
    const { data: commitData } = await createCommit(octokit, owner, repository, message, treeData.sha, currentCommit.commitSha);

    // git push
    await octokit.rest.git.updateRef({
        owner,
        repo: repository,
        ref: `heads/${branch}`,
        sha: commitData.sha
    });
}

async function getCurrentCommit(octokit, owner, repository, branch) {
    const { data: refData } = await octokit.rest.git.getRef({
        owner,
        repo: repository,
        ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;
    const {data: commitData } = await octokit.rest.git.getCommit({
        owner,
        repo: repository,
        commit_sha: commitSha,
    });
    return {
        commitSha,
        treeSha: commitData.tree.sha,
    }
}

async function createBlob(octokit, owner, repository, path) {
    const content = await readFile(path, 'utf8');
    return await octokit.rest.git.createBlob({
        owner,
        repo: repository,
        content: content,
        encoding: 'utf-8'
    });
}

async function createTree(octokit, owner, repository, blobSha, path, parentTreeSha) {
    return await octokit.rest.git.createTree({
        owner,
        repo: repository,
        tree: [{
            path,
            mode: `100644`,
            type: `blob`,
            sha: blobSha
        }],
        base_tree: parentTreeSha
    });
}

async function createCommit(octokit, owner, repository, message, treeSha, parentCommitSha) {
    return await octokit.rest.git.createCommit({
        owner,
        repo: repository,
        message,
        tree: treeSha,
        parents: [parentCommitSha]
    });
}
