-- ============================================================
-- Task Management System Database Schema
-- Database: tms
-- Database System: MySQL 8.0+
-- Convention: camelCase columns, INT AUTO_INCREMENT IDs
-- ============================================================

CREATE DATABASE IF NOT EXISTS tms_db;
USE tms_db;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE User (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    passwordHash  VARCHAR(255)  NOT NULL,
    role          ENUM('admin','project_manager','collaborator') NULL DEFAULT NULL,
    isActive      BOOLEAN       DEFAULT TRUE,
    isFirstLogin  BOOLEAN       DEFAULT TRUE,
    inviteToken   VARCHAR(255)  NULL,
    inviteExpiry  DATETIME      NULL,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Projects ─────────────────────────────────────────────────
CREATE TABLE Project (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(200)  NOT NULL,
    description   TEXT,
    createdById   INT           NOT NULL,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (createdById) REFERENCES User(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Project Members ──────────────────────────────────────────
CREATE TABLE ProjectMember (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    projectId     INT           NOT NULL,
    userId        INT           NOT NULL,
    role          ENUM('admin','project_manager','collaborator') NOT NULL DEFAULT 'collaborator',
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (projectId) REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (userId)    REFERENCES User(id)    ON DELETE CASCADE,
    UNIQUE KEY uniqueMember (projectId, userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Tasks ────────────────────────────────────────────────────
CREATE TABLE Task (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(255)  NOT NULL,
    description   LONGTEXT,
    projectId     INT           NULL,
    assignedTo    INT           NULL,
    createdBy     INT           NOT NULL,
    status        ENUM('TODO','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'TODO',
    priority      ENUM('LOW','MEDIUM','HIGH')            NOT NULL DEFAULT 'MEDIUM',
    dueDate       DATE          NULL,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (projectId)  REFERENCES Project(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES User(id)    ON DELETE SET NULL,
    FOREIGN KEY (createdBy)  REFERENCES User(id)    ON DELETE CASCADE,

    INDEX idx_assignedTo (assignedTo),
    INDEX idx_createdBy  (createdBy),
    INDEX idx_status     (status),
    INDEX idx_priority   (priority),
    INDEX idx_dueDate    (dueDate),
    INDEX idx_projectId  (projectId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Task Assignments ─────────────────────────────────────────
CREATE TABLE TaskAssignment (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    taskId        INT           NOT NULL,
    userId        INT           NOT NULL,
    assignedAt    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    UNIQUE KEY uniqueAssignment (taskId, userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Comments ─────────────────────────────────────────────────
CREATE TABLE Comment (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    taskId        INT           NOT NULL,
    userId        INT           NOT NULL,
    content       LONGTEXT      NOT NULL,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (taskId) REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,

    INDEX idx_taskId (taskId),
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Attachments ──────────────────────────────────────────────
CREATE TABLE Attachment (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    taskId        INT           NOT NULL,
    uploadedBy    INT           NOT NULL,
    fileName      VARCHAR(255)  NOT NULL,
    fileUrl       VARCHAR(500)  NOT NULL,
    createdAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (taskId)     REFERENCES Task(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES User(id) ON DELETE CASCADE,

    INDEX idx_taskId     (taskId),
    INDEX idx_uploadedBy (uploadedBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Notifications ────────────────────────────────────────────
CREATE TABLE Notification (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    userId          INT           NOT NULL,
    type            ENUM('ASSIGNMENT','STATUS_CHANGE','COMMENT','DEADLINE') NOT NULL,
    message         LONGTEXT      NOT NULL,
    relatedTaskId   INT           NULL,
    isRead          BOOLEAN       DEFAULT FALSE,
    createdAt       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (userId)        REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (relatedTaskId) REFERENCES Task(id) ON DELETE SET NULL,

    INDEX idx_userId    (userId),
    INDEX idx_isRead    (isRead),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
