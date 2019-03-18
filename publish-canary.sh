echo "Publishing Canary"

# Travis olways runs on detached HEAD mode
# we need to get it attach first

# Set the user name and email to match the API token holder
# This will make sure the git commits will have the correct photo
# and the user gets the credit for a checkin
# git config --global user.email "foo@users.noreply.github.com"
# git config --global user.name "foo"
# git config --global push.default matching

# Get the credentials from a file
git config credential.helper "store --file=.git/credentials"

# This associates the API Key with the account
echo "https://${GH_TOKEN}:@github.com" > .git/credentials

# Make sure that the workspace is clean
# It could be "dirty" if
# 1. yarn.lock is not aligned with package.json
# 2. yarn install is run
git checkout -- .

# Echo the status to the log so that we can see it is OK
git status

local head_ref branch_ref
head_ref=$(git rev-parse HEAD)
if [[ $? -ne 0 || ! $head_ref ]]; then
    err "failed to get HEAD reference"
    return 1
fi
branch_ref=$(git rev-parse "$TRAVIS_BRANCH")
if [[ $? -ne 0 || ! $branch_ref ]]; then
    err "failed to get $TRAVIS_BRANCH reference"
    return 1
fi
if [[ $head_ref != $branch_ref ]]; then
    msg "HEAD ref ($head_ref) does not match $TRAVIS_BRANCH ref ($branch_ref)"
    msg "someone may have pushed new commits before this build cloned the repo"
    return 0
fi
if ! git checkout "$TRAVIS_BRANCH"; then
    err "failed to checkout $TRAVIS_BRANCH"
    return 1

# Publish Script
yarn publish:prepublish
yarn publish:version-canary
yarn publish:canary