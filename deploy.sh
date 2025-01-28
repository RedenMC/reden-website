echo "\"$(git rev-parse --short HEAD)\"" > assets/hash.json

nuxi build && \
rsync -va .output/ zly@cagayake.top:/www/website/node/

ssh zly@cagayake.top 'kill -9 $(lsof -t -i:3000); cd /www/website/node/ && screen -d -m bash -c "node server/index.mjs"'
echo 1 | ssh zly@cagayake.top '~/main.py'

#nuxi build
#docker build . -t reden-frontend:1.0
#docker save reden-frontend:1.0 | gzip > reden-frontend.tar.gz
#rsync -va reden-frontend.tar.gz zly@cagayake.top:/www/website/prod/
