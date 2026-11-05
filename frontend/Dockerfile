# ===== Этап сборки =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@11.7.0 && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ===== Этап запуска (Nginx раздаёт статику и проксирует API) =====
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
