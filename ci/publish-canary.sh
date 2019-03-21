echo "Publishing Canary"
echo "Running Prepublish"
yarn publish:prepublish
echo "Bumping up Version"
yarn publish:version-canary


echo "Publishing Canary Version to NPM. More info $TRAVIS_BUILD_WEB_URL"
if ! yarn publish:canary; then
  wget https://raw.githubusercontent.com/DiscordHooks/travis-ci-discord-webhook/master/send.sh
  chmod +x send.sh
  ./send.sh failure $DISCORD_WEBHOOK_URL
else
  wget https://raw.githubusercontent.com/DiscordHooks/travis-ci-discord-webhook/master/send.sh
  chmod +x send.sh
  ./send.sh success $DISCORD_WEBHOOK_URL
fi