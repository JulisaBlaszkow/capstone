FROM node:14-alpine
#RUN apk update && apk upgrade
#RUN apk add --no-cache sqlite-dev
#RUN apk add sqlite
RUN apk add --update sqlite
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "./bin/www"]

