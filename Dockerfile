FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
ENV DB_PASSWORD=admin123
EXPOSE 3000
CMD ["node", "src/server.js"]
