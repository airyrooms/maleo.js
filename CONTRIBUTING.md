# Contributing Guidelines

Hello 👋!

Maleo.js is an un-opinionated framework to enable Universal Rendering in JavaScript using React with no hassle.

We are here to solve the time consuming setups Universal Rendering Required.

Feel free to contribute to this project. We are grateful for your contributions and we are excited to welcome you abroad!

Happy contributing 🎉!

### Setting Up Maleo.js in Local Environment

**Clone Repo to Local Machine**

[Fork](https://help.github.com/articles/fork-a-repo/) this repository to your GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local machine from forked repo.

```bash
$ git clone https://github.com/<username>/maleo.js.git
$ cd maleo.js
```

Add Maleo.js repo as upstream to keep your fork up to date

```bash
$ git remote add upstream https://github.com/airyrooms/maleo.js
```

Make sure you are currently on branch `canary`, if not you can run this command
```bash
$ git checkout canary
$ git pull upstream canary # sync with Maleo.js repo
```

**Setup**

Make sure you are using the same or higher version of [Node.js](https://nodejs.org/en/) from `.nvmrc` file. (more info about [nvm](https://github.com/creationix/nvm))

We are using [Yarn](https://yarnpkg.com/en/) as package manager

Install yarn as global dependency
```bash
$ npm install --global yarn
```
Should the install fails, use `sudo`

And then, install all the dependencies required by Maleo.js

```bash
$ yarn
```

After the installation finished, run `fix:bin` command to fix binary symlink issue
```bash
$ yarn fix:bin
```

---

***Before making any changes, please check our [issues list](https://github.com/airyrooms/maleo.js/issues), for issues that you want to solve.***

Create a new branch based on what kind of contribution you are going to do.

Here is the draft:
<!-- Do not translate this table -->
<table>
    <tr>
        <td> Contributing Type </td>
        <td> Branch Prefix </td>
        <td> Description </td>
    </tr>
    <tr>
        <td> Fix </td>
        <td> fix/< name > </td>
        <td> Fixing current bug or issues </td>
    </tr>
    <tr>
        <td> Feature </td>
        <td> feature/< name > </td>
        <td> Adding new feature </td>
    </tr>
    <tr>
        <td> Optimization </td>
        <td> optimization/< name > </td>
        <td> Optimize current unoptimized code </td>
    </tr>
    <tr>
        <td> Documentation </td>
        <td> docs/< name > </td>
        <td> Add or edit documentation related file </td>
    </tr>
    <tr>
        <td> Translation </td>
        <td> translate/< name > </td>
        <td> Add or edit documentation's translation </td>
    </tr>
</table>

For example if you want to contribute to fix bug in Maleo.js you need to create new branch with `fix/` as the prefix.

For example:
```bash
$ git checkout -b fix/webpack-bug
```

---

**Development**

You are now ready to contribute to Maleo.js. Yaay 🤓!

To build the module you can run this command:
```bash
$ yarn build
```

During development we are more likely watch our code changes, therefore we use this command:
```bash
$ yarn watch
```

The command above watches for every changes from folder `/packages/plugins`  and `/packages/Maleo.js`

**Test**

For every new feature you are required to add unit test.

You can add the unit test on folder `test` with filename having `[feature-name].test.js` prefix.


Running test:
```bash
$ yarn test
```

**Commit and Push Changes**

Awesome 🎉! 

You have arrived at this stage, you are almost ready to make your changes available for other people.

After you have made changes and tested, please don't commit the changes using `$ git commit`, instead use this command:
```bash
$ yarn commit
```

The command above will display a wizard for you to fill, it uses our standard commit message. After you have finished filling the answers, we will run [linting](https://stackoverflow.com/questions/8503559/what-is-linting) and `prettify` process to your code and stage those changes to the commit to make sure your code have the same formatting as the other.

If you have passed all the process above you can now push your changes! 😙

```bash
$ git push
```

**Making Pull Request**

YEAH!! 🎉🎉 You are ready to make your changes available for other people

Your code are now available in your repository, but it's time to make a [Pull Request](https://help.github.com/articles/about-pull-requests/) to Maleo.js

## Publishing Stable Guide

---
**Publishing stable version is only reserved for repo admin: [@alvinkl](https://github.com/alvinkl), [@AndariasSilvanus](https://github.com/AndariasSilvanus). For more info please join our [discord channel](https://discord.gg/9eArCQn)**

---

Make a pull request from Canary to Master and review all the changes stated on the commit messages.
If everything looks OK you can now merge the PR using **Merge Create a Merge Commit** with Commit Message as such.
```
Ready to Publish Stable [skip ci]
```
This is required in order to make Master branch keep in sync with Canary branch, because Squash merging will make the history disappear and open up to other push force issue, Rebase also does the same, also we don't want [travis-ci](https://travis-ci.org/airyrooms/maleo.js) to run it's **Sync Master to Canary** Pipeline.

After done so checkout to the master branch by using this command
```bash
$ git fetch upstream master:master
$ git checkout master
$ git log #to check if the log the same with remote's
```

Now in order to publish the stable version, start by running this command
```bash
$ yarn publish:version-stable
```
The command above runs [lerna version](https://github.com/lerna/lerna/tree/master/commands/version) to let lerna show the package that need to bump it's version for the changes it has.

---
***Please review first the [semantic versioning](https://semver.org/), as this will affect all the user that is using this framework***

---

After everything looks good, you should see lerna doing it's magic bumping the version and make changes on the respective package's `package.json`, do the commit, and do the tagging. 

---
**DO WITH PRECAUTIONS**

If you happen to find lerna error during tagging, you can delete the tag on **your remote**, [how to delete all git tags on your local and remote](https://gist.github.com/okunishinishi/9424779), do git reset of the commit to have the same latest commit with remote's master, then redo the publishing again.

---

After Lerna has done it's job, you should see a new commit with message `chore(release): publish stable ...` and also the new git tag with the new version such as `@airy/maleo@1.0.0`.

Then you can publish this changes to NPM by running this command
```bash
$ bash ./ci/publish-stable.sh
```

The command above will run 
- `yarn publish:prepublish` this command is to make sure packages are ready for publishing, usually runs package build specific for publishing.
- `yarn publish:stable` this command runs lerna publish and publish it to NPM, this command will add git head revision to the bottom of respective package's `package.json`

Now you need to add all the git head revision changes to the latest commit by running this command
```bash
$ git add .
$ git commit --amend --no-edit
```

After doing all of the above, now you are good to push all this changes to upstream remote by running
```bash
$ git push upstream master
```

---
**NOTICE**

By pushing those changes to the remote master branch, it will trigger [travis-ci](https://travis-ci.org/airyrooms/maleo.js) pipeline to sync the `master` branch with `canary` branch.
During this process, the pipeline will also publish a new canary version for it and during this process you **must not** merge any PR to make sure the `canary.0` version is clean.

---

## FAQ
<details>
  <summary>How to test Maleo.js on local development machine in the <code>example</code> directory?</summary>
  Maleo.js is utilizing <a href="https://github.com/lerna/lerna">Lerna</a> and <a href="https://yarnpkg.com/lang/en/docs/workspaces/">Yarn Workspace</a> to manage the mono repo structure.
  So you can use the Maleo.js inside <code>package</code> folder or <code>example</code> folder. Because Yarn Workspace and Lerna has hoisted all the dependencies into root directory. Therefore every app inside <code>example</code> able to add symlinked Maleo.js as dependency.
</details>

<br/>

<details>
  <summary>How to test Maleo.js on your own app during development?</summary>
  You can run this command inside <code>packages/Maleo.js</code> directory
  <pre>
  $ yarn link # if you are using yarn on your app
  $ npm link # if you are using npm on your app</pre>
  And then go to your app directory and add <code>@airy/maleo.js</code> to your own app's <code>package.json</code> and run this command:
  <pre>$ yarn link @airy/maleo.js</pre>
  And you are good to go! Maleo.js are now living in your <code>node_modules</code> directory as a symlinked module
  
  more: 
    <ul>
      <li><a href="https://yarnpkg.com/lang/en/docs/cli/link/">Yarn Link</a></li>
      <li><a href="https://docs.npmjs.com/cli/link.html">NPM Link</a></li>
    </ul>
</details>
