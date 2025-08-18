# Global Chat System - Database Schema Documentation

## 📋 Overview

This document provides detailed information about the database schema for the Global Chat System. The system uses three main tables to manage chat rooms, messages, and user participation.

## 🗄️ Database Tables

### 1. chat_rooms

Stores information about chat rooms in the system.

#### Schema

```sql
CREATE TABLE `chat_rooms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `is_global` tinyint(1) NOT NULL DEFAULT '0',
  `max_participants` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_rooms_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint(20) unsigned | NO | AUTO_INCREMENT | Primary key |
| `name` | varchar(255) | NO | - | Unique room name |
| `description` | varchar(255) | YES | NULL | Room description |
| `is_active` | tinyint(1) | NO | 1 | Whether room is active |
| `is_global` | tinyint(1) | NO | 0 | Whether this is the global chat room |
| `max_participants` | int(11) | YES | NULL | Maximum number of participants |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

#### Indexes

- **Primary Key**: `id`
- **Unique Index**: `name` (ensures unique room names)

#### Sample Data

```sql
INSERT INTO `chat_rooms` (`id`, `name`, `description`, `is_active`, `is_global`, `max_participants`, `created_at`, `updated_at`) VALUES
(1, 'Global Chat', 'Global chat room for all players', 1, 1, NULL, '2024-12-21 10:00:00', '2024-12-21 10:00:00');
```

### 2. chat_messages

Stores all chat messages sent by users.

#### Schema

```sql
CREATE TABLE `chat_messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `chat_room_id` bigint(20) unsigned NOT NULL,
  `message` text NOT NULL,
  `message_type` varchar(255) NOT NULL DEFAULT 'text',
  `metadata` json DEFAULT NULL,
  `is_edited` tinyint(1) NOT NULL DEFAULT '0',
  `edited_at` timestamp NULL DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_messages_chat_room_id_created_at_index` (`chat_room_id`,`created_at`),
  KEY `chat_messages_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `chat_messages_chat_room_id_foreign` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint(20) unsigned | NO | AUTO_INCREMENT | Primary key |
| `user_id` | bigint(20) unsigned | NO | - | Foreign key to users table |
| `chat_room_id` | bigint(20) unsigned | NO | - | Foreign key to chat_rooms table |
| `message` | text | NO | - | Message content |
| `message_type` | varchar(255) | NO | 'text' | Type of message (text, image, file, system) |
| `metadata` | json | YES | NULL | Additional message data |
| `is_edited` | tinyint(1) | NO | 0 | Whether message has been edited |
| `edited_at` | timestamp | YES | NULL | When message was edited |
| `is_deleted` | tinyint(1) | NO | 0 | Whether message is deleted |
| `deleted_at` | timestamp | YES | NULL | When message was deleted |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

#### Indexes

- **Primary Key**: `id`
- **Foreign Key**: `user_id` → `users.id` (CASCADE DELETE)
- **Foreign Key**: `chat_room_id` → `chat_rooms.id` (CASCADE DELETE)
- **Composite Index**: `chat_room_id, created_at` (for efficient message retrieval)
- **Composite Index**: `user_id, created_at` (for user message history)

#### Message Types

- `text`: Regular text messages
- `image`: Image messages with metadata
- `file`: File attachments with metadata
- `system`: System-generated messages (join/leave notifications)

#### Sample Data

```sql
INSERT INTO `chat_messages` (`id`, `user_id`, `chat_room_id`, `message`, `message_type`, `metadata`, `is_edited`, `edited_at`, `is_deleted`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'Hello everyone!', 'text', NULL, 0, NULL, 0, NULL, '2024-12-21 10:30:00', '2024-12-21 10:30:00'),
(2, 1, 1, 'John Doe joined the chat', 'system', NULL, 0, NULL, 0, NULL, '2024-12-21 10:30:00', '2024-12-21 10:30:00');
```

### 3. chat_participants

Tracks user participation in chat rooms and their online status.

#### Schema

