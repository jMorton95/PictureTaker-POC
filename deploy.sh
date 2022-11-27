set -e

git add . 
git commit -m 'deploy source code'
git push origin main

npm run build

cd dist

echo > .nojekyll

git add .

git commit -m 'deploy prod'

git push origin main

cd -