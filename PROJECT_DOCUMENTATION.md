# 🎰 GSC Slot Gaming Platform - Complete Project Documentation

**Version**: 2.0  
**Status**: Production Ready ✅  
**Framework**: Laravel 10.x  
**PHP Version**: ^8.1  

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Core Features](#core-features)
4. [Database Structure](#database-structure)
5. [API Documentation](#api-documentation)
6. [Admin Panel](#admin-panel)
7. [Gaming Systems](#gaming-systems)
8. [User Management](#user-management)
9. [Financial System](#financial-system)
10. [Telegram Integration](#telegram-integration)
11. [Development Setup](#development-setup)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

GSC Slot is a comprehensive online gaming platform that supports multiple gaming types including:
- **Slot Games** (Multiple providers)
- **2D Lottery System** (00-99)
- **3D Lottery System** (000-999)
- **Digit Games**
- **Shan Games**
- **Live Casino Games**

### Key Features
- Multi-tier user management (Master → Agent → Sub-Agent → Player)
- Real-time balance management
- Comprehensive reporting system
- Telegram bot integration
- Provider game integration
- Automated draw sessions
- Advanced betting systems

---

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Laravel 10.x (PHP 8.1+)
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **Frontend**: Blade Templates + AdminLTE
- **Wallet System**: Bavix Laravel Wallet
- **API**: RESTful APIs with JSON responses
- **Real-time**: WebSocket support (channels.php)

### Directory Structure
```
F5J3_new_client/
├── app/
│   ├── Console/Commands/     # Artisan commands
│   ├── Enums/               # Enum classes
│   ├── Exceptions/          # Custom exceptions
│   ├── Helpers/             # Helper functions
│   ├── Http/
│   │   ├── Controllers/     # All controllers
│   │   ├── Middleware/      # Custom middleware
│   │   ├── Requests/        # Form requests
│   │   └── Resources/       # API resources
│   ├── Models/              # Eloquent models
│   ├── Notifications/       # Laravel notifications
│   ├── Providers/           # Service providers
│   ├── Services/            # Business logic services
│   ├── Telegram/            # Telegram bot handlers
│   └── Traits/              # Reusable traits
├── config/                  # Configuration files
├── database/
│   ├── factories/           # Model factories
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── public/                  # Public assets
├── resources/
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript files
│   ├── sass/                # SASS files
│   └── views/               # Blade templates
├── routes/                  # Route definitions
└── storage/                 # File storage
```

---

## 🎮 Core Features

### 1. Multi-Gaming Platform
- **Slot Games**: Integration with multiple game providers
- **2D Lottery**: 00-99 number betting system
- **3D Lottery**: 000-999 number betting system
- **Digit Games**: Custom digit-based games
- **Shan Games**: Specialized gaming system

### 2. User Hierarchy System
```
Master Account
├── Agent Accounts
    ├── Sub-Agent Accounts
        └── Player Accounts
```

### 3. Wallet System
- **Main Balance**: Primary user balance
- **Game Balance**: Provider-specific balances
- **Transfer System**: Between main and game balances
- **Transaction Logging**: Complete audit trail

### 4. Real-time Features
- Live balance updates
- Real-time notifications
- WebSocket support
- Telegram bot integration

---

## 🗄️ Database Structure

### Core Tables

#### User Management
- `users` - Main user accounts
- `roles` - User roles and permissions
- `permissions` - System permissions
- `role_user` - User-role relationships
- `permission_role` - Role-permission relationships

#### Gaming Tables
- `game_types` - Game categories
- `products` - Game providers
- `game_lists` - Available games
- `operators` - Game operators

#### 2D System
- `two_bet_slips` - 2D bet slips
- `two_bets` - Individual 2D bets
- `two_d_results` - 2D winning numbers
- `two_d_limits` - 2D betting limits
- `head_closes` - Closed 2D numbers
- `choose_digits` - 2D digit management
- `bettles` - 2D battle system

#### 3D System
- `three_d_bet_slips` - 3D bet slips
- `three_d_bets` - Individual 3D bets
- `three_d_results` - 3D winning numbers
- `three_d_limits` - 3D betting limits
- `three_d_close_digits` - Closed 3D numbers
- `three_d_draw_sessions` - 3D draw session management

#### Financial Tables
- `wallets` - User wallets
- `transactions` - Financial transactions
- `transfers` - Balance transfers
- `deposit_requests` - Deposit requests
- `with_draw_requets` - Withdrawal requests
- `banks` - Bank information
- `payment_types` - Payment methods

#### Reporting Tables
- `wagers` - Wager records
- `wager_lists` - Wager listings
- `reports` - System reports
- `report_transactions` - Transaction reports

#### Content Management
- `banners` - Banner images
- `banner_ads` - Advertisement banners
- `promotions` - Promotional content
- `contacts` - Contact information
- `winner_texts` - Winner announcements

---

## 🔌 API Documentation

### Authentication
All API endpoints require authentication using Laravel Sanctum tokens.

#### Login
```http
POST /api/login
{
    "email": "user@example.com",
    "password": "password"
}
```

#### Register
```http
POST /api/register
{
    "name": "User Name",
    "email": "user@example.com",
    "password": "password",
    "password_confirmation": "password"
}
```

### Gaming APIs

#### 2D Betting
```http
POST /api/twod-bet
{
    "totalAmount": 100,
    "amounts": [
        {"num": "12", "amount": 50},
        {"num": "34", "amount": 50}
    ]
}
```

#### 3D Betting
```http
POST /api/threed-bet
{
    "totalAmount": 700,
    "amounts": [
        {"num": "354", "amount": 100},
        {"num": "453", "amount": 100}
    ]
}
```

#### Game Launch
```http
POST /api/seamless/launch-game
{
    "game_code": "GAME001",
    "provider": "provider_name"
}
```

### Financial APIs

#### Balance Transfer
```http
POST /api/exchange-main-to-game
{
    "amount": 100,
    "provider": "provider_name"
}
```

#### Deposit Request
```http
POST /api/depositfinicial
{
    "amount": 100,
    "payment_type_id": 1,
    "bank_id": 1
}
```

#### Withdrawal Request
```http
POST /api/withdrawfinicial
{
    "amount": 100,
    "payment_type_id": 1,
    "bank_id": 1
}
```

### Information APIs

#### User Profile
```http
GET /api/user
```

#### Game Lists
```http
GET /api/game_lists/{type}/{provider}
```

#### Bet History
```http
GET /api/twod-bet/history
GET /api/threed-bet/history
```

---

## 🎛️ Admin Panel

### Dashboard
- **Overview**: System statistics, recent activities
- **Quick Actions**: Common admin tasks
- **Real-time Updates**: Live system status

### User Management

#### Master Management
- Create/Edit master accounts
- View master player lists
- Cash in/out operations
- Account status management

#### Agent Management
- Agent account creation
- Player assignment
- Financial operations
- Performance reports

#### Sub-Agent Management
- Sub-agent account management
- Permission assignment
- Player oversight
- Financial tracking

#### Player Management
- Player account creation
- Balance management
- Transaction history
- Account status control

### Gaming Management

#### 2D System
- **Settings**: Betting limits, close digits
- **Bet Slips**: View and manage bet slips
- **Results**: Declare winning numbers
- **Reports**: Daily ledger, winners
- **Limits**: Configure betting limits

#### 3D System
- **Settings**: Betting limits, close digits, draw sessions
- **Bet Slips**: View and manage bet slips
- **Results**: Declare winning numbers
- **Reports**: Daily ledger, winners
- **Break Groups**: Number categorization
- **Quick Patterns**: Predefined number sets

#### Game Providers
- **Game Types**: Manage game categories
- **Products**: Configure game providers
- **Game Lists**: Manage available games
- **Status Control**: Enable/disable games

### Financial Management

#### Deposits
- View deposit requests
- Approve/reject deposits
- Process payments
- Transaction history

#### Withdrawals
- View withdrawal requests
- Process withdrawals
- Payment verification
- Transaction logs

#### Reports
- **Daily Reports**: Win/loss summaries
- **Transaction Reports**: Financial transactions
- **Game Log Reports**: Gaming activities
- **Player Reports**: Individual player statistics

### Content Management

#### Banners
- Upload banner images
- Manage banner positions
- Schedule banner display
- Banner statistics

#### Promotions
- Create promotional content
- Manage promotion periods
- Track promotion performance
- Content scheduling

#### Winner Announcements
- Post winner announcements
- Manage announcement text
- Schedule announcements
- Archive old announcements

---

## 🎲 Gaming Systems

### 2D Lottery System

#### Features
- **Numbers**: 00-99 (100 numbers)
- **Sessions**: Morning and Evening
- **Payout**: 90x bet amount
- **Limits**: Configurable min/max bets
- **Close Digits**: Individual number control

#### Draw Schedule
- **Morning**: 11:00 AM
- **Evening**: 4:30 PM

#### Betting Options
- Single number betting
- Multiple number selection
- Amount customization
- Real-time validation

### 3D Lottery System

#### Features
- **Numbers**: 000-999 (1000 numbers)
- **Sessions**: 24 draws per year
- **Payout**: 800x bet amount
- **Permutations**: Auto-generated number arrangements
- **Break Groups**: Number categorization by digit sum

#### Draw Schedule
- **January**: 16th only
- **February-November**: 1st and 16th
- **May & December**: 1st, 16th, and 30th

#### Advanced Features
- **Permutation System**: Auto-generates all arrangements
- **Break Groups**: Numbers grouped by digit sum (0-27)
- **Quick Patterns**: Predefined number sets
- **Session Management**: Open/close control

### Slot Games

#### Provider Integration
- **Seamless Integration**: Direct game launching
- **Balance Sync**: Real-time balance updates
- **Transaction Tracking**: Complete audit trail
- **Multi-Provider Support**: Multiple game providers

#### Features
- **Game Categories**: Various game types
- **Provider Management**: Multiple providers
- **Hot Games**: Featured game management
- **Game Statistics**: Performance tracking

### Digit Games

#### Features
- **Custom Digit System**: Flexible digit ranges
- **Betting Options**: Various betting types
- **Result Management**: Custom result declaration
- **Payout System**: Configurable payouts

---

## 👥 User Management

### User Hierarchy

#### Master Account
- **Role**: System administrator
- **Permissions**: Full system access
- **Responsibilities**: Agent management, system configuration

#### Agent Account
- **Role**: Business partner
- **Permissions**: Player management, financial operations
- **Responsibilities**: Player recruitment, financial oversight

#### Sub-Agent Account
- **Role**: Local manager
- **Permissions**: Limited player management
- **Responsibilities**: Local player support, basic operations

#### Player Account
- **Role**: End user
- **Permissions**: Gaming access, personal account management
- **Responsibilities**: Gaming activities, account maintenance

### Permission System

#### Role-Based Access Control
- **Granular Permissions**: Fine-grained access control
- **Permission Groups**: Organized permission categories
- **Dynamic Assignment**: Runtime permission changes
- **Audit Trail**: Permission change logging

#### Permission Categories
- **Player Management**: Create, edit, view players
- **Financial Operations**: Deposits, withdrawals, transfers
- **Gaming Management**: Game configuration, results
- **Reporting**: Access to various reports
- **System Administration**: System configuration

---

## 💰 Financial System

### Wallet Architecture

#### Multi-Balance System
- **Main Balance**: Primary user balance
- **Game Balance**: Provider-specific balances
- **Transfer System**: Seamless balance movement
- **Transaction Logging**: Complete audit trail

#### Balance Operations
- **Deposits**: External money inflow
- **Withdrawals**: External money outflow
- **Transfers**: Internal balance movement
- **Gaming**: Bet placement and winnings

### Transaction Types

#### Financial Transactions
- **Deposits**: External deposits
- **Withdrawals**: External withdrawals
- **Transfers**: Internal transfers
- **Gaming**: Bet and win transactions

#### Gaming Transactions
- **2D Bets**: 2D lottery bets
- **3D Bets**: 3D lottery bets
- **Slot Bets**: Slot game bets
- **Digit Bets**: Digit game bets

### Payment Methods

#### Bank Transfers
- **Bank Management**: Multiple bank support
- **Account Details**: Secure account information
- **Transaction Tracking**: Complete transaction history

#### Digital Payments
- **Payment Types**: Various payment methods
- **Provider Integration**: Third-party payment providers
- **Security**: Secure payment processing

---

## 🤖 Telegram Integration

### Bot Features

#### Communication
- **Message Sending**: Text, photo, video, audio
- **File Sharing**: Document sharing
- **Location Services**: Location-based features
- **Contact Management**: Contact sharing

#### Gaming Integration
- **Balance Checking**: Real-time balance queries
- **Bet Placement**: Telegram-based betting
- **Result Notifications**: Automatic result announcements
- **Support System**: Customer support via Telegram

### Webhook System

#### Webhook Management
- **Webhook Setup**: Automatic webhook configuration
- **Message Handling**: Incoming message processing
- **Event Processing**: Real-time event handling
- **Security**: Secure webhook verification

#### Command Handlers
- **About Command**: System information
- **Contact Command**: Contact information
- **Callback Handling**: Interactive button responses
- **Custom Commands**: Platform-specific commands

---

## 🛠️ Development Setup

### Prerequisites
- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher
- Node.js and NPM
- Git

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd F5J3_new_client
```

#### 2. Install Dependencies
```bash
composer install
npm install
```

#### 3. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

#### 4. Database Setup
```bash
php artisan migrate
php artisan db:seed
```

#### 5. Storage Setup
```bash
php artisan storage:link
```

#### 6. Build Assets
```bash
npm run dev
```

### Configuration Files

#### Environment Variables
```env
APP_NAME="GSC Slot"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gsc_slot
DB_USERNAME=root
DB_PASSWORD=

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_WEBHOOK_URL=your_webhook_url
```

### Development Commands

#### Artisan Commands
```bash
# Clear caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Database operations
php artisan migrate
php artisan migrate:rollback
php artisan db:seed

# Custom commands
php artisan auto-transition-draw-sessions
php artisan fetch-wagers
php artisan generate-loss-analytics
```

---

## 🚀 Deployment

### Production Requirements
- **Server**: Ubuntu 20.04+ or CentOS 8+
- **Web Server**: Nginx or Apache
- **PHP**: 8.1+ with required extensions
- **Database**: MySQL 8.0+
- **SSL Certificate**: Required for production

### Deployment Steps

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install required packages
sudo apt install nginx mysql-server php8.1-fpm php8.1-mysql
```

#### 2. Application Deployment
```bash
# Clone application
git clone <repository-url> /var/www/gsc-slot

# Set permissions
sudo chown -R www-data:www-data /var/www/gsc-slot
sudo chmod -R 755 /var/www/gsc-slot

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install && npm run build
```

#### 3. Database Setup
```bash
# Create database
mysql -u root -p
CREATE DATABASE gsc_slot;
CREATE USER 'gsc_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON gsc_slot.* TO 'gsc_user'@'localhost';
FLUSH PRIVILEGES;

# Run migrations
php artisan migrate --force
php artisan db:seed --force
```

#### 4. Web Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/gsc-slot/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### 5. SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com
```

#### 6. Cron Jobs
```bash
# Add to crontab
* * * * * cd /var/www/gsc-slot && php artisan schedule:run >> /dev/null 2>&1
0 0 * * * cd /var/www/gsc-slot && php artisan auto-transition-draw-sessions >> /dev/null 2>&1
```

### Performance Optimization

#### Application Optimization
```bash
# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```

#### Database Optimization
```sql
-- Optimize database tables
OPTIMIZE TABLE users, transactions, wagers;
```

#### Caching Strategy
- **Configuration Cache**: Cached configuration files
- **Route Cache**: Cached route definitions
- **View Cache**: Cached Blade templates
- **Query Cache**: Database query optimization

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database connection
php artisan tinker
DB::connection()->getPdo();

# Reset database
php artisan migrate:fresh --seed
```

#### 2. Permission Issues
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage/
sudo chmod -R 775 storage/

# Fix bootstrap permissions
sudo chmod -R 775 bootstrap/cache/
```

#### 3. Cache Issues
```bash
# Clear all caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

#### 4. Composer Issues
```bash
# Clear composer cache
composer clear-cache

# Reinstall dependencies
rm -rf vendor/
composer install
```

### Debug Mode

#### Enable Debug Mode
```env
APP_DEBUG=true
APP_ENV=local
```

#### Log Files
```bash
# View Laravel logs
tail -f storage/logs/laravel.log

# View error logs
tail -f /var/log/nginx/error.log
```

### Performance Monitoring

#### Application Monitoring
- **Laravel Telescope**: Debug and monitor application
- **Laravel Horizon**: Monitor queue performance
- **Custom Logging**: Application-specific logging

#### Server Monitoring
- **CPU Usage**: Monitor server performance
- **Memory Usage**: Track memory consumption
- **Disk Space**: Monitor storage usage
- **Network**: Track network performance

---

## 📞 Support

### Contact Information
- **Technical Support**: tech-support@gsc-slot.com
- **Business Inquiries**: business@gsc-slot.com
- **Emergency Contact**: emergency@gsc-slot.com

### Documentation
- **API Documentation**: Available at `/api/docs`
- **Admin Guide**: Available in admin panel
- **User Guide**: Available for registered users

### Maintenance
- **Regular Updates**: Monthly security updates
- **Backup Schedule**: Daily automated backups
- **Monitoring**: 24/7 system monitoring
- **Support Hours**: 24/7 technical support

---

## 📄 License

This project is proprietary software. All rights reserved.

---

**Last Updated**: December 2024  
**Documentation Version**: 2.0  
**Maintained By**: GSC Development Team
