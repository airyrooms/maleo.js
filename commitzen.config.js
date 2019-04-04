/*
  Custom commitzen config that suits our need but still follows conventional commits
  more: https://www.conventionalcommits.org/en

  Specification
  The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in RFC 2119.

  1.  Commits MUST be prefixed with a type, which consists of a noun, feat, fix, etc., followed by a colon and a space.
  2.  The type feat MUST be used when a commit adds a new feature to your application or library.
  3.  The type fix MUST be used when a commit represents a bug fix for your application.
  4.  An optional scope MAY be provided after a type. A scope is a phrase describing a section of the codebase enclosed in parenthesis, e.g., fix(parser):
  5.  A description MUST immediately follow the type/scope prefix. The description is a short description of the code changes, e.g., fix: array parsing issue when multiple spaces were contained in string.
  6.  A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes. The body MUST begin one blank line after the description.
  7.  A footer MAY be provided one blank line after the body. The footer SHOULD contain additional issue references about the code changes (such as the issues it fixes, e.g.,Fixes #13).
  8.  Breaking changes MUST be indicated at the very beginning of the footer or body section of a commit. A breaking change MUST consist of the uppercase text BREAKING CHANGE, followed by a colon and a space.
  9.  A description MUST be provided after the BREAKING CHANGE:, describing what has changed about the API, e.g., BREAKING CHANGE: environment variables now take precedence over config files.
  10. The footer MUST only contain BREAKING CHANGE, external links, issue references, and other meta-information.
  11. Types other than feat and fix MAY be used in your commit messages.
*/

module.exports = {
  types: [
    {
      value: 'feat',
      name: 'feat:      A new feature',
    },
    {
      value: 'fix',
      name: 'fix:       A bug fix',
    },
    {
      value: 'imp',
      name: 'imp:       An improvement changes',
    },
    {
      value: 'docs',
      name: 'docs:      Documentation only changes, including new or updates of examples',
    },
    {
      value: 'style',
      name: `style:     Changes that do not affect the meaning of the code 
             (white-space, formatting, missing semi-colons, etc)`,
    },
    {
      value: 'refactor',
      name: 'refactor:  A code change that neither fixes a bug nor adds a feature',
    },
    {
      value: 'perf',
      name: 'perf:      A code change that improves performance',
    },
    {
      value: 'test',
      name: 'test:      Adding or updating missing tests',
    },
    {
      value: 'chore',
      name: `chore:     Changes to the build process or auxiliary tools and libraries 
             such as documentation generation, ci related, lerna`,
    },
    {
      value: 'revert',
      name: 'revert:    Revert to a commit',
    },
  ],

  scopes: [
    { name: 'maleo-project' },
    { name: 'maleo-core/build' },
    { name: 'maleo-core/server' },
    { name: 'maleo-core/client' },
    { name: 'maleo-core/test' },
  ],

  // it needs to match the value for field type. Eg.: 'fix'
  scopeOverrides: {
    docs: [
      { name: 'examples - [skip ci]' },
      { name: 'readme - [skip ci]' },
      { name: 'contributing - [skip ci]' },
    ],
    chore: [
      { name: 'ci - [skip ci]' },
      { name: 'lerna - [skip ci]' },
      { name: 'dev-tools - [skip ci]' },
    ],
  },

  allowTicketNumber: false,
  isTicketNumberRequired: false,
  // ticketNumberPrefix: '[skip ci] skip: %s |',
  // ticketNumberRegExp: 'yes',

  // override the messages, defaults are as follows
  messages: {
    type: "Select the type of change that you're committing:",
    scope: '\nWhat is/are the SCOPE of this change (e.g. component or file name)? (optional):',
    // used if allowCustomScopes is true
    customScope: 'Denote the SCOPE of this change:\n',
    // ticketNumber: 'Skip CI build for docs, examples, chore (yes | press enter to skip):\n',
    subject:
      'Write a SHORT (100 characters), IMPERATIVE tense description of the change (optional, press enter to skip):\n',
    body:
      'Provide a LONGER description of the change. Use "|" to break new line (optional, press enter to skip):\n',
    breaking: 'Are there any BREAKING CHANGES? (optional, press enter to skip):\n',
    footer:
      'Does this change affect any open ISSUES (e.g. "fix #123", "re #123")? (optional, press enter to skip):\n',
    confirmCommit: 'Are you sure you want to proceed with the commit above?',
  },

  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  // skip any questions you want
  // skipQuestions: ['body', 'footer', 'breaking'],

  // limit subject length
  subjectLimit: 100,
};
