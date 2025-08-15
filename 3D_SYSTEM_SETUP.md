# 3D Betting System Setup Guide

## Overview
A comprehensive 3-digit betting system (000-999) with 26 annual draw sessions, permutation support, break groups, and advanced management features.

## 🎯 Key Features

### Core Functionality
- **3-Digit Betting**: Numbers from 000 to 999
- **26 Annual Draws**: Specific prize declaration dates throughout the year
- **Permutation System**: Generate all possible arrangements of selected numbers
- **Break Groups**: Categorize numbers by digit sum (0-27)
- **Draw Session Management**: Open/close individual draw sessions
- **Current Session Logic**: Only current draw session open by default

### Advanced Features
- **Real-time Betting**: Live confirmation and wallet integration
- **Quick Selection**: Predefined betting patterns
- **Close Digits**: Individual number open/close control
- **Role-based Access**: Owner, Agent, and Player permissions
- **Comprehensive Reporting**: Bet slips, daily ledger, winners

## 📅 Draw Schedule (26 Sessions Per Year)

### Annual Draw Distribution
- **January**: 16th (1 draw)
- **February**: 1st, 16th (2 draws)
- **March**: 1st, 16th (2 draws)
- **April**: 1st, 16th (2 draws)
- **May**: 1st, 16th (2 draws)
- **June**: 1st, 16th (2 draws)
- **July**: 1st, 16th (2 draws)
- **August**: 1st, 16th (2 draws)
- **September**: 1st, 16th (2 draws)
- **October**: 1st, 16th (2 draws)
- **November**: 1st, 16th (2 draws)
- **December**: 1st, 16th, 30th (3 draws)

### Draw Session Management
- **Current Session**: Automatically open for betting
- **Other Sessions**: Closed by default, can be manually opened
- **Visual Indicators**: Current session highlighted with "CURRENT" badge
- **Status Control**: Click to toggle open/closed status
- **Automatic Transition**: Current session auto-closes at 2:30 PM, next session auto-opens
- **Manual Override**: Admin can manually trigger transitions or override automatic behavior

## 🗄️ Database Structure

### Core Tables
```sql
-- 3D Bet Slips
three_d_bet_slips
- slip_no (unique)
- user_id, agent_id
- total_bet_amount
- draw_session
- status (pending/completed/cancelled)
- game_date, game_time
- before_balance, after_balance

-- 3D Individual Bets
three_d_bets
- user_id, agent_id
- bet_number (3-digit)
- bet_amount
- is_permutation
- break_group (digit sum)
- draw_session
- win_lose, potential_payout
- bet_status, bet_result
- slip_id (foreign key)

-- 3D Results
three_d_results
- win_number (3-digit)
- draw_session (unique)
- result_date, result_time
- break_group
- status (pending/declared/completed)

-- 3D Limits
three_d_limits
- min_bet_amount, max_bet_amount
- max_total_bet
- payout_multiplier (800x)
- is_active

-- 3D Close Digits
three_d_close_digits
- close_digit (000-999)
- status (open/closed)

-- 3D Draw Sessions
three_d_draw_sessions
- draw_session (date)
- is_open (boolean)
- notes
```

## 🏗️ Architecture

### Models
- `ThreeDBetSlip`: Bet slip management
- `ThreeDBet`: Individual bet records
- `ThreeDResult`: Draw results and winners
- `ThreeDLimit`: Betting limits and payouts
- `ThreeDCloseDigit`: Individual number control
- `ThreeDDrawSession`: Draw session status management

### Services
- `ThreeDDrawService`: Draw session calculations and management
- `ThreeDPlayService`: Core betting logic and validation
- `WalletService`: Financial transactions

### Controllers
- `ThreeDigitController` (Admin): Settings, reports, management
- `ThreeDController` (API): Client-side betting operations

## 🎮 Admin Panel Features

### Draw Session Management
- **Visual Grid Layout**: Landscape-friendly card display
- **Current Session Highlight**: Prominent "CURRENT" badge
- **Status Toggle**: Click to open/close sessions
- **Color Coding**: Green (open) / Red (closed)
- **Responsive Design**: Works on all screen sizes

