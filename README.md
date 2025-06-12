# trusted-publishing-action-draft

Get a temporary access token that you can use to interact with crates.io.

Remember:
- You must have configured your crate
- You already published the first version of your crate (todo: is this only true now and will be fixed eventually?)

## Usage

```yaml
name: Publish Crate

on:
  tag:

jobs:
  publish:
    runs-on: ubuntu-latest

    # Required for OpenID Connect token retrieval
    permissions:
      id-token: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Authenticate with crates.io
      id: auth
      uses: rust-lang/crates-io-auth-action@v1

    - name: Publish to crates.io
      run: cargo publish
      env:
        CARGO_REGISTRY_TOKEN: ${{ steps.auth.outputs.token }}
```

## TODO

- [ ] automate tag update (e.g. v1 updates when v1.0.1 is released)
- [ ] add retry logic?
- [ ] write more docs or link to more docs
- [ ] add license
