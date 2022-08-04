FROM node:latest
WORKDIR /DiaBot
COPY package.json .
RUN npm install
COPY . ./
RUN npm run rc
EXPOSE 3000
CMD ["npm","start"]