FROM php:8.2-cli-alpine

# Install system dependencies & PHP extensions
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

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend application
COPY backend/ ./backend/

WORKDIR /app/backend

# Install backend dependencies
RUN composer install --no-dev --optimize-autoloader

# Ensure storage directories exist and have proper permissions
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache && \
    chmod -R 777 storage bootstrap/cache

EXPOSE 8080

# Start Laravel
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
