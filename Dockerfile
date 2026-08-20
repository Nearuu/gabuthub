FROM php:8.2-cli-alpine

RUN apk add --no-cache \
    curl \
    git \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev \
    mariadb-connector-c-dev \
    postgresql-dev \
    bash

RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql mbstring bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend

COPY backend/ /app/backend/

RUN composer install --no-dev --optimize-autoloader

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache && \
    chmod -R 777 storage bootstrap/cache

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "php artisan config:clear && php artisan route:clear && php artisan cache:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
