# Global Chat System - Deployment Guide

## 📋 Overview

This guide provides step-by-step instructions for deploying the Global Chat System in production environments. It covers both Laravel backend and React frontend deployment, along with WebSocket configuration and monitoring.

## 🎯 Prerequisites

- Laravel 10+ application
- React 18+ frontend
- MySQL/PostgreSQL database
- Redis (for caching and sessions)
- Pusher account (for WebSocket functionality)
- SSL certificate (required for WebSocket in production)
- Server with PHP 8.1+ and Node.js 16+

## 🚀 Backend Deployment (Laravel)

### 1. Server Setup

#### Ubuntu/Debian Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-redis php8.1-zip unzip git composer

# Install Redis
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

#### CentOS/RHEL Server

```bash
# Update system
sudo yum update -y

# Install EPEL and REMI repositories
sudo yum install -y epel-release
sudo yum install -y https://rpms.remirepo.net/enterprise/remi-release-7.rpm

# Install PHP 8.1
sudo yum-config-manager --enable remi-php81
sudo yum install -y php php-fpm php-mysql php-xml php-mbstring php-curl php-redis php-zip

# Install other packages
sudo yum install -y nginx mysql-server redis git composer
```

### 2. Application Deployment

#### Clone and Setup

```bash
# Navigate to web directory
cd /var/www/html

# Clone your application
sudo git clone https://github.com/your-username/your-app.git chat-system
sudo chown -R www-data:www-data chat-system
cd chat-system

# Install dependencies
composer install --optimize-autoloader --no-dev

# Copy environment file
cp .env.example .env
```

#### Environment Configuration

```bash
# Edit environment file
sudo nano .env
```

```env
APP_NAME="Global Chat System"
APP_ENV=production
APP_KEY=base64:your-generated-key
APP_DEBUG=false
APP_URL=https://your-domain.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chat_system
DB_USERNAME=chat_user
DB_PASSWORD=secure_password

BROADCAST_DRIVER=pusher
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

SANCTUM_STATEFUL_DOMAINS=your-domain.com,www.your-domain.com
SESSION_DOMAIN=.your-domain.com
```

#### Database Setup

```bash
# Create database and user
sudo mysql -u root -p

CREATE DATABASE chat_system;
CREATE USER 'chat_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON chat_system.* TO 'chat_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Run migrations
php artisan migrate --force

# Run seeders
php artisan db:seed --class=GlobalChatRoomSeeder --force

# Generate application key
php artisan key:generate

# Clear and cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### File Permissions

```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/html/chat-system
sudo chmod -R 755 /var/www/html/chat-system
sudo chmod -R 775 /var/www/html/chat-system/storage
sudo chmod -R 775 /var/www/html/chat-system/bootstrap/cache
```

### 3. Nginx Configuration

#### Create Nginx Site Configuration

```bash
sudo nano /etc/nginx/sites-available/chat-system
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Root directory
    root /var/www/html/chat-system/public;
    index index.php index.html index.htm;

    # Handle Laravel routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /\.ht {
        deny all;
    }

    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|pdf|txt)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
}
```

#### Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/chat-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 4. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Set up auto-renewal
sudo crontab -e
# Add this line: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 5. Queue Worker Setup

```bash
# Create systemd service for queue worker
sudo nano /etc/systemd/system/chat-queue-worker.service
```

```ini
[Unit]
Description=Chat System Queue Worker
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
Restart=always
ExecStart=/usr/bin/php /var/www/html/chat-system/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
StandardOutput=append:/var/log/chat-queue.log
StandardError=append:/var/log/chat-queue.log

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start queue worker
sudo systemctl enable chat-queue-worker
sudo systemctl start chat-queue-worker
```

## 🎨 Frontend Deployment (React)

### 1. Build Production Version

```bash
# Navigate to React project directory
cd /path/to/your/react-app

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

```env
REACT_APP_API_URL=https://your-domain.com/api
REACT_APP_PUSHER_APP_KEY=your_pusher_app_key
REACT_APP_PUSHER_APP_CLUSTER=mt1
```

```bash
# Build for production
npm run build
```

### 2. Deploy to Web Server

#### Option 1: Nginx Static Files

```bash
# Copy build files to web server
sudo cp -r build/* /var/www/html/chat-system/public/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/chat-system/public/
```

#### Option 2: Separate Domain/Subdomain

```bash
# Create separate Nginx configuration for frontend
sudo nano /etc/nginx/sites-available/chat-frontend
```

```nginx
server {
    listen 80;
    server_name chat.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name chat.your-domain.com;

    # SSL Configuration (same as backend)
    ssl_certificate /etc/letsencrypt/live/chat.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chat.your-domain.com/privkey.pem;

    root /var/www/html/chat-frontend;
    index index.html;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Continuous Deployment (Optional)

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Chat System

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          cd /var/www/html/chat-system
          git pull origin main
          composer install --optimize-autoloader --no-dev
          php artisan migrate --force
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache
          sudo systemctl restart chat-queue-worker

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
        REACT_APP_PUSHER_APP_KEY: ${{ secrets.REACT_APP_PUSHER_APP_KEY }}
        REACT_APP_PUSHER_APP_CLUSTER: ${{ secrets.REACT_APP_PUSHER_APP_CLUSTER }}
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.4
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.KEY }}
        script: |
          rm -rf /var/www/html/chat-frontend/*
          cp -r build/* /var/www/html/chat-frontend/
          sudo chown -R www-data:www-data /var/www/html/chat-frontend/
```

