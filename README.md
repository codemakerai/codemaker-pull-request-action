# codemaker-pull-request-action

This action can be used to integrate CodeMaker AI to pull requests process. With a workflow triggered by pull request review, this action will update the code based on the specific comment.

## How to use

[Full example here](https://github.com/codemakerai/codemaker-pull-request-action-example).

### Requirements

Give workflow write access to your repo: Under repo Settings -> Actions -> General -> Workflow permissions, make sure "Read and write permissions" is selected.

## How to use

This GitHub action takes 2 (required) inputs:

* access-token: GitHub Personal Access Token (PAT).
* api-key: Your CodeMaker API Key. For security, please consider using [secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) to provide this value.

### Limitation

Due to the limitation of Github workflow, there is no good way to handle concurrent run. The comment line number is an import parameter for CodeMaker processor to perform generation. Since the line number is determined when ```pull_request_review_comment``` web hook event is triggerred, multiple concurrent workflow trigger will cause the line number to be outdated because some other runs may have already updated the file content.

Because of this limitation, it is important to post PR comment one by one, and do not post a new one until the workflow run triggerred by the previous one has completed.

We are currently working on a solution on this.  

```
name: Auto update PR based on comment

on:
  pull_request_review_comment:
    types: [created]

env:
  HEAD_BRANCH: ${{ github.event.pull_request.head.ref }}
  COMMENT_FILE_PATH: ${{ github.event.comment.path }}
  COMMENT_BODY: ${{ github.event.comment.body }}
  COMMENT_LINE: ${{ github.event.comment.line }}
  COMMENT_START_LINE: ${{ github.event.comment.start_line }}

concurrency:
  group: ${{ github.workflow }} - ${{ github.event.pull_request.head.ref }}

jobs:
  update_pr_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: ${{ env.HEAD_BRANCH }}
      - name: Code Review Action
        uses: codemakerai/codemaker-pull-request-action@v1.0.0
        with:
          access-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.CODEMAKER_API_KEY }}
          comment-file-path: ${{ env.COMMENT_FILE_PATH }}
          comment-body: ${{ env.COMMENT_BODY }}
          comment-line: ${{ env.COMMENT_LINE }}
          comment-start-line: ${{ env.COMMENT_START_LINE }}
          owner: YOUR_USER_OR_ORG_NAME
          repository: YOUR_REPO_NAME
          branch: ${{ env.HEAD_BRANCH}}
```

## License

MIT License