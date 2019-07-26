FROM node:8

WORKDIR /usr/src/app

COPY . .
ENV PORT=3004

EXPOSE 3004

RUN npm i

CMD ["npm", "start"]