## 🔧 Configuration

### 1. Pusher Setup

1. **Create Pusher App**
   - Go to [pusher.com](https://pusher.com)
   - Create a new app
   - Note down App ID, Key, Secret, and Cluster

2. **Configure Laravel**
   ```env
   BROADCAST_DRIVER=pusher
   PUSHER_APP_ID=your_app_id
   PUSHER_APP_KEY=your_app_key
   PUSHER_APP_SECRET=your_app_secret
   PUSHER_APP_CLUSTER=mt1
   ```

3. **Configure React**
   ```env
   REACT_APP_PUSHER_APP_KEY=your_app_key
   REACT_APP_PUSHER_APP_CLUSTER=mt1
   ```

### 2. CORS Configuration

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['https://your-domain.com', 'https://chat.your-domain.com'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### 3. Sanctum Configuration

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

## 📊 Monitoring and Logging

### 1. Application Logs

```bash
# Laravel logs
tail -f /var/www/html/chat-system/storage/logs/laravel.log

# Queue worker logs
tail -f /var/log/chat-queue.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. System Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs
```

### 3. Database Monitoring

```sql
-- Check database performance
SHOW PROCESSLIST;
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Queries';

-- Monitor slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

### 4. WebSocket Monitoring

```bash
# Monitor Pusher connections
# Check Pusher dashboard for connection statistics

# Monitor Redis for queue performance
redis-cli
> INFO
> MONITOR
```

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Database Security

```sql
-- Create dedicated database user
CREATE USER 'chat_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON chat_system.* TO 'chat_user'@'localhost';
FLUSH PRIVILEGES;

-- Remove root remote access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 3. Application Security

```bash
# Set secure file permissions
sudo find /var/www/html/chat-system -type f -exec chmod 644 {} \;
sudo find /var/www/html/chat-system -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/html/chat-system/storage
sudo chmod -R 775 /var/www/html/chat-system/bootstrap/cache

# Disable directory listing
echo "Options -Indexes" | sudo tee -a /etc/nginx/conf.d/security.conf
```

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   ```bash
   # Check Pusher credentials
   php artisan tinker
   >>> config('broadcasting.connections.pusher')
   
   # Check SSL certificate
   openssl s_client -connect your-domain.com:443
   ```

2. **Queue Worker Not Processing**
   ```bash
   # Check queue worker status
   sudo systemctl status chat-queue-worker
   
   # Check Redis connection
   redis-cli ping
   
   # Restart queue worker
   sudo systemctl restart chat-queue-worker
   ```

3. **Database Connection Issues**
   ```bash
   # Test database connection
   php artisan tinker
   >>> DB::connection()->getPdo()
   
   # Check MySQL status
   sudo systemctl status mysql
   ```

4. **Nginx Configuration Errors**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

### Performance Issues

1. **Slow Response Times**
   ```bash
   # Enable OPcache
   sudo apt install -y php8.1-opcache
   
   # Configure OPcache in php.ini
   opcache.enable=1
   opcache.memory_consumption=128
   opcache.interned_strings_buffer=8
   opcache.max_accelerated_files=4000
   ```

2. **High Memory Usage**
   ```bash
   # Monitor memory usage
   free -h
   ps aux --sort=-%mem | head
   
   # Optimize PHP-FPM
   sudo nano /etc/php/8.1/fpm/pool.d/www.conf
   # Adjust pm.max_children, pm.start_servers, pm.min_spare_servers
   ```

## 📈 Scaling Considerations

### 1. Horizontal Scaling

```bash
# Load balancer configuration (HAProxy)
sudo apt install -y haproxy

# Configure multiple application servers
# Use Redis for session sharing
# Implement database read replicas
```

### 2. Caching Strategy

```bash
# Install Redis for caching
sudo apt install -y redis-server

# Configure Laravel caching
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### 3. Database Optimization

```sql
-- Optimize database tables
OPTIMIZE TABLE chat_messages;
OPTIMIZE TABLE chat_participants;
OPTIMIZE TABLE chat_rooms;

-- Add indexes for better performance
CREATE INDEX idx_messages_room_created ON chat_messages(chat_room_id, created_at);
CREATE INDEX idx_participants_online ON chat_participants(chat_room_id, is_online);
```

## 📞 Support and Maintenance

### 1. Backup Strategy

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u chat_user -p chat_system > /backups/chat_system_$DATE.sql
gzip /backups/chat_system_$DATE.sql

# Application backup
tar -czf /backups/chat_system_app_$DATE.tar.gz /var/www/html/chat-system

# Keep only last 7 days of backups
find /backups -name "*.sql.gz" -mtime +7 -delete
find /backups -name "*.tar.gz" -mtime +7 -delete
```

### 2. Update Procedures

```bash
# Application updates
cd /var/www/html/chat-system
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart chat-queue-worker
```

### 3. Health Checks

```bash
# Create health check script
#!/bin/bash
# Check if application is responding
curl -f https://your-domain.com/api/health || exit 1

# Check if database is accessible
php artisan tinker --execute="DB::connection()->getPdo();" || exit 1

# Check if Redis is working
redis-cli ping || exit 1

echo "All systems operational"
```

This deployment guide provides a comprehensive approach to deploying your Global Chat System in production. Follow these steps carefully and test thoroughly before going live.
