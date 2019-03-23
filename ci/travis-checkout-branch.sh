# Travis olways runs on detached HEAD mode
# we need to get it attach first

# Set the user name and email to match the API token holder
# This will make sure the git commits will have the correct photo
# and the user gets the credit for a checkin
git config --global user.email "airyrooms-engineering@users.noreply.github.com"
git config --global user.name "airyrooms-engineering"
git config --global push.default matching

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

head_ref=$(git rev-parse HEAD)
if [[ $? -ne 0 || ! $head_ref ]]; then
    echo "failed to get HEAD reference"
    exit 1
fi
branch_ref=$(git rev-parse "$TRAVIS_BRANCH")
if [[ $? -ne 0 || ! $branch_ref ]]; then
    echo "failed to get $TRAVIS_BRANCH reference"
    exit 1
fi
if [[ $head_ref != $branch_ref ]]; then
    echo "HEAD ref ($head_ref) does not match $TRAVIS_BRANCH ref ($branch_ref)"
    echo "someone may have pushed new commits before this build cloned the repo"
    exit 1
fi
if ! git checkout "$TRAVIS_BRANCH"; then
    echo "failed to checkout $TRAVIS_BRANCH"
    exit 1
fi
