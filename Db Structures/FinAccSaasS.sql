
USE FinAccSaaS
GO

CREATE FUNCTION IntToDate(@IntDate INT)
RETURNS DATE
AS
BEGIN	
	RETURN  CAST (SUBSTRING(CAST(@IntDate AS VARCHAR),1,4)  + '-' + SUBSTRING(CAST(@IntDate AS VARCHAR),5,2) + '-' +  SUBSTRING(CAST(@IntDate AS VARCHAR),7,2) AS DATE)
END
GO

CREATE FUNCTION DateToInt(@DateInt DATE)
RETURNS INT
AS
BEGIN	
	RETURN  CAST(
            CAST(YEAR(@DateInt) AS VARCHAR) +
            CASE WHEN LEN(CAST(MONTH(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(MONTH(@DateInt) AS VARCHAR) ELSE CAST(MONTH(@DateInt) AS VARCHAR) END  +
            CASE WHEN LEN(CAST(DAY(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(DAY(@DateInt) AS VARCHAR) ELSE CAST(DAY(@DateInt) AS VARCHAR) END
          AS INT)
END
GO



CREATE TABLE Registered_Clients
(
  ClientSno INT PRIMARY KEY IDENTITY(1,1),
  Client_Code VARCHAR(20),
  Client_Name VARCHAR(50),
  Address VARCHAR(50),
  State VARCHAR(50),
  Mobile VARCHAR(20),
  Alternate_Mobile VARCHAR(20),
  Email VARCHAR(50),
  Contact_Person VARCHAR(50),
  Creation_Date INT,
  Subscription_Start INT,
  Subscription_End INT,
  App_Login VARCHAR(20),
  App_Pwd VARCHAR(20),
  Db_Name VARCHAR(20),
  Status TINYINT
)
GO

CREATE PROCEDURE Sp_Registered_Clients
	@ClientSno INT,
  @Client_Code VARCHAR(20),
  @Client_Name VARCHAR(50),
  @Address VARCHAR(50),
  @State VARCHAR(50),
  @Mobile VARCHAR(20),
  @Alternate_Mobile VARCHAR(20),
  @Email VARCHAR(50),
  @Contact_Person VARCHAR(50),
  @Creation_Date INT,
  @Subscription_Start INT,
  @Subscription_End INT,
  @App_Login VARCHAR(20),
  @App_Pwd VARCHAR(20),
  @Db_Name VARCHAR(20),
  @Status TINYINT,
  @RetSno	INT OUTPUT,
  @RetClient_Code VARCHAR(20) OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT ClientSno FROM Registered_Clients WHERE ClientSno=@ClientSno)
			BEGIN
				UPDATE Registered_Clients SET Client_Name=@Client_Name, Address=@Address, State=@State, Mobile=@Mobile, Alternate_Mobile=@Alternate_Mobile, Email=@Email, Contact_Person=@Contact_Person, 
                                      Subscription_Start=@Subscription_Start, Subscription_End=@Subscription_End, App_Login=@App_Login, App_Pwd=@App_Pwd,Status=@Status
				WHERE                         ClientSno=@ClientSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        IF EXISTS(SELECT ClientSno FROM Registered_Clients WHERE  Mobile=@Mobile)
          BEGIN
              Raiserror ('Mobile Number already exists', 16, 1) 
              GOTO CloseNow
          END
        IF EXISTS(SELECT ClientSno FROM Registered_Clients WHERE  Email=@Email)
          BEGIN
              Raiserror ('Email Id already exists', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Registered_Clients(Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date,Subscription_Start, Subscription_End, App_Login, App_Pwd,Db_Name, Status)
        VALUES ( @Client_Name, @Address, @State, @Mobile, @Alternate_Mobile, @Email, @Contact_Person, [dbo].DateToInt(GETDATE()) ,[dbo].DateToInt(GETDATE()), [dbo].DateToInt(DATEADD(YEAR,1,GETDATE())), @App_Login, @App_Pwd, @Db_Name,@Status)
				IF @@ERROR <> 0 GOTO CloseNow								
				SET @ClientSno = @@IDENTITY

        SET @Client_Code = CAST( DAY(GETDATE()) AS VARCHAR) + CAST( MONTH(GETDATE()) AS VARCHAR) + CAST( YEAR(GETDATE()) AS VARCHAR) + CAST(@ClientSno AS VARCHAR)
        UPDATE Registered_Clients SET Client_Code=@Client_Code, DB_Name='Fin_'+ @Client_Code WHERE ClientSno=@ClientSno
        IF @@ERROR <> 0 GOTO CloseNow
        
			END	
  SET @RetClient_Code = @Client_Code
	SET @RetSno = @ClientSno
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO

CREATE FUNCTION Udf_getRegistered_Clients(@ClientSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*
	FROM	  Registered_Clients
	WHERE	  (ClientSno=@ClientSno OR @ClientSno = 0) 

GO

