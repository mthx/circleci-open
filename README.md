# CircleCI Opener

Node CLI that opens the CircleCI build web page from the command line.

Usage:

```
$ npm install -g @mthx/circleci-open
$ cd my-git-repo
$ cio
```

## Configuration

Requires a [CircleCI API token](https://circleci.com/account/api). This CLI
currently lifts the token from the
[`circleci`](https://github.com/CircleCI-Public/circleci-cli) CLI config file.

