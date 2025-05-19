FROM --platform=linux/amd64 node:16.17-alpine

WORKDIR /usr/src/sdk

COPY . . 

RUN npm install

EXPOSE 4001

CMD ["npm", "start"]
