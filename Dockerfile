FROM node:14-alpine
RUN apk add sqlite
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "./bin/www"]