```sql
CREATE TABLE `chat_participants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `chat_room_id` bigint(20) unsigned NOT NULL,
  `is_online` tinyint(1) NOT NULL DEFAULT '0',
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `chat_participants_user_id_chat_room_id_unique` (`user_id`,`chat_room_id`),
  KEY `chat_participants_chat_room_id_is_online_index` (`chat_room_id`,`is_online`),
  KEY `chat_participants_user_id_is_online_index` (`user_id`,`is_online`),
  CONSTRAINT `chat_participants_chat_room_id_foreign` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chat_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | bigint(20) unsigned | NO | AUTO_INCREMENT | Primary key |
| `user_id` | bigint(20) unsigned | NO | - | Foreign key to users table |
| `chat_room_id` | bigint(20) unsigned | NO | - | Foreign key to chat_rooms table |
| `is_online` | tinyint(1) | NO | 0 | Whether user is currently online |
| `last_seen_at` | timestamp | YES | NULL | Last activity timestamp |
| `joined_at` | timestamp | YES | NULL | When user joined the room |
| `left_at` | timestamp | YES | NULL | When user left the room |
| `created_at` | timestamp | YES | NULL | Creation timestamp |
| `updated_at` | timestamp | YES | NULL | Last update timestamp |

#### Indexes

- **Primary Key**: `id`
- **Unique Constraint**: `user_id, chat_room_id` (one participation per user per room)
- **Foreign Key**: `user_id` → `users.id` (CASCADE DELETE)
- **Foreign Key**: `chat_room_id` → `chat_rooms.id` (CASCADE DELETE)
- **Composite Index**: `chat_room_id, is_online` (for online users query)
- **Composite Index**: `user_id, is_online` (for user status query)

#### Sample Data

```sql
INSERT INTO `chat_participants` (`id`, `user_id`, `chat_room_id`, `is_online`, `last_seen_at`, `joined_at`, `left_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2024-12-21 10:30:00', '2024-12-21 10:30:00', NULL, '2024-12-21 10:30:00', '2024-12-21 10:30:00');
```

## 🔗 Relationships

### Entity Relationship Diagram

```
users (1) ←→ (N) chat_participants (N) ←→ (1) chat_rooms
    ↑                                           ↑
    |                                           |
    └────── (N) chat_messages (N) ─────────────┘
```

### Relationship Details

1. **User ↔ ChatParticipant** (One-to-Many)
   - One user can participate in multiple chat rooms
   - Each participation record belongs to one user

2. **ChatRoom ↔ ChatParticipant** (One-to-Many)
   - One chat room can have multiple participants
   - Each participation record belongs to one chat room

3. **User ↔ ChatMessage** (One-to-Many)
   - One user can send multiple messages
   - Each message belongs to one user

4. **ChatRoom ↔ ChatMessage** (One-to-Many)
   - One chat room can have multiple messages
   - Each message belongs to one chat room

## 📊 Database Queries

### Common Queries

#### 1. Get Online Users in Global Chat

```sql
SELECT 
    u.id,
    u.user_name,
    u.phone,
    cp.last_seen_at
FROM chat_participants cp
JOIN users u ON cp.user_id = u.id
JOIN chat_rooms cr ON cp.chat_room_id = cr.id
WHERE cr.is_global = 1 
  AND cp.is_online = 1
  AND cp.last_seen_at >= NOW() - INTERVAL 5 MINUTE
ORDER BY cp.last_seen_at DESC;
```

#### 2. Get Recent Messages with User Info

```sql
SELECT 
    cm.id,
    cm.message,
    cm.message_type,
    cm.created_at,
    u.user_name,
    u.phone
FROM chat_messages cm
JOIN users u ON cm.user_id = u.id
WHERE cm.chat_room_id = 1
  AND cm.is_deleted = 0
ORDER BY cm.created_at DESC
LIMIT 50;
```

#### 3. Get User Participation History

```sql
SELECT 
    cr.name as room_name,
    cp.joined_at,
    cp.left_at,
    cp.is_online,
    cp.last_seen_at
FROM chat_participants cp
JOIN chat_rooms cr ON cp.chat_room_id = cr.id
WHERE cp.user_id = ?
ORDER BY cp.created_at DESC;
```

#### 4. Get Message Statistics

```sql
SELECT 
    COUNT(*) as total_messages,
    COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
    COUNT(CASE WHEN message_type = 'system' THEN 1 END) as system_messages,
    COUNT(CASE WHEN is_edited = 1 THEN 1 END) as edited_messages,
    COUNT(CASE WHEN is_deleted = 1 THEN 1 END) as deleted_messages
