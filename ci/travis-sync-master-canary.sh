echo "chore: syncing master to canary"
git fetch origin canary:canary
git checkout canary
git merge master -m 'chore: syncing master to canary [skip ci]'
git push origin canary