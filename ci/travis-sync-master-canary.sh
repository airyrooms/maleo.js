echo "Syncing Master to Canary"
git fetch origin canary:canary
git checkout canary
git merge master -m 'Sync Master to Canary [skip ci]'
git push origin canary