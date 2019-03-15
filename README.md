# CircleCI Opener

Node CLI that opens the CircleCI build web page from the command line.

Usage:

```bash
$ npm install -g @mthx/circleci-opener
$ cd my-git-repo
$ cio
```

or use `npx` (perhaps via a shell alias):

```bash
$ npx --package @mthx/circleci-opener cio
```

## Configuration

Requires a [CircleCI API token](https://circleci.com/account/api). This CLI
currently lifts the token from the
[`circleci`](https://github.com/CircleCI-Public/circleci-cli) CLI config file.

## Limitations

- Assumes GitHub SSH URLs (easy fix)
- Uses `open` to launch the browser so MacOS only (trivial fix for someone able to test)
