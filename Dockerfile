FROM node:24-alpine as GATEWAY
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start:gateway"]

FROM node:24-alpine as AUTH
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start:auth"]

FROM node:24-alpine as APPOINTMENTS
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start:appointments"]

FROM node:24-alpine as CHAT
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "run", "start:chat"]