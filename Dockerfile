FROM node:9-alpine
WORKDIR /gocdmon

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000 3000
ENTRYPOINT [ "npm" ]
CMD [ "start" ]