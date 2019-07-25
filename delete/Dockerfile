FROM node:8

WORKDIR /usr/src/app

COPY . .
ENV PORT=3003

EXPOSE 3003

RUN npm i

CMD ["npm", "start"]