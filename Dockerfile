FROM node:24-slim as GATEWAY
WORKDIR /app
COPY . .
RUN npm ci --no-optional
RUN npm run build
CMD ["npm", "run", "start:gateway"]

FROM node:24-slim as AUTH
WORKDIR /app
COPY . .
RUN npm ci --no-optional
RUN npm run build
CMD ["npm", "run", "start:auth"]

FROM node:24-slim as APPOINTMENTS
WORKDIR /app
COPY . .
RUN npm ci --no-optional
RUN npm run build
CMD ["npm", "run", "start:appointments"]

FROM node:24-slim as CHAT
WORKDIR /app
COPY . .
RUN npm ci --no-optional
RUN npm run build
CMD ["npm", "run", "start:chat"]