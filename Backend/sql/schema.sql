-- Create the schema
CREATE DATABASE tms_db;
USE tms_db;

-- Users table
CREATE TABLE Users (
    id CHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','project_manager','collaborator') NOT NULL,
    is_first_login BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE Tasks (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('low','medium','high') DEFAULT 'medium',
    status ENUM('todo','in_progress','completed') DEFAULT 'todo',
    due_date DATE NOT NULL,
    created_by CHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES Users(id)
);

-- TaskAssignments table (many-to-many link between Users and Tasks)
CREATE TABLE TaskAssignments (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36),
    user_id CHAR(36),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Comments table
CREATE TABLE Comments (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36),
    user_id CHAR(36),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Attachments table
CREATE TABLE Attachments (
    id CHAR(36) PRIMARY KEY,
    task_id CHAR(36),
    uploaded_by CHAR(36),
    file_name VARCHAR(255),
    file_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES Tasks(id),
    FOREIGN KEY (uploaded_by) REFERENCES Users(id)
);

-- Notifications table
CREATE TABLE Notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    message TEXT NOT NULL,
    type ENUM('assignment','status_change','comment','deadline'),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);
