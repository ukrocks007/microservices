FROM node:8

WORKDIR /usr/src/app

COPY . .
ENV PORT=3001

EXPOSE 3001

RUN npm i

CMD ["npm", "start"]