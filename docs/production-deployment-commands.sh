#!/bin/bash

# Production Deployment Commands for Digital Ocean
# Run these commands on your server

echo "🚀 Starting Digital Ocean Production Deployment..."

# 1. Update environment variables
echo "📝 Updating environment variables..."
sed -i 's/REVERB_HOST="localhost"/REVERB_HOST=127.0.0.1/' .env
sed -i 's/REVERB_SCHEME=http/REVERB_SCHEME=https/' .env

# 2. Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/F5J3_new_client
sudo chmod -R 755 /var/www/F5J3_new_client
sudo chmod -R 775 /var/www/F5J3_new_client/storage
sudo chmod -R 775 /var/www/F5J3_new_client/bootstrap/cache

# 3. Clear and cache Laravel
echo "🧹 Clearing Laravel caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache

# 4. Install supervisor configuration
echo "📋 Installing supervisor configuration..."
sudo cp /var/www/F5J3_new_client/etc/supervisor/conf.d/reverb.conf /etc/supervisor/conf.d/
sudo supervisorctl reread
sudo supervisorctl update

# 5. Start Reverb service
echo "🔌 Starting Reverb service..."
sudo supervisorctl start laravel-reverb:*

# 6. Check Reverb status
echo "✅ Checking Reverb status..."
sudo supervisorctl status laravel-reverb:*

# 7. Test WebSocket connection
echo "🧪 Testing WebSocket connection..."
curl -I http://127.0.0.1:8080

# 8. Restart services
echo "🔄 Restarting services..."
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm

echo "🎉 Production deployment completed!"
echo "📊 Check logs: sudo tail -f /var/www/F5J3_new_client/storage/logs/reverb.log"
