#!/usr/bin/env node
const { GitType, CircleCI } = require("circleci-api");
const YAML = require("YAML");

const { execFile } = require("child_process");
const fs = require("fs");
const util = require("util");
const readFileAsync = util.promisify(fs.readFile);

// We lazily rely on the circleci CLI's token storage.
const readToken = async () => {
  const text = await readFileAsync(`${process.env.HOME}/.circleci/cli.yml`, {
    encoding: "utf-8"
  });
  config = YAML.parse(text);
  const token = config.token;
  if (!token) {
    throw new Error(
      "No API key configured. Install https://github.com/CircleCI-Public/circleci-cli and run `circleci setup`."
    );
  }
  return token;
};

const execFileAsync = async (file, args) => {
  return new Promise((resolve, reject) => {
    execFile(file, args, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const parseGitUrl = url => {
  // We could teach this about other providers and https variants.
  const match = /^git@github.com:(.+)\/(.+).git$/.exec(url);
  if (!match) {
    throw new Error(`Unsupported Git remote URL ${url}`);
  }
  return {
    type: GitType.GITHUB,
    owner: match[1],
    repo: match[2]
  };
};

const openUrl = async url => {
  if (!url.startsWith("https://")) {
    throw new Error(`Ignoring unexpected URL format: ${url}`);
  }
  await execFileAsync("open", [url]);
};

const main = async () => {
  const token = await readToken();
  const gitOriginUrl = (await execFileAsync("git", ["remote", "get-url", "origin"])).trim();
  const branch = (await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"])).trim();
  const vcs = parseGitUrl(gitOriginUrl);
  const options = {
    token,
    vcs,
    options: {
      branch,
    }
  }
  const circleci = new CircleCI(options);
  const recentBuilds = await circleci.recentBuilds({limit: 1});
  if (recentBuilds.length === 0) {
    throw new Error("No builds for this branch.");
  }
  await openUrl(recentBuilds[0].build_url);
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e.message ? e.message : e);
    process.exit(2);
  }
})();
