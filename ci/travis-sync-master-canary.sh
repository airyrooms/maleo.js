echo "chore: syncing master to canary"
git fetch origin canary:canary --force
echo "Checking out to canary"
git checkout canary
echo "Merging Master to Canary"
git merge master -m 'chore: syncing master to canary [skip ci]'
echo "Pushing Sync"
git push origin canary