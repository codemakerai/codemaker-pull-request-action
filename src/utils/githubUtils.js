/**
 * Helper functions to programmatically commit and push
 */
import * as github from '@actions/github';
import {readFile} from 'fs-extra';

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
export const commitAndPushSingleFile = async (accessToken, owner, repository, branch, paths, message) => {
    const octokit = github.getOctokit(accessToken);
    // get current head commit
    const currentCommit = await getCurrentCommit(octokit, owner, repository, branch);

    // create new blob -> create new tree -> create new commit
    const blobs = [];
    for (let i = 0; i < paths.length; i++) {
        const {data: blob} = await createBlob(octokit, owner, repository, paths[i]);
        blobs.push({
            path: paths[i],
            sha: blob.sha
        })
    }
    const {data: treeData} = await createTree(octokit, owner, repository, blobs, currentCommit.treeSha);
    const {data: commitData} = await createCommit(octokit, owner, repository, message, treeData.sha, currentCommit.commitSha);

    // git push
    await octokit.rest.git.updateRef({
        owner,
        repo: repository,
        ref: `heads/${branch}`,
        sha: commitData.sha
    });
}

async function getCurrentCommit(octokit, owner, repository, branch) {
    const {data: refData} = await octokit.rest.git.getRef({
        owner,
        repo: repository,
        ref: `heads/${branch}`,
    });
    const commitSha = refData.object.sha;
    const {data: commitData} = await octokit.rest.git.getCommit({
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

async function createTree(octokit, owner, repository, blobs, parentTreeSha) {
    const tree = blobs.map(blob => ({
            path: blob.path,
            sha: blob.sha,
            mode: '100644',
            type: 'blob',
        }
    ));
    console.log(tree);
    return await octokit.rest.git.createTree({
        owner,
        repo: repository,
        tree: tree,
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

export const getReviewComments = async (accessToken, owner, repository, pullNumber, reviewId) => {
    const octokit = github.getOctokit(accessToken);

    const {data: reviewComments} = await octokit.rest.pulls.listCommentsForReview({
        owner,
        repo: repository,
        pull_number: pullNumber,
        review_id: reviewId
    });

    const comments = [];
    for (let i = 0; i < reviewComments.length; i++) {
        const {data: comment} = await octokit.rest.pulls.getReviewComment({
            owner,
            repo: repository,
            comment_id: reviewComments[i].id
        });
        comments.push(comment);
    }
    return comments;
}
