FROM node:14-alpine
#RUN apk update && apk upgrade
#RUN apk add --no-cache sqlite-dev
#RUN apk add sqlite
RUN apk add --no-cache g++ git jq make python sqlite sqlite-dev \
  && NODE_SQLITE_VERSION=$(cat node_modules/sqlite3/package.json | jq '.version' --raw-output) \
  && npm un sqlite3 -S \
  && npm i --production \
  && wget https://github.com/mapbox/node-sqlite3/archive/v${5.1.4}.zip -O /opt/sqlite3.zip \
  && mkdir -p /opt/sqlite3 \
  && unzip /opt/sqlite3.zip -d /opt/sqlite3 \
  && cd /opt/sqlite3/node-sqlite3-${5.1.4} \
  && npm install \
  && ./node_modules/.bin/node-pre-gyp install --fallback-to-build --build-from-source --sqlite=/usr/bin --python=$(which python) \
  && mv /opt/sqlite3/node-sqlite3-${5.1.4} /opt/app/node_modules/sqlite3 \
  && apk del g++ git jq make python \
  && rm -Rf /opt/sqlite3 /opt/sqlite3.zip
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "./bin/www"]

