#!/usr/bin/env node
const fetch = require("node-fetch");
const YAML = require("YAML");

const { exec } = require("child_process");
const querystring = require("querystring");
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

const createApiClient = ({ token }) => {
  return async (path, query) => {
    const url = `https://circleci.com/api/v1.1/${path}?${querystring.stringify({
      ...(query || {}),
      "circle-token": token
    })}`;
    const headers = { headers: "accept: application/json" };
    const result = await fetch(url, { headers });
    if (result.status !== 200) {
      throw new Error(
        `Unexpected CircleCI API response: ${result.status} ${
          result.statusText
        }`
      );
    }
    return result.json();
  };
};

const createCircleClient = apiClient => {
  return {
    recentBuilds: ({ username, project, branch }) => {
      const vcsType = "github";
      const path = `project/${vcsType}/${username}/${project}/tree/${encodeURIComponent(
        branch
      )}`;
      return apiClient(path, { limit: 1 });
    }
  };
};

const execAsync = (command, callback) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const parseGitUrl = url => {
  // We could teach it about other providers and https variants.
  const match = /^git@github.com:(.+)\/(.+).git$/.exec(url);
  if (!match) {
    throw new Error(`Unsupported Git remote URL ${url}`);
  }
  return {
    username: match[1],
    project: match[2]
  };
};

const main = async () => {
  const token = await readToken();
  const gitOriginUrl = (await execAsync("git remote get-url origin")).trim();
  const branch = (await execAsync("git rev-parse --abbrev-ref HEAD")).trim();
  const urlInfo = parseGitUrl(gitOriginUrl);
  const client = createCircleClient(createApiClient({ token }));
  const recentBuilds = await client.recentBuilds({
    ...urlInfo,
    branch
  });
  if (recentBuilds.length === 0) {
    throw new Error("No builds for this branch.");
  }
  const buildUrl = recentBuilds[0].build_url;
  if (!buildUrl.startsWith("https://")) {
    throw new Error(`Ignoring unexpected URL format: ${buildUrl}`);
  }
  await execAsync("open " + buildUrl);
};

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e.message ? e.message : e);
    process.exit(2);
  }
})();
