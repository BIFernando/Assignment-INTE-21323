-- Create the schema
CREATE DATABASE tms_db;
USE tms_db;

-- Users table
CREATE TABLE Users (
    id            CHAR(36)        PRIMARY KEY,
    name          VARCHAR(100)    NOT NULL,
    email         VARCHAR(150)    NOT NULL UNIQUE,
    passwordHash  VARCHAR(255)    NOT NULL,
    role          ENUM('admin','project_manager','collaborator') NOT NULL DEFAULT 'collaborator',
    isFirstLogin  BOOLEAN         DEFAULT TRUE,
    isActive      BOOLEAN         DEFAULT TRUE,
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE Tasks (
    id            CHAR(36)        PRIMARY KEY,
    title         VARCHAR(200)    NOT NULL,
    description   TEXT,
    priority      ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    status        ENUM('TODO','IN_PROGRESS','COMPLETED') DEFAULT 'TODO',
    dueDate       DATE,                        -- optional, not NOT NULL
    createdById   CHAR(36),
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdById) REFERENCES Users(id)
);

-- TaskAssignments table
CREATE TABLE TaskAssignments (
    id            CHAR(36)        PRIMARY KEY,
    taskId        CHAR(36),
    userId        CHAR(36),
    assignedAt    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE Comments (
    id            CHAR(36)        PRIMARY KEY,
    taskId        CHAR(36),
    userId        CHAR(36),
    content       TEXT            NOT NULL,
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(id)
);

-- Attachments table
CREATE TABLE Attachments (
    id            CHAR(36)        PRIMARY KEY,
    taskId        CHAR(36),
    uploadedBy    CHAR(36),
    fileName      VARCHAR(255),
    fileUrl       VARCHAR(255),
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (taskId) REFERENCES Tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (uploadedBy) REFERENCES Users(id)
);

-- Notifications table
CREATE TABLE Notifications (
    id            CHAR(36)        PRIMARY KEY,
    userId        CHAR(36),
    message       TEXT            NOT NULL,
    type          ENUM('ASSIGNMENT','STATUS_CHANGE','COMMENT','DEADLINE'),
    isRead        BOOLEAN         DEFAULT FALSE,
    createdAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updatedAt     TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);