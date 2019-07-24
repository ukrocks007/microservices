FROM node:8

WORKDIR /usr/src/app

COPY . .
ENV PORT=3002

EXPOSE 3002

RUN npm i

CMD ["npm", "start"]