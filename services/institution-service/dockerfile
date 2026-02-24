FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    git curl unzip libpq-dev libzip-dev libxml2-dev libonig-dev \
  && docker-php-ext-install pdo pdo_pgsql mbstring xml ctype fileinfo zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --prefer-dist

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]