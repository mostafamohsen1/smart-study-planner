USE SmartStudyPlanner;
GO

-- Stored procedure to register a new user
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_RegisterUser')
    DROP PROCEDURE sp_RegisterUser;
GO

CREATE PROCEDURE sp_RegisterUser
    @Email NVARCHAR(100),
    @Password NVARCHAR(255),
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
    BEGIN
        THROW 50001, 'Email already exists', 1;
        RETURN;
    END
    
    -- Insert the new user
    INSERT INTO Users (Email, Password, FirstName, LastName)
    VALUES (@Email, @Password, @FirstName, @LastName);
    
    -- Return the new user details
    SELECT UserID, Email, FirstName, LastName, CreatedAt 
    FROM Users 
    WHERE UserID = SCOPE_IDENTITY();
END
GO

-- Stored procedure to authenticate a user
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_AuthenticateUser')
    DROP PROCEDURE sp_AuthenticateUser;
GO

CREATE PROCEDURE sp_AuthenticateUser
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get user details for authentication
    SELECT UserID, Email, Password, FirstName, LastName 
    FROM Users 
    WHERE Email = @Email;
END
GO

-- Stored procedure to get user by ID
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetUserById')
    DROP PROCEDURE sp_GetUserById;
GO

CREATE PROCEDURE sp_GetUserById
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get user details except password
    SELECT UserID, Email, FirstName, LastName, CreatedAt 
    FROM Users 
    WHERE UserID = @UserID;
END
GO

-- Stored procedure to save refresh token
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_SaveRefreshToken')
    DROP PROCEDURE sp_SaveRefreshToken;
GO

CREATE PROCEDURE sp_SaveRefreshToken
    @UserID INT,
    @RefreshToken NVARCHAR(255),
    @Expires DATETIME,
    @CreatedByIp NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO UserTokens (UserID, RefreshToken, Expires, CreatedByIp)
    VALUES (@UserID, @RefreshToken, @Expires, @CreatedByIp);
    
    -- Return the token ID
    SELECT SCOPE_IDENTITY() AS TokenID;
END
GO

-- Stored procedure to verify refresh token
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_VerifyRefreshToken')
    DROP PROCEDURE sp_VerifyRefreshToken;
GO

CREATE PROCEDURE sp_VerifyRefreshToken
    @RefreshToken NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT t.TokenID, t.UserID, t.RefreshToken, t.Expires, t.IsActive, t.IsExpired,
           u.Email, u.FirstName, u.LastName
    FROM UserTokens t
    JOIN Users u ON t.UserID = u.UserID
    WHERE t.RefreshToken = @RefreshToken;
END
GO

-- Stored procedure to revoke refresh token
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_RevokeRefreshToken')
    DROP PROCEDURE sp_RevokeRefreshToken;
GO

CREATE PROCEDURE sp_RevokeRefreshToken
    @RefreshToken NVARCHAR(255),
    @RevokedByIp NVARCHAR(50) = NULL,
    @ReplacedByToken NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE UserTokens
    SET Revoked = GETDATE(),
        RevokedByIp = @RevokedByIp,
        ReplacedByToken = @ReplacedByToken
    WHERE RefreshToken = @RefreshToken
    AND Revoked IS NULL;
    
    -- Return 1 if successful
    SELECT @@ROWCOUNT AS Success;
END
GO

-- Stored procedure to log login attempts
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_LogLoginAttempt')
    DROP PROCEDURE sp_LogLoginAttempt;
GO

CREATE PROCEDURE sp_LogLoginAttempt
    @Email NVARCHAR(100),
    @IP NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(255) = NULL,
    @Successful BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO LoginAttempts (Email, IP, UserAgent, Successful)
    VALUES (@Email, @IP, @UserAgent, @Successful);
END
GO 