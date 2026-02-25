FROM php:8.3-fpm

ENV DEBIAN_FRONTEND=noninteractive

RUN rm -rf /var/lib/apt/lists/* \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
  git curl unzip libpq-dev libzip-dev libxml2-dev libonig-dev \
  && docker-php-ext-install pdo pdo_pgsql mbstring xml ctype fileinfo zip \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --prefer-dist

RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
  && mkdir -p /var/www/storage/logs \
  && mkdir -p /var/www/bootstrap/cache \
  && touch /var/www/database/database.sqlite \
  && chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache /var/www/database/database.sqlite

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]