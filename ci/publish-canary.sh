echo "Publishing Canary"
echo "Running Prepublish"
yarn publish:prepublish
echo "Bumping up Version"
yarn publish:version-canary
echo "Publsihing Canary Version to NPM"
yarn publish:canary