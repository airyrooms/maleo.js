echo "Publishing Stable"
echo "Running Prepublish"
yarn publish:prepublish
# publish stable manually
# yarn publish:version-stable
echo "Publishing Stable Version to NPM"
yarn publish:stable
