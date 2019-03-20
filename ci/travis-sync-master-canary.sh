echo "Syncing Master to Canary"
git fetch origin canary:canary
echo "Checking out to canary"
git checkout canary
echo "Merging Master to Canary"
git merge master -m 'Sync Master to Canary [skip ci]'
echo "Pushing Sync"
git push origin canary