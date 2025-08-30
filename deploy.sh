echo "\"$(git rev-parse --short HEAD)\"" > assets/hash.json

# Note: force use latest nodejs
# Causes "ERROR terminated" (zlib: incorrect header check)
export PATH=/opt/homebrew/bin:$PATH

nuxi cleanup && nuxi build || exit 1

echo
echo "==========="
echo
echo Press Enter to deploy...
echo
echo "==========="

read

rsync -vac .output/ sl:/www/website/node/
ssh sl 'kill -9 $(lsof -t -i:3000); cd /www/website/node/ && screen -d -m bash -c "REDEN_APP_ENV=production node server/index.mjs"' || exit 1
echo restarting nginx...
ssh sl sudo service nginx restart
#echo 1 | ssh sl '~/mt.py'
echo refreshed cdn.

#nuxi generate && \
#rsync -va .output/public/ sl:/www/website/prod/
#curl -v --connect-to redenmc.com:80:dcdccssy.cn http://redenmc.com/
