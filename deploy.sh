ssh sl 'cd reden-api &&
git pull &&
git submodule update &&
docker compose build frontend &&
docker compose up --no-deps -d frontend'
