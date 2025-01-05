FROM node:22-alpine

# set work dir
WORKDIR /usr/app

# copy package.json
COPY package*.json ./

# install deps
RUN npm install --only=production

# copy dist folder to /usr/app/dist
ADD dist ./dist

# set env to prod
ENV NODE_ENV production

VOLUME ["/usr/app/data", "/usr/app/config"]
CMD npm start
