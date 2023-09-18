# codemaker-pull-request-action

This action can used to integrate CodeMaker to pull requests. With a workflow triggered by pull request comments, this action will update the code based on the comment.

## How to use

[Full example here](https://github.com/codemakerai/codemaker-pull-request-action-example).

Requirements: give workflow write access to your repo.

Under repo Settings -> Actions -> General -> Workflow permissions, make sure "Read and write permissions" is selected.

```
name: Auto update PR based on comment

on:
  pull_request_review_comment:
    types: [created]

env:
  HEAD_BRANDH: ${{ github.event.pull_request.head.ref }}
  COMMENT_FILE_PATH: ${{ github.event.comment.path }}
  COMMENT_BODY: ${{ github.event.comment.body }}
  COMMENT_LINE: ${{ github.event.comment.line }}
  COMMENT_START_LINE: ${{ github.event.comment.start_line }}

jobs:
  update_pr_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          ref: ${{ env.HEAD_BRANDH }}
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
          branch: ${{ env.HEAD_BRANDH}}
```