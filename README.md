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

The best way of using this action is through either Pull Request code review, when multiple comments can be submitted at 
once or through single pull requests comment. Creating multiple single comments in quick succession will cause race 
condition as the comments will become out of sync with the code. Submitting multiple comments at once can be done in 
reliable way only through pull request code review.   

```
name: Auto update PR based on PR review

on:
  pull_request_review:
    types: [submitted]

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
        uses: codemakerai/codemaker-pull-request-action@v2.0.0
        with:
          access-token: ${{ secrets.GITHUB_TOKEN }}
          api-key: ${{ secrets.CODEMAKER_API_KEY }}
```

## License

MIT License
