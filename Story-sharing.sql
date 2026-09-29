-- ============================================================
-- SCHEMA: App chia sẻ câu chuyện (Threads Clone)
-- Database: MySQL 8.0+
-- ============================================================

CREATE DATABASE IF NOT EXISTS threads_clone
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE threads_clone;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. USERS
-- ============================================================
CREATE TABLE users (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    username        VARCHAR(30)   NOT NULL,
    display_name    VARCHAR(50)   NULL,
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    avatar_url      TEXT          NULL,
    bio             VARCHAR(160)  NULL,
    is_private      TINYINT(1)    NOT NULL DEFAULT 0,
    is_verified     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 2. POSTS (bài đăng / thread / reply)
-- ============================================================
CREATE TABLE posts (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)      NOT NULL,
    parent_post_id  CHAR(36)      NULL,          -- dùng cho reply lồng nhau
    content         TEXT          NULL,
    visibility      ENUM('public','followers','private') NOT NULL DEFAULT 'public',
    like_count      INT UNSIGNED  NOT NULL DEFAULT 0,
    reply_count     INT UNSIGNED  NOT NULL DEFAULT 0,
    repost_count    INT UNSIGNED  NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP     NULL,
    PRIMARY KEY (id),
    KEY idx_posts_user_created (user_id, created_at),
    KEY idx_posts_parent (parent_post_id),
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_posts_parent
        FOREIGN KEY (parent_post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 3. MEDIA (ảnh / video đính kèm bài đăng)
-- ============================================================
CREATE TABLE media (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    post_id         CHAR(36)      NOT NULL,
    type            ENUM('image','video','gif') NOT NULL,
    url             TEXT          NOT NULL,
    thumbnail_url   TEXT          NULL,
    width           INT UNSIGNED  NULL,
    height          INT UNSIGNED  NULL,
    order_index     TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_media_post (post_id),
    CONSTRAINT fk_media_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 4. LIKES
-- ============================================================
CREATE TABLE likes (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)      NOT NULL,
    post_id         CHAR(36)      NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_likes_user_post (user_id, post_id),
    KEY idx_likes_post (post_id),
    CONSTRAINT fk_likes_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_likes_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 5. FOLLOWS
-- ============================================================
CREATE TABLE follows (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    follower_id     CHAR(36)      NOT NULL,   -- người theo dõi
    following_id    CHAR(36)      NOT NULL,   -- người được theo dõi
    status          ENUM('accepted','pending') NOT NULL DEFAULT 'accepted',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_follows_pair (follower_id, following_id),
    KEY idx_follows_following (following_id),
    CONSTRAINT fk_follows_follower
        FOREIGN KEY (follower_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_follows_following
        FOREIGN KEY (following_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_follows_not_self CHECK (follower_id <> following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 6. REPOSTS (đăng lại / trích dẫn)
-- ============================================================
CREATE TABLE reposts (
    id                  CHAR(36)  NOT NULL DEFAULT (UUID()),
    user_id             CHAR(36)  NOT NULL,
    original_post_id    CHAR(36)  NOT NULL,
    quote_text          TEXT      NULL,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reposts_user_post (user_id, original_post_id),
    KEY idx_reposts_original (original_post_id),
    CONSTRAINT fk_reposts_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reposts_original
        FOREIGN KEY (original_post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)      NOT NULL,   -- người nhận thông báo
    actor_id        CHAR(36)      NOT NULL,   -- người gây ra hành động
    type            ENUM('like','reply','follow','mention','repost') NOT NULL,
    post_id         CHAR(36)      NULL,
    is_read         TINYINT(1)    NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_noti_user_read (user_id, is_read, created_at),
    CONSTRAINT fk_noti_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_noti_actor
        FOREIGN KEY (actor_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_noti_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 8. BLOCKS / MUTES
-- ============================================================
CREATE TABLE blocks (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id         CHAR(36)      NOT NULL,   -- người chặn/ẩn
    target_user_id  CHAR(36)      NOT NULL,   -- người bị chặn/ẩn
    type            ENUM('block','mute') NOT NULL,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_blocks_pair_type (user_id, target_user_id, type),
    CONSTRAINT fk_blocks_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_blocks_target
        FOREIGN KEY (target_user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_blocks_not_self CHECK (user_id <> target_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 9. REPORTS (báo cáo vi phạm)
-- ============================================================
CREATE TABLE reports (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    reporter_id     CHAR(36)      NOT NULL,
    post_id         CHAR(36)      NULL,
    reported_user_id CHAR(36)     NULL,
    reason          VARCHAR(255)  NOT NULL,
    status          ENUM('pending','reviewed','dismissed') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_reports_status (status),
    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_reports_user
        FOREIGN KEY (reported_user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- 10. HASHTAGS
-- ============================================================
CREATE TABLE hashtags (
    id              CHAR(36)      NOT NULL DEFAULT (UUID()),
    tag             VARCHAR(100)  NOT NULL,
    post_count      INT UNSIGNED  NOT NULL DEFAULT 0,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_hashtags_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE post_hashtags (
    post_id         CHAR(36)      NOT NULL,
    hashtag_id      CHAR(36)      NOT NULL,
    PRIMARY KEY (post_id, hashtag_id),
    KEY idx_post_hashtags_hashtag (hashtag_id),
    CONSTRAINT fk_ph_post
        FOREIGN KEY (post_id) REFERENCES posts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_ph_hashtag
        FOREIGN KEY (hashtag_id) REFERENCES hashtags(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

USE threads_clone;
 
SET FOREIGN_KEY_CHECKS = 0;
 
-- ============================================================
-- 1. USERS: thêm role, status, ban_reason, banned_until
--    rồi bỏ deleted_at
-- ============================================================
ALTER TABLE users
  ADD COLUMN role   ENUM('user','moderator','admin') NOT NULL DEFAULT 'user'
      AFTER bio,
  ADD COLUMN status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active'
      AFTER role,
  ADD COLUMN ban_reason   VARCHAR(255) NULL AFTER status,
  ADD COLUMN banned_until TIMESTAMP    NULL AFTER ban_reason;
 
-- Nếu trước đó có user nào đã bị soft-delete (deleted_at IS NOT NULL),
-- chuyển họ sang trạng thái banned trước khi xóa cột deleted_at,
-- để không mất thông tin.
SET SQL_SAFE_UPDATES = 0;
UPDATE users
  SET status = 'banned',
      ban_reason = 'Migrated from deleted_at'
  WHERE deleted_at IS NOT NULL;
 
ALTER TABLE users
  DROP COLUMN deleted_at,
  ADD INDEX idx_users_status (status);
 
-- Sửa is_private/is_verified từ TINYINT(1) sang TINYINT (bỏ warning display width)
ALTER TABLE users
  MODIFY COLUMN is_private  TINYINT NOT NULL DEFAULT 0,
  MODIFY COLUMN is_verified TINYINT NOT NULL DEFAULT 0;
 
-- ============================================================
-- 2. POSTS: thêm status, removed_reason, bỏ deleted_at
-- ============================================================
ALTER TABLE posts
  ADD COLUMN status ENUM('active','hidden','removed') NOT NULL DEFAULT 'active'
      AFTER visibility,
  ADD COLUMN removed_reason VARCHAR(255) NULL AFTER status;
 
UPDATE posts
  SET status = 'removed',
      removed_reason = 'Migrated from deleted_at'
  WHERE deleted_at IS NOT NULL;
 
ALTER TABLE posts
  DROP COLUMN deleted_at,
  ADD INDEX idx_posts_status (status);
 
-- ============================================================
-- 3. MEDIA: thêm status
-- ============================================================
ALTER TABLE media
  ADD COLUMN status ENUM('active','removed') NOT NULL DEFAULT 'active'
      AFTER order_index;
 
-- ============================================================
-- 4. NOTIFICATIONS: sửa is_read từ TINYINT(1) sang TINYINT
--    (chỉ để hết warning display width, không đổi logic)
-- ============================================================
ALTER TABLE notifications
  MODIFY COLUMN is_read TINYINT NOT NULL DEFAULT 0;
 
-- ============================================================
-- 5. USER_BANS: bảng mới - lịch sử cấm/tạm khóa tài khoản
-- ============================================================
CREATE TABLE IF NOT EXISTS user_bans (
    id          CHAR(36)      NOT NULL DEFAULT (UUID()),
    user_id     CHAR(36)      NOT NULL,
    banned_by   CHAR(36)      NOT NULL,
    reason      VARCHAR(255)  NOT NULL,
    banned_at   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP     NULL,
    lifted_at   TIMESTAMP     NULL,
    is_active   TINYINT       NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    KEY idx_bans_user (user_id, is_active),
    CONSTRAINT fk_bans_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_bans_admin
        FOREIGN KEY (banned_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
SET FOREIGN_KEY_CHECKS = 1;
DESCRIBE users;
DESCRIBE posts;
DESCRIBE media;
SHOW TABLES;

USE threads_clone;
 
SET FOREIGN_KEY_CHECKS = 0;
 
-- ============================================================
-- 1. USERS (5 user thường + 1 admin)
-- ============================================================
INSERT INTO users (id, username, display_name, email, password_hash, avatar_url, bio, role, status, is_private, is_verified) VALUES
('u0000000-0000-0000-0000-000000000001', 'admin',      'Quản trị viên', 'admin@storyapp.vn',   '$2y$hash_admin',  NULL, 'Tài khoản quản trị hệ thống', 'admin', 'active', 0, 1),
('u0000000-0000-0000-0000-000000000002', 'minhhieu',    'Hoàng Minh Hiếu', '
hieu@storyapp.vn',  '$2y$hash_hieu',   'https://cdn.storyapp.vn/avatar/hieu.jpg', 'Kể chuyện mỗi ngày ✍️', 'user', 'active', 0, 1),
('u0000000-0000-0000-0000-000000000003', 'lananh',      'Lan Anh',        'lananh@storyapp.vn', '$2y$hash_lananh', 'https://cdn.storyapp.vn/avatar/lananh.jpg', 'Yêu du lịch và viết lách', 'user', 'active', 0, 0),
('u0000000-0000-0000-0000-000000000004', 'quangkhoi',   'Quang Khôi',     'khoi@storyapp.vn',   '$2y$hash_khoi',   NULL, 'Chia sẻ chuyện đời thường', 'user', 'active', 1, 0),
('u0000000-0000-0000-0000-000000000005', 'thuytrang',   'Thùy Trang',     'trang@storyapp.vn',  '$2y$hash_trang',  'https://cdn.storyapp.vn/avatar/trang.jpg', 'Content creator | Storyteller', 'user', 'active', 0, 1),
('u0000000-0000-0000-0000-000000000006', 'spamuser99',  'Spam User',      'spam99@storyapp.vn', '$2y$hash_spam',   NULL, NULL, 'user', 'banned', 0, 0);
UPDATE users
SET password_hash = '$2b$10$NjcTldKERmVWnWcZo03Eku1LzIdtpz6Ggpz6KSHIvf8xY1FZFM03C'
WHERE email IN (
  'admin@storyapp.vn',
  'hieu@storyapp.vn',
  'lananh@storyapp.vn',
  'khoi@storyapp.vn',
  'trang@storyapp.vn',
  'spam99@storyapp.vn'
);
-- Cập nhật lý do cấm cho user vi phạm (dùng để test chức năng ban)
UPDATE users
  SET ban_reason = 'Đăng nội dung spam liên tục',
      banned_until = NULL   -- NULL = cấm vĩnh viễn
  WHERE id = 'u0000000-0000-0000-0000-000000000006';
 
-- ============================================================
-- 2. POSTS (bài gốc + reply tạo thành thread)
-- ============================================================
INSERT INTO posts (id, user_id, parent_post_id, content, visibility, status, like_count, reply_count, repost_count) VALUES
('p0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', NULL, 'Hôm nay mình vừa hoàn thành chuyến đi Đà Lạt, không khí thật trong lành! 🌲', 'public', 'active', 2, 1, 1),
('p0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'Đẹp quá, mình cũng muốn đi Đà Lạt ghê!', 'public', 'active', 1, 0, 0),
('p0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000004', NULL, 'Chia sẻ câu chuyện về lần đầu tự nấu ăn thất bại 😂', 'public', 'active', 3, 0, 0),
('p0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000005', NULL, 'Bài viết này chỉ dành cho người theo dõi mình thôi nhé', 'followers', 'active', 0, 0, 0),
('p0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000006', NULL, 'Mua ngay kẻo hết, link bio!!! 🔥🔥🔥', 'public', 'removed', 0, 0, 0);
 
-- Cập nhật lý do gỡ bài vi phạm
UPDATE posts
  SET removed_reason = 'Nội dung spam quảng cáo'
  WHERE id = 'p0000000-0000-0000-0000-000000000005';
 
-- ============================================================
-- 3. MEDIA (ảnh đính kèm bài viết)
-- ============================================================
INSERT INTO media (id, post_id, type, url, thumbnail_url, width, height, order_index, status) VALUES
('m0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'image', 'https://cdn.storyapp.vn/posts/dalat1.jpg', 'https://cdn.storyapp.vn/posts/dalat1_thumb.jpg', 1080, 1350, 0, 'active'),
('m0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'image', 'https://cdn.storyapp.vn/posts/dalat2.jpg', 'https://cdn.storyapp.vn/posts/dalat2_thumb.jpg', 1080, 1350, 1, 'active'),
('m0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 'image', 'https://cdn.storyapp.vn/posts/nauan_fail.jpg', NULL, 1080, 1080, 0, 'active');
 
-- ============================================================
-- 4. LIKES
-- ============================================================
INSERT INTO likes (id, user_id, post_id) VALUES
('l0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001'),
('l0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000001'),
('l0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002'),
('l0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000003'),
('l0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003'),
('l0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000003');
 
-- ============================================================
-- 5. FOLLOWS
-- ============================================================
INSERT INTO follows (id, follower_id, following_id, status) VALUES
('f0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000002', 'accepted'),
('f0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000002', 'accepted'),
('f0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000005', 'accepted'),
('f0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000005', 'pending'), -- trang là tài khoản riêng tư nhưng không private, ví dụ pending do khoi private
('f0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000004', 'pending'); -- khoi (private) chưa duyệt
 
-- ============================================================
-- 6. REPOSTS
-- ============================================================
INSERT INTO reposts (id, user_id, original_post_id, quote_text) VALUES
('r0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000001', 'Địa điểm này để dành cho chuyến đi tới của mình luôn!');
 
-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (id, user_id, actor_id, type, post_id, is_read) VALUES
('n0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'like',   'p0000000-0000-0000-0000-000000000001', 0),
('n0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'reply',  'p0000000-0000-0000-0000-000000000002', 0),
('n0000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000005', 'repost', 'p0000000-0000-0000-0000-000000000001', 1),
('n0000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000003', 'follow', NULL, 1);
 
-- ============================================================
-- 8. BLOCKS / MUTES
-- ============================================================
INSERT INTO blocks (id, user_id, target_user_id, type) VALUES
('b0000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000006', 'block');
 
-- ============================================================
-- 9. REPORTS
-- ============================================================
INSERT INTO reports (id, reporter_id, post_id, reported_user_id, reason, status) VALUES
('rp000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000006', 'Bài viết spam quảng cáo', 'reviewed');
 
-- ============================================================
-- 10. HASHTAGS + POST_HASHTAGS
-- ============================================================
INSERT INTO hashtags (id, tag, post_count) VALUES
('h0000000-0000-0000-0000-000000000001', 'dalat', 1),
('h0000000-0000-0000-0000-000000000002', 'dulich', 1),
('h0000000-0000-0000-0000-000000000003', 'nauan', 1);
 
INSERT INTO post_hashtags (post_id, hashtag_id) VALUES
('p0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001'),
('p0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000002'),
('p0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000003');
 
-- ============================================================
-- 11. USER_BANS (lịch sử cấm tài khoản spam)
-- ============================================================
INSERT INTO user_bans (id, user_id, banned_by, reason, expires_at, is_active) VALUES
('ub000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000001', 'Đăng nội dung spam liên tục', NULL, 1);
 
SET FOREIGN_KEY_CHECKS = 1;
 
-- ============================================================
-- KIỂM TRA SAU KHI CHẠY:
 SELECT * FROM users;
SELECT * FROM posts;
SELECT p.content, u.username, COUNT(l.id) AS total_likes
FROM posts p
JOIN users u ON u.id = p.user_id
LEFT JOIN likes l ON l.post_id = p.id
GROUP BY p.id;
-- ============================================================