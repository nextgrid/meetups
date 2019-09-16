# Init
FROM node:10
WORKDIR /usr/src/app 

COPY package*.json ./
RUN npm install

# Bundle app
COPY . .

# Run
EXPOSE 3000
CMD ["npm", "start"]