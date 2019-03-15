# CircleCI Opener

Node CLI that opens the CircleCI build web page from the command line.

Usage:

```bash
$ npm install -g @mthx/circleci-open
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

