-- ================================================
-- AIDEA Database Schema
-- 위치 기반 AI 모임 매칭 플랫폼
-- ================================================

-- 기존 테이블 삭제 (역순)
DROP TABLE IF EXISTS NOTIFICATION;

DROP TABLE IF EXISTS READ_RECEIPT;

DROP TABLE IF EXISTS REPORT;

DROP TABLE IF EXISTS CHAT_MESSAGE;

DROP TABLE IF EXISTS MEETING_TAG;

DROP TABLE IF EXISTS MEETING_MEMBER;

DROP TABLE IF EXISTS MEETING_LIKE;

DROP TABLE IF EXISTS MEETING;

DROP TABLE IF EXISTS USER_INTEREST;

DROP TABLE IF EXISTS INTEREST;

DROP TABLE IF EXISTS USER;

-- ================================================
-- 1. USER (사용자)
-- ================================================
CREATE TABLE USER (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,
    nickname VARCHAR(50) NOT NULL,
    profile_image VARCHAR(500) NULL,
    location VARCHAR(100) NULL,
    latitude DOUBLE NULL,
    longitude DOUBLE NULL,
    location_updated_at DATETIME NULL,
    provider ENUM(
        'LOCAL',
        'KAKAO',
        'GOOGLE',
        'NAVER'
    ) NULL,
    provider_id VARCHAR(100) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_user_location (latitude, longitude)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 2. INTEREST (관심사)
-- ================================================
CREATE TABLE INTEREST (
    interest_id INT AUTO_INCREMENT PRIMARY KEY,
    interest_name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_interest_name (interest_name)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 3. USER_INTEREST (사용자 관심사)
-- ================================================
CREATE TABLE USER_INTEREST (
    user_interest_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    interest_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_interest (user_id, interest_id),
    CONSTRAINT fk_userinterest_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_userinterest_interest FOREIGN KEY (interest_id) REFERENCES INTEREST (interest_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 4. MEETING (모임)
-- ================================================
CREATE TABLE MEETING (
    meeting_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    location VARCHAR(200) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    location_detail VARCHAR(200) NULL,
    max_members INT NOT NULL,
    current_members INT DEFAULT 1,
    meeting_date DATETIME NOT NULL,
    status ENUM(
        'RECRUITING',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'RECRUITING',
    is_approval_required BOOLEAN DEFAULT false,
    like_count INT DEFAULT 0,
    creator_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_meeting_location (latitude, longitude),
    INDEX idx_meeting_date_status (meeting_date, status),
    INDEX idx_meeting_status (status),
    INDEX idx_creator (creator_id),
    INDEX idx_like_count_date (like_count, meeting_date),
    CONSTRAINT fk_meeting_creator FOREIGN KEY (creator_id) REFERENCES USER (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 5. MEETING_LIKE (모임 좋아요)
-- ================================================
CREATE TABLE MEETING_LIKE (
    like_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    meeting_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_meeting_like (user_id, meeting_id),
    INDEX idx_meeting_like (meeting_id),
    INDEX idx_user_like (user_id),
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_meeting FOREIGN KEY (meeting_id) REFERENCES MEETING (meeting_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 6. MEETING_MEMBER (모임 참가자)
-- ================================================
CREATE TABLE MEETING_MEMBER (
    member_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role ENUM('HOST', 'MEMBER') DEFAULT 'MEMBER',
    status ENUM(
        'PENDING',
        'APPROVED',
        'REJECTED',
        'LEFT'
    ) DEFAULT 'APPROVED',
    request_message TEXT NULL,
    response_message TEXT NULL,
    responded_at DATETIME NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_meeting_user (meeting_id, user_id),
    INDEX idx_meeting_status (meeting_id, status),
    INDEX idx_user_status (user_id, status),
    INDEX idx_meeting_role (meeting_id, role),
    CONSTRAINT fk_member_meeting FOREIGN KEY (meeting_id) REFERENCES MEETING (meeting_id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 7. MEETING_TAG (모임 관심사 태그)
-- ================================================
CREATE TABLE MEETING_TAG (
    tag_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    interest_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_meeting_interest (meeting_id, interest_id),
    INDEX idx_meeting_tag (meeting_id),
    INDEX idx_interest_tag (interest_id),
    CONSTRAINT fk_tag_meeting FOREIGN KEY (meeting_id) REFERENCES MEETING (meeting_id) ON DELETE CASCADE,
    CONSTRAINT fk_tag_interest FOREIGN KEY (interest_id) REFERENCES INTEREST (interest_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 8. CHAT_MESSAGE (채팅 메시지)
-- ================================================
CREATE TABLE CHAT_MESSAGE (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('TEXT', 'IMAGE', 'SYSTEM') DEFAULT 'TEXT',
    sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_meeting_sent (meeting_id, sent_at),
    CONSTRAINT fk_message_meeting FOREIGN KEY (meeting_id) REFERENCES MEETING (meeting_id) ON DELETE CASCADE,
    CONSTRAINT fk_message_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 9. REPORT (신고)
-- ================================================
CREATE TABLE REPORT (
    report_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NULL,
    reported_id BIGINT NULL,
    reported_meeting_id BIGINT NULL,
    report_type ENUM('USER', 'MEETING', 'CHAT') NOT NULL,
    reason ENUM(
        'SPAM',
        'ABUSE',
        'INAPPROPRIATE',
        'NO_SHOW',
        'OTHER'
    ) NOT NULL,
    content TEXT NOT NULL,
    status ENUM(
        'PENDING',
        'REVIEWED',
        'RESOLVED',
        'REJECTED'
    ) DEFAULT 'PENDING',
    admin_note TEXT NULL,
    resolved_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status_created (status, created_at),
    INDEX idx_reporter (reporter_id),
    INDEX idx_reported_user (reported_id),
    CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES USER (user_id) ON DELETE SET NULL,
    CONSTRAINT fk_report_reported FOREIGN KEY (reported_id) REFERENCES USER (user_id) ON DELETE SET NULL,
    CONSTRAINT fk_report_meeting FOREIGN KEY (reported_meeting_id) REFERENCES MEETING (meeting_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 10. READ_RECEIPT (읽음 처리)
-- ================================================
CREATE TABLE READ_RECEIPT (
    receipt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    meeting_id BIGINT NOT NULL,
    last_read_message_id BIGINT NULL,
    last_read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_meeting_receipt (user_id, meeting_id),
    INDEX idx_user_meeting (user_id, meeting_id),
    CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_meeting FOREIGN KEY (meeting_id) REFERENCES MEETING (meeting_id) ON DELETE CASCADE,
    CONSTRAINT fk_receipt_message FOREIGN KEY (last_read_message_id) REFERENCES CHAT_MESSAGE (message_id) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 11. NOTIFICATION (알림)
-- ================================================
CREATE TABLE NOTIFICATION (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type ENUM(
        'CHAT_MESSAGE',
        'JOIN_APPROVED',
        'JOIN_REJECTED',
        'MEMBER_JOINED'
    ) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_type ENUM('MEETING', 'CHAT') NULL,
    related_id BIGINT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    INDEX idx_user_unread_created (user_id, is_read, created_at),
    INDEX idx_expires (expires_at),
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES USER (user_id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- ================================================
-- 초기 데이터: INTEREST (관심사)
-- ================================================
INSERT INTO
    INTEREST (interest_name, category)
VALUES ('러닝', '운동'),
    ('등산', '운동'),
    ('자전거', '운동'),
    ('요가', '운동'),
    ('헬스', '운동'),
    ('수영', '운동'),
    ('테니스', '운동'),
    ('배드민턴', '운동'),
    ('축구', '운동'),
    ('농구', '운동'),
    ('맛집탐방', '음식'),
    ('카페투어', '음식'),
    ('베이킹', '음식'),
    ('요리', '음식'),
    ('와인', '음식'),
    ('영화감상', '문화'),
    ('전시회', '문화'),
    ('공연관람', '문화'),
    ('독서', '문화'),
    ('사진', '문화'),
    ('여행', '취미'),
    ('캠핑', '취미'),
    ('게임', '취미'),
    ('보드게임', '취미'),
    ('음악감상', '취미'),
    ('악기연주', '취미'),
    ('댄스', '취미'),
    ('외국어', '학습'),
    ('코딩', '학습'),
    ('재테크', '학습');