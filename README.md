# trusted-publishing-action-draft

Get a temporary access token that you can use to interact with crates.io.


## Usage

```yaml
name: Login to crates.io

on:
  # customize the event that triggers this action
  push:

# Required for OpenID Connect token retrieval
permissions:
  id-token: write

jobs:
    publish:
    runs-on: ubuntu-24.04
    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Retrieve crates.io token
      uses: rust-lang/trusted-publishing-action@v1.0.0
      id: get-token

    - name: Login to crates.io
      run: cargo login
      env:
        CARGO_REGISTRY_TOKEN: ${{ steps.get-token.outputs.token }}
```

## TODO

- [ ] automate tag update (e.g. v1 updates when v1.0.1 is released)
- [ ] add retry logic?
- [ ] write more docs or link to more docs
- [ ] add license