FROM chat_messages
WHERE chat_room_id = 1;
```

## 🔧 Database Maintenance

### Index Optimization

```sql
-- Analyze table statistics
ANALYZE TABLE chat_messages;
ANALYZE TABLE chat_participants;
ANALYZE TABLE chat_rooms;

-- Check index usage
SHOW INDEX FROM chat_messages;
SHOW INDEX FROM chat_participants;
SHOW INDEX FROM chat_rooms;
```

### Cleanup Queries

#### 1. Clean Up Old Deleted Messages

```sql
-- Delete messages that have been marked as deleted for more than 30 days
DELETE FROM chat_messages 
WHERE is_deleted = 1 
  AND deleted_at < NOW() - INTERVAL 30 DAY;
```

#### 2. Update Offline Users

```sql
-- Mark users as offline if they haven't been active for 5 minutes
UPDATE chat_participants 
SET is_online = 0 
WHERE is_online = 1 
  AND last_seen_at < NOW() - INTERVAL 5 MINUTE;
```

#### 3. Archive Old Messages

```sql
-- Create archive table for old messages (optional)
CREATE TABLE chat_messages_archive LIKE chat_messages;

-- Move messages older than 1 year to archive
INSERT INTO chat_messages_archive 
SELECT * FROM chat_messages 
WHERE created_at < NOW() - INTERVAL 1 YEAR;

-- Delete archived messages from main table
DELETE FROM chat_messages 
WHERE created_at < NOW() - INTERVAL 1 YEAR;
```

## 📈 Performance Considerations

### Indexing Strategy

1. **Message Retrieval**: Index on `chat_room_id, created_at` for efficient message loading
2. **User Activity**: Index on `user_id, created_at` for user message history
3. **Online Status**: Index on `chat_room_id, is_online` for online users query
4. **Participation**: Unique constraint on `user_id, chat_room_id` prevents duplicates

### Query Optimization

1. **Pagination**: Use `LIMIT` and `OFFSET` for large message lists
2. **Caching**: Cache frequently accessed data like online users count
3. **Partitioning**: Consider partitioning `chat_messages` by date for large datasets

### Storage Optimization

1. **Message Content**: Use `TEXT` for message content to handle long messages
2. **Metadata**: Use `JSON` for flexible metadata storage
3. **Timestamps**: Use `TIMESTAMP` for automatic timezone handling

## 🔒 Security Considerations

### Data Protection

1. **Soft Deletes**: Messages are soft-deleted to maintain data integrity
2. **Foreign Keys**: CASCADE DELETE ensures referential integrity
3. **Input Validation**: Validate message content before storage
4. **Access Control**: Ensure users can only access authorized chat rooms

### Privacy

1. **Message Privacy**: Messages are stored in plain text (consider encryption for sensitive data)
2. **User Tracking**: Online status tracking respects user privacy
3. **Data Retention**: Implement data retention policies for old messages

## 📝 Migration History

### Migration Files

1. `2024_12_21_000001_create_chat_rooms_table.php`
2. `2024_12_21_000002_create_chat_messages_table.php`
3. `2024_12_21_000003_create_chat_participants_table.php`

### Seeder Files

1. `GlobalChatRoomSeeder.php` - Creates the default global chat room

## 🚀 Future Enhancements

### Potential Schema Changes

1. **Message Reactions**: Add `reactions` JSON column to `chat_messages`
2. **Message Threading**: Add `parent_message_id` to `chat_messages`
3. **User Roles**: Add `role` column to `chat_participants`
4. **Room Categories**: Add `category_id` to `chat_rooms`
5. **Message Encryption**: Add encryption fields for secure messaging

### Performance Improvements

1. **Read Replicas**: Use read replicas for message queries
2. **Caching Layer**: Implement Redis caching for active users
3. **Message Queues**: Use queues for message processing
4. **Database Sharding**: Shard by chat room for large-scale deployments
