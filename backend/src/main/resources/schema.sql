-- ============================================================
--  GoalFlow MySQL Schema
--  Database: goalflow_db
--  Charset:  utf8mb4 (supports emoji icons)
-- ============================================================

CREATE DATABASE IF NOT EXISTS goalflow_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE goalflow_db;

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,   -- BCrypt hash
    avatar     VARCHAR(10),             -- 2-letter initials
    level      INT          NOT NULL DEFAULT 1,
    xp         INT          NOT NULL DEFAULT 0,
    streak     INT          NOT NULL DEFAULT 0,
    join_date  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Goals ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS goals (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    title      VARCHAR(255) NOT NULL,
    category   VARCHAR(50),            -- Career, Fitness, Finance, Study, Self Care…
    icon       VARCHAR(10),            -- Emoji e.g. 💻 🏋️ 💰
    progress   INT          NOT NULL DEFAULT 0  CHECK (progress BETWEEN 0 AND 100),
    deadline   DATE,
    xp         INT          NOT NULL DEFAULT 100,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_goals_user (user_id),
    INDEX idx_goals_category (user_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
    id         BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT       NOT NULL,
    goal_id    BIGINT,                 -- nullable: tasks can be standalone
    text       VARCHAR(500) NOT NULL,
    done       BOOLEAN      NOT NULL DEFAULT FALSE,
    task_date  DATE         NOT NULL DEFAULT (CURRENT_DATE),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE SET NULL,
    INDEX idx_tasks_user       (user_id),
    INDEX idx_tasks_user_date  (user_id, task_date),
    INDEX idx_tasks_goal       (goal_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Demo seed data ────────────────────────────────────────────────────────────
-- Password for both demo accounts is: demo123
-- BCrypt hash of "demo123" (cost 10):

INSERT IGNORE INTO users (name, email, password, avatar, level, xp, streak) VALUES
('Akila Sharma', 'akila@demo.com',
 '$2a$10$TbYdZqKs5yW1KWzUkY2cWuQfjn1HTsIrdD1xPG00OiZHGM.FO2/5e', 'AS', 4, 2760, 7),
('Rahul Dev', 'rahul@demo.com',
 '$2a$10$TbYdZqKs5yW1KWzUkY2cWuQfjn1HTsIrdD1xPG00OiZHGM.FO2/5e', 'RD', 3, 1840, 3);

INSERT IGNORE INTO goals (user_id, title, category, icon, progress, deadline, xp) VALUES
(1, 'Frontend Developer Job', 'Career',    '💻', 75, '2024-08-30', 750),
(1, '6-Pack Abs Challenge',   'Fitness',   '🏋️', 45, '2024-09-15', 450),
(1, 'Save ₹50,000',           'Finance',   '💰', 60, '2024-12-31', 600),
(1, 'Read 12 Books',          'Study',     '📚', 33, '2024-12-31', 330),
(2, 'Learn React Native',     'Career',    '🧠', 55, '2024-10-10', 550),
(2, 'Morning Run 5K',         'Fitness',   '🏃', 88, '2024-12-31', 880);

INSERT IGNORE INTO tasks (user_id, goal_id, text, done) VALUES
(1, 1, 'Complete React component',    FALSE),
(1, 1, 'Apply to 3 companies',        TRUE),
(1, 2, 'Workout 45 mins',             FALSE),
(1, 3, 'Transfer ₹2000 savings',      TRUE),
(1, 4, 'Read 30 pages',               FALSE);
