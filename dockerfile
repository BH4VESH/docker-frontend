FROM node:alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build 

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf *

# Copy the build output to Nginx's HTML directory
COPY --from=build /app/dist/admin-dashboard/browser /usr/share/nginx/html

EXPOSE 80
# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
