# Production Environment Configuration for Digital Ocean

## 🚀 Server Setup Commands

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Packages
```bash
sudo apt install nginx php8.2-fpm php8.2-mysql php8.2-xml php8.2-mbstring php8.2-curl php8.2-zip php8.2-gd php8.2-bcmath php8.2-intl php8.2-redis supervisor -y
```

### 3. Install Composer
```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 4. Install Node.js and NPM
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 🔧 Laravel Application Setup

### 1. Clone/Upload Your Project
```bash
cd /var/www
sudo git clone your-repository-url gsc_slot
cd gsc_slot/F5J3_new_client
```

### 2. Set Permissions
```bash
sudo chown -R www-data:www-data /var/www/gsc_slot
sudo chmod -R 755 /var/www/gsc_slot
sudo chmod -R 775 /var/www/gsc_slot/storage
sudo chmod -R 775 /var/www/gsc_slot/bootstrap/cache
```

### 3. Install Dependencies
```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

### 4. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

## 🌐 Production .env Configuration

```env
APP_NAME="GSC Slot"
APP_ENV=production
APP_KEY=your-generated-key
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

BROADCAST_DRIVER=reverb
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# Laravel Reverb Configuration
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=https

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email
MAIL_FROM_NAME="${APP_NAME}"
```

## 🔄 Supervisor Configuration for Reverb

Create `/etc/supervisor/conf.d/reverb.conf`:

```ini
[program:laravel-reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/gsc_slot/F5J3_new_client/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/gsc_slot/F5J3_new_client/storage/logs/reverb.log
stopwaitsecs=3600
```

## 🚀 Start Services

```bash
# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start laravel-reverb:*

# Restart Nginx
sudo systemctl restart nginx

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

## 🔍 Verification Commands

```bash
# Check Reverb status
sudo supervisorctl status laravel-reverb:*

# Check Nginx status
sudo systemctl status nginx

# Check PHP-FPM status
sudo systemctl status php8.3-fpm

# Test WebSocket connection
curl -I https://your-domain.com/reverb
```
