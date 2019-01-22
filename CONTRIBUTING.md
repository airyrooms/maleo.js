# Contributing Guidelines

Hello 👋!

Maleo.JS is an un-opinionated framework to enable Universal Rendering in JavaScript using React with no hassle.

We are here to solve the time consuming setups Universal Rendering Required.

Feel free to contribute to this project. We are grateful for your contributions and we are excited to welcome you abroad!

Happy contributing 🎉!

### Setting Up Maleo.JS in Local Environment

**Clone Repo to Local Machine**

[Fork](https://help.github.com/articles/fork-a-repo/) this repository to your GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local machine from forked repo.

```bash
$ git clone https://github.com/<username>/maleo.js.git
$ cd maleo.js
```

Add Maleo.JS repo as upstream to keep your fork up to date

```bash
$ git remote add upstream https://github.com/airyrooms/maleo.js
```

Make sure you are currently on branch `canary`, if not you can run this command
```bash
$ git checkout canary
$ git pull upstream canary # sync with Maleo.JS repo
```

**Setup**

Make sure you are using the same or higher version of [Node.js](https://nodejs.org/en/) from `.nvmrc` file. (more info about [nvm](https://github.com/creationix/nvm))

We are using [Yarn](https://yarnpkg.com/en/) as package manager

Install yarn as global dependency
```bash
$ npm install --global yarn
```
Should the install fails, use `sudo`

And then, install all the dependencies required by Maleo.JS

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

For example if you want to contribute to fix bug in Maleo.JS you need to create new branch with `fix/` as the prefix.

For example:
```bash
$ git checkout -b fix/webpack-bug
```

---

**Development**

You are now ready to contribute to Maleo.JS. Yaay 🤓!

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

Your code are now available in your repository, but it's time to make a [Pull Request](https://help.github.com/articles/about-pull-requests/) to Maleo.JS

## FAQ
<details>
  <summary>How to test Maleo.JS on local development machine in the <code>example</code> directory?</summary>
  Maleo.js is utilizing <a href="https://github.com/lerna/lerna">Lerna</a> and <a href="https://yarnpkg.com/lang/en/docs/workspaces/">Yarn Workspace</a> to manage the mono repo structure.
  So you can use the Maleo.JS inside <code>package</code> folder or <code>example</code> folder. Because Yarn Workspace and Lerna has hoisted all the dependencies into root directory. Therefore every app inside <code>example</code> able to add symlinked Maleo.JS as dependency.
</details>

<br/>

<details>
  <summary>How to test Maleo.JS on your own app during development?</summary>
  You can run this command inside <code>packages/Maleo.js</code> directory
  <pre>
  $ yarn link # if you are using yarn on your app
  $ npm link # if you are using npm on your app</pre>
  And then go to your app directory and add <code>@airy/maleo.js</code> to your own app's <code>package.json</code> and run this command:
  <pre>$ yarn link @airy/maleo.js</pre>
  And you are good to go! Maleo.JS are now living in your <code>node_modules</code> directory as a symlinked module
  
  more: 
    <ul>
      <li><a href="https://yarnpkg.com/lang/en/docs/cli/link/">Yarn Link</a></li>
      <li><a href="https://docs.npmjs.com/cli/link.html">NPM Link</a></li>
    </ul>
</details>