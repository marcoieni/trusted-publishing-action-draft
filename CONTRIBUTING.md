# Contributing

## Format and lint

We use [Biome](https://biomejs.dev/) for formatting and linting.

To format and fix lints, run:

```bash
npx @biomejs/biome check --write
```

## Packaging

To avoid committing the `node_modules` directory, we use `npm run package` to compile the action
into a single file.

This approach is inspired by the [javascript-action](https://github.com/actions/javascript-action)
repository.

## Crates.io docs

To check the Crates.io OpenAPI documentation,
copy paste `https://crates.io/api/openapi.json`
in the [swagger](https://petstore.swagger.io/) bar at the top of the page.

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

The code is simple enough that we can avoid the complexity of TypeScript.
