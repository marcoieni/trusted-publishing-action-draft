# Contributing

## Local development

You can't run or test this action locally because it requires a GitHub environment to run.

### Packaging

The code of the action is in `src/`.
After you edit the code, run the following command to
compile the typescript code and its dependencies into a single typescript
file in the `dist/` directory:

```bash
npm run package
```

This approach is inspired by the [typescript-action](https://github.com/actions/typescript-action)
repository and it's used to avoid committing the `node_modules` directory to the repository.

### Format

We use [Prettier](https://prettier.io/) for formatting typescript, markdown, and YAML files.
To format all files, run:

```bash
npx prettier --write .
```

### Linting

We use [ESLint](https://eslint.org/) for formatting and linting typescript files.

To check for linting errors, run:

```bash
npx eslint
```

## Crates.io docs

To check the Crates.io OpenAPI documentation,
copy paste `https://crates.io/api/openapi.json`
in the [swagger](https://petstore.swagger.io/) bar at the top of the page.

## GitHub docs

Here are some useful links to the GitHub documentation:

- [Creating a javascript action](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-javascript-action)
- [OpenID Connect](https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect)

## FAQ

### Why typescript?

There are 3 types of GitHub Actions:

1. Docker Actions: They are slower than the others because they need to pull a Docker image.
2. Composite Actions: They don't support [runs.post] to clean up the job after the action has run.
   We need this to revoke the token after the job is done.
3. JavaScript Actions:
   - They are faster than Docker Actions because they don't require pulling a Docker image.
   - They support [runs.post] to clean up the job after the action has run.
   - GitHub provides the `@actions/core` library to easily set outputs and handle errors.

So we opted for a JavaScript Action.
We use TypeScript to have type safety.

[runs.post]: https://docs.github.com/en/actions/sharing-automations/creating-actions/metadata-syntax-for-github-actions#runspost
