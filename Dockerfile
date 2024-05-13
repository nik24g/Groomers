FROM node:18-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN mkdir public
COPY src ./src
RUN ls -la
COPY package.json ./
COPY app.js ./
RUN npm i
RUN npm i -g nodemon
WORKDIR /opt/app
RUN ls -la
EXPOSE 8000
CMD ["nodemon", "server.js"]