### Settings Management
- **3D Limits**: Set betting limits and payout multipliers
- **Draw Results**: Declare winning numbers and process payouts
- **Close Digits**: Control individual number availability
- **Quick Patterns**: Predefined betting selections

### Reporting System
- **Bet Slip Reports**: View and manage bet slips
- **Daily Ledger**: Track betting amounts by number
- **Daily Winners**: View winning results and payouts
- **Break Group Analysis**: Statistics by digit sum

## 🔧 Installation & Setup

### 1. Database Migrations
```bash
php artisan migrate
```

### 2. Seed Initial Data
```bash
# Seed 3D limits
php artisan db:seed --class=ThreeDLimitSeeder

# Seed close digits (000-999)
php artisan db:seed --class=ThreeDCloseDigitSeeder

# Seed draw sessions with current session logic
php artisan db:seed --class=ThreeDDrawSessionSeeder
```

### 3. Routes Configuration
```php
// Admin routes (routes/admin.php)
Route::get('threed/settings', [ThreeDigitController::class, 'settings']);
Route::post('three-d-limit/store', [ThreeDigitController::class, 'storeThreeDLimit']);
Route::post('three-d-result/store', [ThreeDigitController::class, 'storeThreeDResult']);
Route::get('threed/bet-slip-list', [ThreeDigitController::class, 'betSlipList']);
Route::get('threed/daily-ledger', [ThreeDigitController::class, 'dailyLedger']);
Route::get('threed/daily-winners', [ThreeDigitController::class, 'dailyWinners']);
Route::post('three-d-close-digit/toggle-status', [ThreeDigitController::class, 'toggleThreeDCloseDigit']);
Route::post('three-d-draw-session/toggle-status', [ThreeDigitController::class, 'toggleDrawSession']);
Route::post('three-d-draw-session/trigger-transition', [ThreeDigitController::class, 'triggerSessionTransition']);

// API routes (routes/api.php)
Route::post('/threed-bet', [ThreeDController::class, 'submitBet']);
Route::get('/threed-bet/history', [ThreeDController::class, 'getBetHistory']);
Route::get('/threed/draw-info', [ThreeDController::class, 'getCurrentDrawInfo']);
Route::get('/threed/break-groups', [ThreeDController::class, 'getBreakGroups']);
Route::post('/threed/permutations', [ThreeDController::class, 'generatePermutations']);
```

### 4. Automatic Transition Setup
```bash
# Manual transition command
php artisan threed:transition-sessions

# Set up cron job for automatic transitions (recommended)
# Add to crontab: */5 * * * * cd /path/to/project && php artisan threed:transition-sessions
```

## 🎯 Key Functionality

### Draw Session Logic
```php
// Only current session open by default
$defaultIsOpen = ($status === 'current');

// Manual override capability
$isOpen = isset($sessionStatuses[$session]) ? $sessionStatuses[$session] : $defaultIsOpen;
```

### Automatic Transition Logic
```php
// Auto-close current session at 2:30 PM (draw time)
if ($currentDate->hour >= 14 && $currentDate->minute >= 30) {
    $currentSessionRecord->update(['is_open' => false]);
}

// Auto-open next session
if ($nextSessionRecord && !$nextSessionRecord->is_open) {
    $nextSessionRecord->update(['is_open' => true]);
}
```

### Betting Validation
```php
// Check if draw session is open
if (!ThreeDDrawSession::isSessionOpen($drawSession)) {
    throw new \Exception('This draw session is closed for betting.');
}

// Check if betting window is open
if (!ThreeDDrawService::isBettingOpen($drawSession)) {
    throw new \Exception('Betting is currently closed for this draw session.');
}
```

### Break Group Calculation
```php
// Calculate break group (digit sum)
$breakGroup = array_sum(str_split($threeDigit));
// Example: 123 -> 1+2+3 = 6 (Break Group 6)
```

### Permutation Generation
```php
// Generate all possible arrangements
$permutations = [];
$digits = str_split($number);
$permutations = $this->generatePermutations($digits);
// Example: 123 -> [123, 132, 213, 231, 312, 321]
```

