FROM node:8

WORKDIR /usr/src/app

COPY . .
ENV PORT=3000

EXPOSE 3000

RUN npm i

CMD ["npm", "start"]