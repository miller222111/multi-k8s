# FROM node:16-alpine
# USER node
# RUN mkdir -p /home/node/app
# WORKDIR '/home/node/app'
# COPY --chown=node:node ./package.json ./
# RUN npm install
# COPY --chown=node:node ./ ./
# CMD [ "npm", "start" ]

FROM node:16-alpine as builder
WORKDIR '/app'
COPY ./package.json .
RUN npm install
COPY . .
# Output will be a folder in /app called build
RUN npm run build

# We now want to copy the build folder to nginx
FROM nginx
EXPOSE 3000
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html