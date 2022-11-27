set -e

npm run build

cd dist

echo > .nojekyll

git add .

git commit -m 'deploy'

git push origin main

cd -