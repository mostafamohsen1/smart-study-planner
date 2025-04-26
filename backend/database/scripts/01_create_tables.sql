-- Create the SmartStudyPlanner database if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SmartStudyPlanner')
BEGIN
    CREATE DATABASE SmartStudyPlanner;
END
GO

USE SmartStudyPlanner;
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserID INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END
GO

-- Create Courses table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Courses')
BEGIN
    CREATE TABLE Courses (
        CourseID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(500),
        Deadline DATETIME,
        Difficulty TINYINT NOT NULL CHECK (Difficulty BETWEEN 1 AND 3),
        Progress TINYINT DEFAULT 0 CHECK (Progress BETWEEN 0 AND 100),
        HoursAvailable INT,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
END
GO

-- Create Topics table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Topics')
BEGIN
    CREATE TABLE Topics (
        TopicID INT IDENTITY(1,1) PRIMARY KEY,
        CourseID INT NOT NULL,
        Name NVARCHAR(100) NOT NULL,
        IsCompleted BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE
    );
END
GO

-- Create StudySessions table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StudySessions')
BEGIN
    CREATE TABLE StudySessions (
        SessionID INT IDENTITY(1,1) PRIMARY KEY,
        CourseID INT NOT NULL,
        UserID INT NOT NULL,
        StartDate DATETIME NOT NULL,
        EndDate DATETIME NOT NULL,
        TopicID INT,
        Name NVARCHAR(100),
        IsCompleted BIT DEFAULT 0,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (CourseID) REFERENCES Courses(CourseID) ON DELETE CASCADE,
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        FOREIGN KEY (TopicID) REFERENCES Topics(TopicID) ON DELETE SET NULL
    );
END
GO

-- Create UserTokens table for managing refresh tokens
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserTokens')
BEGIN
    CREATE TABLE UserTokens (
        TokenID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT NOT NULL,
        RefreshToken NVARCHAR(255) NOT NULL,
        Expires DATETIME NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        CreatedByIp NVARCHAR(50),
        Revoked DATETIME,
        RevokedByIp NVARCHAR(50),
        ReplacedByToken NVARCHAR(255),
        IsExpired AS (CASE WHEN GETDATE() >= Expires THEN 1 ELSE 0 END),
        IsActive AS (CASE WHEN Revoked IS NULL AND GETDATE() < Expires THEN 1 ELSE 0 END),
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
END
GO

-- Create Login/Failed Login Attempts table for security monitoring
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LoginAttempts')
BEGIN
    CREATE TABLE LoginAttempts (
        AttemptID INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL,
        IP NVARCHAR(50),
        UserAgent NVARCHAR(255),
        Successful BIT NOT NULL,
        AttemptTime DATETIME DEFAULT GETDATE()
    );
END
GO 