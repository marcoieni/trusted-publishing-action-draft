# Contributing

## FAQ

### Why javascript?

There are 3 types of GitHub Actions:

1. Docker Actions: They are slower than the others because they need to pull a Docker image.
2. Composite Actions: They don't support [runs.post] to clean up the job after the action has run.
   We need this to revoke the token after the job is done.
3. JavaScript Actions:
   - They are faster than Docker Actions because they don't require pulling a Docker image.
   - They support [runs.post] to clean up the job after the action has run.
   - GitHub provides the `@actions/core` library to easily set outputs and handle errors.

So we opted for a JavaScript Action.

[runs.post]: https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions#runspost

### Why not typescript?

The code is simple enough that we can avoid the complexity of compiling TypeScript to JavaScript.