## 🎨 UI/UX Features

### Draw Session Cards
- **Grid Layout**: Responsive 5-column grid
- **Status Badges**: Past/Current/Future indicators
- **Toggle Switches**: Visual open/closed status
- **Hover Effects**: Smooth animations
- **Current Session**: Special highlighting with badge

### Color Scheme
- **Open Sessions**: Blue background, green border
- **Closed Sessions**: Red background, red border
- **Current Session**: Green glow effect
- **Status Badges**: Color-coded by temporal status

### Responsive Design
- **Desktop**: Full grid layout
- **Tablet**: Adjusted columns
- **Mobile**: Stacked layout with touch optimization

## 🔒 Security Features

### Role-Based Access
- **Owner**: Full access to all features
- **Agent**: Access to own players' data
- **Player**: Access to own betting history

### Validation
- **Input Validation**: All user inputs validated
- **Transaction Safety**: Database transactions for financial operations
- **Permission Checks**: Route-level access control

## 📊 API Endpoints

### Betting Operations
```http
POST /api/threed-bet
{
    "totalBetAmount": 100.00,
    "amounts": [
        {"num": "123", "amount": 50.00},
        {"num": "456", "amount": 50.00}
    ],
    "drawSession": "2024-01-16"
}
```

### Information Retrieval
```http
GET /api/threed/draw-info
GET /api/threed/break-groups
GET /api/threed-bet/history
POST /api/threed/permutations
```

## 🛠️ Troubleshooting

### Common Issues
1. **422 Validation Error**: Fixed boolean conversion for draw session toggles
2. **Collection Methods**: Arrays converted to Collections for Blade templates
3. **Draw Session Status**: Current session logic implemented
4. **UI Responsiveness**: Landscape-friendly grid layout
5. **Undefined Variable $availableDrawSessions**: Fixed in all controller methods for consistency
6. **Ledger System**: Fixed to show single draw session with all numbers 000-999 and bet amounts

### Debug Commands
```bash
# Clear caches
php artisan view:clear
php artisan cache:clear

# Check logs
tail -f storage/logs/laravel.log

# Reset draw sessions
php artisan db:seed --class=ThreeDDrawSessionSeeder
```

## 📈 Performance Optimizations

### Database Indexing
- Unique constraints on slip numbers
- Indexed foreign keys
- Optimized queries for large datasets

### Caching Strategy
- View caching for admin panels
- Query result caching for reports
- Session status caching

## 🔄 Recent Updates

### v2.1 - Automatic Session Transition
- ✅ Automatic transition logic implemented
- ✅ Current session auto-closes at 2:30 PM
- ✅ Next session auto-opens when current closes
- ✅ Manual transition trigger button in admin panel
- ✅ Artisan command for manual/automated transitions
- ✅ Cron job setup for automatic execution
- ✅ Prevents multiple future sessions from being open

### v2.0 - Draw Session Management
- ✅ Current session logic implemented
- ✅ Visual session management interface
- ✅ Toggle functionality for open/close
- ✅ Landscape-friendly UI design
- ✅ 422 validation error fixes
- ✅ Enhanced error handling
- ✅ Responsive design improvements

### v1.0 - Core System
- ✅ Complete 3D betting system
- ✅ 26 annual draw sessions
- ✅ Permutation and break group support
- ✅ Admin panel with reporting
- ✅ API endpoints for client integration
- ✅ Wallet integration and transactions

## 📞 Support

For technical support or feature requests, please refer to the system documentation or contact the development team.

---

### postman test data 
{
   "totalAmount": 700,
   "drawSession": "2025-08-16",
   "amounts": [
        {
            "num": "354",
            "amount": 100
        },
        {
            "num": "453",
            "amount": 100
        },
        {
            "num": "435",
            "amount": 100
        },
        {
            "num": "543",
            "amount": 100
        },
        {
            "num": "534",
            "amount": 100
        },
        {
            "num": "355",
            "amount": 100
        },
        {
            "num": "454",
            "amount": 100
        }
    ]
}

**Last Updated**: August 15, 2025  
**Version**: 2.0  
**Status**: Production Ready ✅
