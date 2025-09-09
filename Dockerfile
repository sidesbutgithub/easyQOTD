FROM node:latest

WORKDIR /bot

COPY package.json ./

RUN npm install

COPY . .

CMD ["npm", "start"]