
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='PreFillString') BEGIN DROP FUNCTION PreFillString END
GO
CREATE FUNCTION [dbo].[PreFillString](@Input INT,@Digit INT)
  RETURNS VARCHAR(20)
WITH ENCRYPTION
AS
  BEGIN
    DECLARE @Result VARCHAR(20)
    If Len(@Input)< @Digit
      SET @Result =  Right('000000000' + Cast( @Input AS VARCHAR ), @Digit )
    ELSE
      SET @Result = @Input
    RETURN @Result
  END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='SDateDiff') BEGIN DROP FUNCTION SDateDiff END
GO

CREATE FUNCTION [dbo].SDateDiff(@FromDate DATETIME,@ToDate DATETIME)
  RETURNS @Det TABLE(Months INTEGER,Days INTEGER)
  WITH ENCRYPTION AS

BEGIN
    --DECLARE @FromDate DATETIME	= [dbo].IntToDate(@FDate)
    --DECLARE @ToDate DATETIME	=  [dbo].IntToDate(@TDate)
    DECLARE @Fday           INTEGER
    DECLARE @Tday           INTEGER
    DECLARE @MonthsDiff     INTEGER
    DECLARE @DaysDiff       INTEGER
    SET @FDay   =   DAY(@FromDate)
    SET @TDay   =   DAY(@ToDate)    
    IF @FDay > @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1)
            SET @DaysDiff   = DAY(@ToDate-DAY(@Todate)) - @FDay + @TDay
        END
    ELSE IF @FDay < @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1) +1
            SET @DaysDiff   = @TDay - @FDay
        END
    ELSE IF @FDay = @TDay
        BEGIN
            SET @MonthsDiff = DATEDIFF(MONTH,@Fromdate,@ToDate-DAY(@Todate)-1) +1
            SET @DaysDiff   = 0
        END
    INSERT INTO @Det VALUES(@MonthsDiff,@DaysDiff)
    RETURN
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='GenerateVoucherNo') BEGIN DROP FUNCTION GenerateVoucherNo END
GO

CREATE FUNCTION [dbo].[GenerateVoucherNo](@SeriesSno INT)
        RETURNS VARCHAR(20)
        WITH ENCRYPTION AS 
        BEGIN
         DECLARE @NewValue   VARCHAR(20)
         DECLARE @Prefix     VARCHAR(4)
         DECLARE @Suffix     VARCHAR(4)
         DECLARE @Width      TINYINT
         DECLARE @Prefill    VARCHAR
         DECLARE @Start_No   Numeric
         DECLARE @Current_No Numeric
         
         SELECT  @Prefix=Prefix,@Suffix=Suffix,@Width=Width,@Prefill=Prefill,@Start_No=Start_No,@Current_No=Current_No
         FROM    Voucher_Series
         WHERE   SeriesSno=@SeriesSno

         If @Current_No = 0 
            BEGIN
                SET @Current_No=@Start_No
            END
          ELSE
            BEGIN
                SET @Current_No=@Current_No+1
            END

             SET @NewValue = @Current_No
             SET @NewValue = RTrim(@Prefix) + Rtrim(@Newvalue) + RTrim(@Suffix)
              IF @Width <> 0
                 BEGIN
                     SET @NewValue = RTrim(@Prefix) + Right('000000000000000000' + Cast(@Current_No AS VARCHAR),@Width)
                     SET @NewValue=  Rtrim(@Newvalue) + RTrim(@Suffix)
                 END
              RETURN  @NewValue
        END
  GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Companies') BEGIN DROP PROCEDURE Sp_Companies END
GO
  
  CREATE PROCEDURE Sp_Companies
	@CompSno INT,
	@ClientSno INT,
	@Comp_Code VARCHAR(20),
	@Comp_Name VARCHAR(50),
	@Fin_From INT,
	@Fin_To INT,
	@Books_From INT,
	@Address1 VARCHAR(50),
	@Address2 VARCHAR(50),
	@Address3 VARCHAR(50),
	@City VARCHAR(50),
	@State VARCHAR(50),
	@Pincode VARCHAR(10),
	@Email VARCHAR(50),
	@Phone VARCHAR(20),
	@License_No VARCHAR(50),
	@Hide_Status TINYINT,
	@App_Version INT,
	@Db_Version INT,
	@Status BIT,	
	@CommMasters BIT,
  @RetSno	INT OUTPUT  

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT CompSno FROM Companies WHERE CompSno=@CompSno)
			BEGIN
				UPDATE Companies SET  ClientSno = @ClientSno , Comp_Code = @Comp_Code ,Comp_Name = @Comp_Name ,Fin_From = @Fin_From ,Fin_To = @Fin_To ,Books_From = @Books_From ,Address1 = @Address1 ,Address2 = @Address2 ,
	                            Address3 = @Address3 ,City = @City ,State = @State ,Pincode = @Pincode ,Email = @Email ,Phone = @Phone ,License_No = @License_No ,Hide_Status = @Hide_Status ,App_Version = @App_Version,
	                            Db_Version = @Db_Version ,	Status = @Status ,CommMasters = @CommMasters 
				WHERE                 CompSno=@CompSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        INSERT INTO Companies (ClientSno , Comp_Code ,Comp_Name ,Fin_From ,Fin_To ,Books_From ,Address1 ,Address2 ,Address3 ,City ,State ,Pincode ,Email ,Phone ,License_No ,Hide_Status ,App_Version ,
	                              Db_Version ,	Status ,	CommMasters )
        VALUES                (@ClientSno , @Comp_Code ,@Comp_Name ,@Fin_From ,@Fin_To ,@Books_From ,@Address1 ,@Address2 ,@Address3 ,@City ,@State ,@Pincode ,@Email ,@Phone ,@License_No ,@Hide_Status ,
                                @App_Version ,@Db_Version ,	@Status ,@CommMasters)					
				SET @CompSno = @@IDENTITY
        IF @@ERROR <> 0 GOTO CloseNow							

        SET @Comp_Code = 'COMP'+CAST( DAY(GETDATE()) AS VARCHAR) + CAST( MONTH(GETDATE()) AS VARCHAR) + CAST( YEAR(GETDATE()) AS VARCHAR) + CAST(@CompSno AS VARCHAR)
        UPDATE Companies SET Comp_Code=@Comp_Code WHERE CompSno=@CompSno
        IF @@ERROR <> 0 GOTO CloseNow
        
        EXEC Sp_InsertDefaults @CompSno
        
			END	  
	SET @RetSno = @CompSno
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getCompanies') BEGIN DROP FUNCTION Udf_getCompanies END
GO

CREATE FUNCTION Udf_getCompanies(@CompSno INT, @ClientSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN  
  SELECT	Comp.*
	FROM	  Companies Comp
	WHERE	  (Comp.CompSno=@CompSno OR @CompSno= 0) AND (Comp.ClientSno=@ClientSno)

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Company_Delete') BEGIN DROP PROCEDURE Sp_Company_Delete END
GO

CREATE PROCEDURE Sp_Company_Delete
	@CompSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			DELETE FROM Companies WHERE CompSno=@CompSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetCompList') BEGIN DROP FUNCTION Udf_GetCompList END
GO

CREATE FUNCTION Udf_GetCompList(@CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

SELECT  CompSno
FROM    Companies 
WHERE   (CommMasters = CASE WHEN ((SELECT CommMasters FROM Companies WHERE CompSno=@CompSno)=1) THEN 1 ELSE 0 END)
        AND
        (CompSno = CASE WHEN (SELECT CommMasters FROM Companies WHERE CompSno=@CompSno)=0 THEN @CompSno ELSE 0 END)
          
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_User') BEGIN DROP PROCEDURE Sp_User END
GO

CREATE PROCEDURE Sp_User
	@UserSno INT,
  @UserName VARCHAR(10),
  @Password VARCHAR(20),
  @User_Type VARCHAR(50),
  @Active_Status BIT,
  @UserRightsXml XML,
  @CompRightsXml XML,
  @BranchRightsXml XML,
  @Profile_Image VARCHAR(200),
  @Image_Name VARCHAR(50),
  @Enable_WorkingHours BIT,
  @FromTime VARCHAR(10),
  @ToTime VARCHAR(10),
  @Ip_Restrict VARCHAR(20),
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    /*IF @UserSno = 1
      BEGIN
        Raiserror ('Admin User cannot be altered', 16, 1) 
        GOTO CloseNow
      END */

		IF EXISTS(SELECT UserSno FROM Users WHERE UserSno=@UserSno)
			BEGIN
				UPDATE Users SET  Password=@Password, User_Type=@User_Type,Active_Status=@Active_Status, Profile_Image=@Profile_Image, Image_Name=@Image_Name,
                          Enable_WorkingHours=@Enable_WorkingHours, FromTime=@FromTime, ToTime=@ToTime, Ip_Restrict=@Ip_Restrict
				WHERE UserSno=@UserSno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Comp_Rights WHERE UserSno = @UserSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Branch_Rights WHERE UserSno = @UserSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM User_Rights WHERE UserSno = @UserSno
        IF @@ERROR <> 0 GOTO CloseNow
			END

		ELSE
			BEGIN          
        IF EXISTS(SELECT UserSno FROM Users WHERE UserName=@UserName)
          BEGIN
              Raiserror ('User exists with this Name', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Users(UserName, Password, User_Type,Active_Status,Profile_Image,Image_Name,Enable_WorkingHours,FromTime,ToTime,Ip_Restrict)
        VALUES           (@UserName, @Password, @User_Type,@Active_Status,@Profile_Image,@Image_Name,@Enable_WorkingHours,@FromTime,@ToTime,@Ip_Restrict)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @UserSno = @@IDENTITY
			END

      IF @UserRightsXml IS NOT NULL
        BEGIN
      --INSERTING INTO USER RIGHT TABLE
             DECLARE @idoc       INT
             DECLARE @Sno        INT
             DECLARE @doc        XML
             DECLARE @FormSno    FLOAT
             DECLARE @View_Right     BIT
             DECLARE @Edit_Right     BIT
             DECLARE @Print_Right    BIT
             DECLARE @Delete_Right   BIT
             DECLARE @Create_Right   BIT
             DECLARE @Report_Right   BIT
             DECLARE @Date_Access    BIT
             DECLARE @Search_Access  BIT
        
        /*Declaring temporary table for User Rights*/
              DECLARE @RightsTable TABLE
                 (
                     Sno INT IDENTITY(1,1), FormSno INT, View_Right BIT,
                     Edit_Right BIT,Delete_Right BIT,Create_Right BIT,Print_Right BIT,Report_Right BIT,Date_Access BIT, Search_Access BIT
                 )
        
              SET @doc=@UserRightsXml
              EXEC Sp_Xml_Preparedocument @idoc Output, @doc
        
        /*Inserting into Temp User Rights Table FROM passed XML File*/
              INSERT INTO @RightsTable
                 (
                 FormSno,View_Right,Edit_Right,Print_Right,Delete_Right,Create_Right,Report_Right,Date_Access,Search_Access
                 )
              SELECT  * FROM  OpenXml 
                 (
                 @idoc, '/ROOT/Users/User_Rights',2
                 )
                     WITH 
                 (
                 FormSno INT '@FormSno',View_Right BIT '@VR',Edit_Right BIT '@ER',Print_Right BIT '@PR',Delete_Right BIT '@DR',Create_Right BIT '@CR',Report_Right BIT '@RR',Date_Access BIT '@DA',Search_Access BIT '@SA'
                 )
              SELECT Top 1   @Sno=Sno,@FormSno=FormSno,@View_Right=View_Right,
                         @Edit_Right=Edit_Right,@Delete_Right=Delete_Right,@Create_Right=Create_Right,
                         @Print_Right=Print_Right,@Report_Right=Report_Right,@Date_Access=Date_Access,@Search_Access=Search_Access
              FROM       @RightsTable
        
        /*Inserting into User Rights table FROM Temp Table*/
              While @@RowCount <> 0 
                  BEGIN
                      INSERT into User_Rights(UserSno,FormSno,View_Right,Edit_Right,Print_Right,Delete_Right,Create_Right,Report_Right,Date_Access,Search_Access) 
                      Values(@UserSno,@FormSno,@View_Right,@Edit_Right,@Print_Right,@Delete_Right,@Create_Right,@Report_Right,@Date_Access,@Search_Access)
                      If @@Error <> 0 Goto CloseNow
                      DELETE From @RightsTable WHERE Sno = @Sno
              SELECT Top 1   @Sno=Sno,@FormSno=FormSno,@View_Right=View_Right,
                         @Edit_Right=Edit_Right,@Delete_Right=Delete_Right,@Create_Right=Create_Right,
                         @Print_Right=Print_Right,@Report_Right=Report_Right,@Date_Access=Date_Access,@Search_Access=Search_Access
              From       @RightsTable
                  END
        
              Exec Sp_Xml_Removedocument @idoc
          END
          
      IF @CompRightsXml IS NOT NULL
        BEGIN
      --INSERTING INTO USER RIGHT TABLE
             
             DECLARE @CompSno    FLOAT
             DECLARE @Comp_Right     BIT
                     
        /*Declaring temporary table for User Rights*/
              DECLARE @CompRightsTable TABLE
                 (
                     Sno INT IDENTITY(1,1), CompSno INT, Comp_Right BIT                     
                 )
        
              SET @doc=@CompRightsXml
              EXEC Sp_Xml_Preparedocument @idoc Output, @doc
        
        /*Inserting into Temp User Rights Table FROM passed XML File*/
              INSERT INTO @CompRightsTable
                 (
                 CompSno,Comp_Right
                 )
              SELECT  * FROM  OpenXml 
                 (
                 @idoc, '/ROOT/Companies/Comp_Rights',2
                 )
                     WITH 
                 (
                 CompSno INT '@CompSno', Comp_Right BIT '@Comp_Right'
                 )
              SELECT Top 1   @Sno=Sno,@CompSno=CompSno,@Comp_Right=Comp_Right                         
              FROM           @CompRightsTable
        
        /*Inserting into User Rights table FROM Temp Table*/
              While @@RowCount <> 0 
                  BEGIN
                      INSERT into Comp_Rights(UserSno,CompSno,Comp_Right) 
                      Values(@UserSno,@CompSno,@Comp_Right)

                      If @@Error <> 0 Goto CloseNow
                      DELETE From @CompRightsTable WHERE Sno = @Sno

                      SELECT Top 1   @Sno=Sno,@CompSno=CompSno,@Comp_Right=Comp_Right                         
                      FROM           @CompRightsTable
                  END
        
              Exec Sp_Xml_Removedocument @idoc
          END

      IF @BranchRightsXml IS NOT NULL
        BEGIN
      --INSERTING INTO USER RIGHT TABLE
             
             DECLARE @BranchSno    FLOAT
             DECLARE @Branch_Right     BIT
                     
        /*Declaring temporary table for User Rights*/
              DECLARE @BranchRightsTable TABLE
                 (
                     Sno INT IDENTITY(1,1), BranchSno INT, Branch_Right BIT                     
                 )
        
              SET @doc=@BranchRightsXml
              EXEC Sp_Xml_Preparedocument @idoc Output, @doc
        
        /*Inserting into Temp User Rights Table FROM passed XML File*/
              INSERT INTO @BranchRightsTable
                 (
                 BranchSno,Branch_Right
                 )
              SELECT  * FROM  OpenXml 
                 (
                 @idoc, '/ROOT/Branches/Branch_Rights',2
                 )
                     WITH 
                 (
                 BranchSno INT '@BranchSno', Branch_Right BIT '@Branch_Right'
                 )
              SELECT Top 1   @Sno=Sno,@BranchSno=BranchSno,@Branch_Right=Branch_Right                         
              FROM           @BranchRightsTable
        
        /*Inserting into User Rights table FROM Temp Table*/
              While @@RowCount <> 0 
                  BEGIN                  
                      INSERT into Branch_Rights(UserSno,BranchSno,Branch_Right) 
                      Values(@UserSno,@BranchSno,@Branch_Right)

                      If @@Error <> 0 Goto CloseNow
                      DELETE From @BranchRightsTable WHERE Sno = @Sno

                      SELECT Top 1   @Sno=Sno,@BranchSno=BranchSno,@Branch_Right=Branch_Right                         
                      FROM           @BranchRightsTable
                  END
        
              Exec Sp_Xml_Removedocument @idoc
          END


      SET @RetSno = @UserSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getUsers') BEGIN DROP FUNCTION Udf_getUsers END
GO

CREATE FUNCTION Udf_getUsers(@UserSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT    Usr.*,            
            ISNULL((SELECT * FROM User_Rights WHERE UserSno = Usr.UserSno FOR JSON PATH),'') as Rights_Json,
            ISNULL((SELECT Cr.*, Comp.Comp_Name FROM Comp_Rights Cr INNER JOIN Companies Comp ON Comp.CompSno=Cr.CompSno WHERE Cr.UserSno = Usr.UserSno FOR JSON PATH),'') as Comp_Rights_Json,
            ISNULL((SELECT Br.*, Brh.Branch_Name FROM Branch_Rights Br INNER JOIN Branches Brh ON Brh.BranchSno=Br.BranchSno WHERE Br.UserSno = Usr.UserSno FOR JSON PATH),'') as Branch_Rights_Json
            
  FROM      Users  Usr            
  WHERE     (Usr.UserSno=@UserSno OR @UserSno=0) 

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_User_Delete') BEGIN DROP PROCEDURE Sp_User_Delete END
GO
CREATE PROCEDURE Sp_User_Delete
	@UserSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF @UserSno = 1
      BEGIN
      Raiserror ('You cannot delete a Admin User', 16, 1) 
					GOTO CloseNow
      END

			IF EXISTS (SELECT UserSno FROM Transactions WHERE UserSno=@UserSno)
				BEGIN
					Raiserror ('Transactions exists with this User', 16, 1) 
					GOTO CloseNow
				END 

			DELETE FROM Users WHERE UserSno=@UserSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_ValidateUser') BEGIN DROP PROCEDURE Sp_ValidateUser END
GO
CREATE PROCEDURE Sp_ValidateUser
  @UserName   VARCHAR(20),
  @Password   VARCHAR(20),
  @LocalIp    VARCHAR(20)

WITH ENCRYPTION AS
BEGIN
	
	DECLARE @UserSno INT = 0
	DECLARE @ErrMsg VARCHAR(50) = ''
	IF NOT EXISTS(SELECT UserSno FROM Users WHERE UserName=@UserName AND Password=@Password)		
		BEGIN		
			SET @ErrMsg = 'No such User exists'
			GOTO CloseNow
		END
	ELSE
		BEGIN
			SELECT @UserSno=UserSno FROM Users WHERE UserName=@UserName AND Password=@Password
		END 

  IF @UserSno=1
    BEGIN
      GOTO endResult
    END

	IF (SELECT Active_Status FROM Users WHERE UserSno=@UserSno)=0
		BEGIN			
			SET @ErrMsg = 'User is disabled'
			GOTO CloseNow
		END
       

    DECLARE @Ip_Restrict VARCHAR(20)
    SELECT @Ip_Restrict=ISNULL(Ip_Restrict,'') FROM Users WHERE UserSno=@UserSno
    IF (ISNULL(@Ip_Restrict,'') <> '')  AND (@Ip_Restrict <> @LocalIP)
      BEGIN
        	SET @ErrMsg = 'Your are not authorized from this Location.'			
					GOTO CloseNow
      END

	IF (SELECT Enable_WorkingHours FROM Users WHERE UserSno=@UserSno)=1
		BEGIN			
			DECLARE @FromTime	DATETIME 
			DECLARE @ToTime		DATETIME
			SELECT @FromTime = FORMAT(CAST(FromTime AS DATETIME), 'HH:mm') , @ToTime = FORMAT(CAST(ToTime AS datetime), 'HH:mm') FROM Users WHERE UserSno=@UserSno
			IF (FORMAT(GETDATE(), 'HH:mm') < @FromTime) OR (FORMAT(GETDATE(), 'HH:mm') > @ToTime)
				BEGIN
					SET @ErrMsg = 'Your Working hours are over.'			
					GOTO CloseNow
				END			
		END

  endResult:
	  SELECT		1 as Status, Usr.*,            
				      ISNULL((SELECT * FROM User_Rights WHERE UserSno = Usr.UserSno FOR JSON PATH),'') as Rights_Json                                      
	  FROM		  Users  Usr
    WHERE     (UserName=@UserName AND Password=@Password) AND Active_Status=1

	  RETURN 1
	CloseNow:
	  Raiserror (@ErrMsg, 16, 1) 

END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transaction_Setup') BEGIN DROP PROCEDURE Sp_Transaction_Setup END
GO

CREATE PROCEDURE Sp_Transaction_Setup
	@SetupSno             INT,
  @CompSno              INT,
  @BranchSno            INT,
  @AreaCode_AutoGen     BIT,
  @AreaCode_Prefix      CHAR(4),
  @AreaCode_CurrentNo   INT,

  @PartyCode_AutoGen    BIT,
  @PartyCode_Prefix     CHAR(4),
  @PartyCode_CurrentNo  INT,

  @SuppCode_AutoGen     BIT,
  @SuppCode_Prefix      CHAR(4),
  @SuppCode_CurrentNo   INT,

  @BwrCode_AutoGen      BIT,
  @BwrCode_Prefix       CHAR(4),
  @BwrCode_CurrentNo    INT,


  @GrpCode_AutoGen     BIT,
  @GrpCode_Prefix      CHAR(4),
  @GrpCode_CurrentNo    INT,

  @ItemCode_AutoGen    BIT,
  @ItemCode_Prefix     CHAR(4),
  @ItemCode_CurrentNo   INT,

  @SchemeCode_AutoGen  BIT,
  @SchemeCode_Prefix   CHAR(4),
  @SchemeCode_CurrentNo INT,

  @LocCode_AutoGen     BIT,
  @LocCode_Prefix      CHAR(4),
  @LocCode_CurrentNo    INT,

  @PurityCode_AutoGen  BIT,
  @PurityCode_Prefix   CHAR(4),
  @PurityCode_CurrentNo INT,

  @BranchCode_AutoGen  BIT,
  @BranchCode_Prefix   CHAR(4),
  @BranchCode_CurrentNo INT,

  @AgentCode_AutoGen  BIT,
  @AgentCode_Prefix   CHAR(4),
  @AgentCode_CurrentNo INT,


  @Enable_Opening      BIT,
  @Enable_RegLang      BIT,
  @Reg_FontName        VARCHAR(20),
  @Reg_FontSize        TINYINT,

  @Enable_FingerPrint  BIT,
  @MakeFp_Mandatory    BIT,

  @Allow_NullInterest  BIT,
  @Show_CashBalance    BIT,
  @Images_Mandatory    BIT,
  @Enable_ReturnImage  BIT,
  @Allow_DuplicateItems  BIT,
  @Disable_AddLess       BIT,
  @Entries_LockedUpto    INT,
  @Enable_Authentication BIT,
  @Enable_OldEntries     BIT,
  @IntCalcinDays          BIT,
  @MobileNumberMandatory BIT,
  @Enable_AutoApproval BIT,
  @Lock_PreviousDate BIT,
  @Enable_EmptyWt BIT

  
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		
			BEGIN
				UPDATE Transaction_Setup SET  BranchSno=@BranchSno,AreaCode_AutoGen = @AreaCode_AutoGen, AreaCode_Prefix = @AreaCode_Prefix, AreaCode_CurrentNo = @AreaCode_CurrentNo,
                                      PartyCode_AutoGen = @PartyCode_AutoGen, PartyCode_Prefix = @PartyCode_Prefix, PartyCode_CurrentNo = @PartyCode_CurrentNo,
                                      SuppCode_AutoGen = @SuppCode_AutoGen, SuppCode_Prefix = @SuppCode_Prefix, SuppCode_CurrentNo = @SuppCode_CurrentNo,
                                      BwrCode_AutoGen = @BwrCode_AutoGen, BwrCode_Prefix = @BwrCode_Prefix, BwrCode_CurrentNo = @BwrCode_CurrentNo,
                                      GrpCode_AutoGen = @GrpCode_AutoGen, GrpCode_Prefix = @GrpCode_Prefix,
                                      GrpCode_CurrentNo = @GrpCode_CurrentNo, ItemCode_AutoGen = @ItemCode_AutoGen, ItemCode_Prefix = @ItemCode_Prefix, ItemCode_CurrentNo = @ItemCode_CurrentNo,  
                                      SchemeCode_AutoGen = @SchemeCode_AutoGen, SchemeCode_Prefix = @SchemeCode_Prefix, SchemeCode_CurrentNo = @SchemeCode_CurrentNo, LocCode_AutoGen = @LocCode_AutoGen,
                                      LocCode_Prefix = @LocCode_Prefix, LocCode_CurrentNo = @LocCode_CurrentNo, PurityCode_AutoGen = @PurityCode_AutoGen, PurityCode_Prefix = @PurityCode_Prefix,
                                      PurityCode_CurrentNo = @PurityCode_CurrentNo, BranchCode_AutoGen = @BranchCode_AutoGen, BranchCode_Prefix = @BranchCode_Prefix, BranchCode_CurrentNo = @BranchCode_CurrentNo,
                                      AgentCode_AutoGen = @AgentCode_AutoGen, AgentCode_Prefix = @AgentCode_Prefix, AgentCode_CurrentNo = @AgentCode_CurrentNo,
                                      Enable_Opening = @Enable_Opening, Enable_RegLang = @Enable_RegLang, Reg_FontName = @Reg_FontName, Reg_FontSize = @Reg_FontSize, Enable_FingerPrint = @Enable_FingerPrint,
                                      MakeFp_Mandatory = @MakeFp_Mandatory, Allow_NullInterest = @Allow_NullInterest, Show_CashBalance = @Show_CashBalance, Images_Mandatory = @Images_Mandatory,
                                      Enable_ReturnImage = @Enable_ReturnImage, Allow_DuplicateItems = @Allow_DuplicateItems, Disable_AddLess = @Disable_AddLess, Entries_LockedUpto = @Entries_LockedUpto,
                                      Enable_Authentication = @Enable_Authentication, Enable_OldEntries= @Enable_OldEntries, IntCalcinDays=@IntCalcinDays, MobileNumberMandatory=@MobileNumberMandatory,
                                      Enable_AutoApproval=@Enable_AutoApproval, Lock_PreviousDate=@Lock_PreviousDate, Enable_EmptyWt=@Enable_EmptyWt
				WHERE  SetupSno=@SetupSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END

	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getTransaction_Setup') BEGIN DROP FUNCTION Udf_getTransaction_Setup END
GO

CREATE FUNCTION Udf_getTransaction_Setup(@SetupSno INT, @CompSno INT, @BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*
	FROM	  Transaction_Setup
	WHERE	  (SetupSno=@SetupSno OR @SetupSno=0) AND (CompSno=@CompSno) AND (BranchSno=@BranchSno)

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVoucherTypes') BEGIN DROP FUNCTION Udf_getVoucherTypes END
GO

CREATE FUNCTION Udf_getVoucherTypes(@VouTypeSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	VTyp.*, VTyp.VouType_Name as Name, VTyp.VouType_Name as Details
	FROM	  Voucher_Types VTyp
	WHERE	  VouTypeSno=@VouTypeSno OR @VouTypeSno = 0

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Series') BEGIN DROP PROCEDURE Sp_Voucher_Series END
GO

CREATE PROCEDURE Sp_Voucher_Series
	@SeriesSno          INT,
  @VouTypeSno         INT,
  @Series_Name        VARCHAR(20),
  @BranchSno          INT,
  @Num_Method         TINYINT, -- 0- MANUAL,  1- SEMI,  2- AUTO
  @Allow_Duplicate    BIT,
  @Start_No           INT,
  @Current_No         INT,
  @Prefix             CHAR(4),
  @Suffix             CHAR(3),
  @Width              TINYINT,
  @Prefill            VARCHAR(1),
  @MapSchemeSno       INT,
  @Print_Voucher      BIT,
  @Print_On_Save      BIT,
  @Show_Preview       BIT,
  @Print_Style        VARCHAR(100),
  @IsStd              BIT,
  @IsDefault          BIT,
  @Active_Status      BIT,
  @Create_Date        INT,
  @UserSno            INT,
  @CompSno            INT,  
	@RetSno	            INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF ISNULL(@VouTypeSno,0) = 0
        BEGIN
            Raiserror ('Voucher Type is not valid.', 16, 1) 
            GOTO CloseNow
        END

		IF EXISTS(SELECT SeriesSno FROM Voucher_Series WHERE SeriesSno=@SeriesSno)
			BEGIN
        UPDATE Voucher_Series SET VouTypeSno=@VouTypeSno, Series_Name=@Series_Name, BranchSno=@BranchSno, Num_Method=@Num_Method, Allow_Duplicate=@Allow_Duplicate, Start_No=@Start_No, Current_No=@Current_No,
                                  Prefix=@Prefix, Suffix=@Suffix, Width=@Width, Prefill=@Prefill,MapSchemeSno=@MapSchemeSno, Print_Voucher=@Print_Voucher, Print_On_Save=@Print_On_Save, Show_Preview=@Show_Preview, Print_Style=@Print_Style,
                                  Active_Status=@Active_Status, Create_Date=@Create_Date, UserSno=@UserSno, CompSno=@CompSno, IsDefault=@IsDefault, IsStd=@IsStd
				WHERE SeriesSno=@SeriesSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        IF EXISTS(SELECT SeriesSno FROM Voucher_Series WHERE  Series_Name=@Series_Name AND CompSno=@CompSno)
          BEGIN
              Raiserror ('Voucher Series exists with this Name.', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No, Current_No, Prefix, Suffix, Width, Prefill,MapSchemeSno, Print_Voucher, Print_On_Save, Show_Preview, Print_Style,IsDefault,IsStd,
                                  Active_Status, Create_Date, UserSno, CompSno)
        VALUES (@VouTypeSno, @Series_Name, @BranchSno, @Num_Method, @Allow_Duplicate, @Start_No, @Current_No, @Prefix, @Suffix, @Width, @Prefill, @MapSchemeSno, @Print_Voucher, @Print_On_Save, @Show_Preview, @Print_Style,@IsDefault,@IsStd,
                                  @Active_Status, @Create_Date, @UserSno, @CompSno)
				IF @@ERROR <> 0 GOTO CloseNow								
				SET @SeriesSno = @@IDENTITY								
			END	

	SET @RetSno = @SeriesSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVoucherSeries') BEGIN DROP FUNCTION Udf_getVoucherSeries END
GO

CREATE FUNCTION Udf_getVoucherSeries(@SeriesSno INT, @BranchSno INT, @VouTypeSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT (
  SELECT	  Ser.*, VTyp.VouTypeSno as 'VouType.VouTypeSno',  VTyp.VouType_Name as 'VouType.VouType_Name',  VTyp.VouType_Name  as 'VouType.Name', VTyp.VouType_Name  as 'VouType.Details',  Ser.Series_Name as Name, Ser.Series_Name as Details,
            Sch.SchemeSno as 'MapScheme.SchemeSno', Sch.Scheme_Name as 'MapScheme.Scheme_Name', Sch.Scheme_Name as 'MapScheme.Name', Sch.Scheme_Name as 'MapScheme.Details',
            Sch.Roi as 'MapScheme.Roi', Sch.OrgRoi as 'MapScheme.OrgRoi', Sch.IsStdRoi as 'MapScheme.IsStdRoi', Sch.Calc_Basis as 'MapScheme.Calc_Basis', Sch.Calc_Method as 'MapScheme.Calc_Method',
            Sch.Custom_Style as 'MapScheme.Custom_Style', Sch.Enable_AmtSlab as 'MapScheme.Enable_AmtSlab', Sch.Enable_FeeSlab as 'MapScheme.Enable_FeeSlab', Sch.Preclosure_Days as 'MapScheme.Preclosure_Days',
            Sch.Min_CalcDays as 'MapScheme.Min_CalcDays', Sch.Grace_Days as 'MapScheme.Grace_Days', Sch.LpYear as 'MapScheme.LpYear', Sch.LpMonth as 'MapScheme.LpMonth', Sch.LpDays as 'MapScheme.LpDays',
            Sch.Active_Status as 'MapScheme.Active_Status', Sch.Create_Date as 'MapScheme.Create_Date', Sch.Remarks as 'MapScheme.Remarks', Sch.Min_MarketValue as 'MapScheme.Min_MarketValue',
            Sch.Max_MarketValue as 'MapScheme.Max_MarketValue', Sch.Min_LoanValue as 'MapScheme.Min_LoanValue', Sch.Max_LoanValue as 'MapScheme.Max_LoanValue', Sch.AdvanceMonth as 'MapScheme.AdvanceMonth',
            Sch.ProcessingFeePer as 'MapScheme.ProcessingFeePer'
            
	          FROM	  Voucher_Series Ser
                    INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Ser.VouTypeSno
                    LEFT OUTER JOIN Schemes Sch ON Sch.SchemeSno = Ser.MapSchemeSno
	          WHERE	  (Ser.SeriesSno=@SeriesSno OR @SeriesSno = 0) AND (Ser.BranchSno=@BranchSno OR @BranchSno=0) AND (Ser.VouTypeSno=@VouTypeSno OR @VouTypeSno=0)
                    AND (Ser.CompSno=@CompSno)                    
            ORDER BY Create_Date DESC
            FOR JSON PATH) AS Json_Result

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Series_Delete') BEGIN DROP PROCEDURE Sp_Voucher_Series_Delete END
GO


CREATE PROCEDURE Sp_Voucher_Series_Delete
	@SeriesSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

  DECLARE @IsDefault BIT = 0
      SELECT @IsDefault = IsDefault FROM Voucher_Series WHERE SeriesSno=@SeriesSno

      IF @IsDefault = 1
        BEGIN
          Raiserror ('Standard Voucher Series cannot be deleted..', 16, 1) 
					GOTO CloseNow
        END

			IF EXISTS (SELECT TransSno FROM Transactions WHERE SeriesSno=@SeriesSno)
				BEGIN
					Raiserror ('Transactions exists with this Series', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Voucher_Series WHERE SeriesSno=@SeriesSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_InsertSeriesDefaults') BEGIN DROP PROCEDURE Sp_InsertSeriesDefaults END
GO
CREATE PROCEDURE Sp_InsertSeriesDefaults 
@CompSno INT,
@BranchSno INT
AS
BEGIN

  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd,  Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (1,'Opening',@BranchSno,1,0,1,0,'OP','',4,0,0,0,0,'',1,1, 1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (2,'Receipt',@BranchSno,1,0,1,0,'REC','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (3,'Payment',@BranchSno,1,0,1,0,'PMT','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (4,'Journal',@BranchSno,1,0,1,0,'JOU','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (5,'Contra',@BranchSno,1,0,1,0,'CTR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (6,'Memorandum',@BranchSno,1,0,1,0,'MEM','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (7,'Credit Note',@BranchSno,1,0,1,0,'CRN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (8,'Debit Note',@BranchSno,1,0,1,0,'DRN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (9,'Cheque RETURN',@BranchSno,1,0,1,0,'CRET','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (10,'Sales',@BranchSno,1,0,1,0,'SAL','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (11,'Purchase',@BranchSno,1,0,1,0,'PUR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (12,'Loan Payment',@BranchSno,1,0,1,0,'LN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (13,'Loan Receipt',@BranchSno,1,0,1,0,'LR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (14,'Loan Redemption',@BranchSno,1,0,1,0,'RED','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (15,'Auction Entry',@BranchSno,1,0,1,0,'AE','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (16,'Transfer',@BranchSno,1,0,1,0,'TRA','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (17,'RePledge',@BranchSno,1,0,1,0,'RP','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (18,'Repledge Payment',@BranchSno,1,0,1,0,'RPP','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (19,'Repledge Closure',@BranchSno,1,0,1,0,'RC','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, BranchSno, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, MapSchemeSno, CompSno)
  VALUES (20,'ReLoan',@BranchSno,1,0,1,0,'RL','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,0,@CompSno)
END
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Branches') BEGIN DROP PROCEDURE Sp_Branches END
GO

CREATE PROCEDURE Sp_Branches
	@BranchSno INT,
	@Branch_Code VARCHAR(10),
	@Branch_Name VARCHAR(20),
	@Remarks VARCHAR(50),
  @DivSno INT,
	@Active_Status BIT,
	@Create_Date INT,
  @UserSno INT,
  @CompSno INT,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT BranchSno FROM Branches WHERE BranchSno=@BranchSno)
			BEGIN
				UPDATE Branches SET Branch_Code=@Branch_Code,Branch_Name=@Branch_Name,Remarks=@Remarks,DivSno=@DivSno,Active_Status=@Active_Status,Create_Date=@Create_Date, UserSno=@UserSno, CompSno=@CompSno
				WHERE BranchSno=@BranchSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        IF EXISTS(SELECT BranchSno FROM Branches WHERE  Branch_Code=@Branch_Code AND CompSno=@CompSno)
          BEGIN
              Raiserror ('Branch exists with this Code', 16, 1) 
              GOTO CloseNow
          END

          DECLARE @BranchCode_AutoGen BIT
          SELECT @BranchCode_AutoGen=BranchCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
          IF @BranchCode_AutoGen=1
          BEGIN
              SELECT @Branch_Code=TRIM(BranchCode_Prefix)+CAST((BranchCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
          End


				INSERT INTO Branches(Branch_Code, Branch_Name, Remarks, DivSno, Active_Status, Create_Date, UserSno, CompSno)
        VALUES (@Branch_Code, @Branch_Name, @Remarks, @DivSno, @Active_Status, @Create_Date, @UserSno, @CompSno)	
				SET @BranchSno = @@IDENTITY
        IF @@ERROR <> 0 GOTO CloseNow								

        EXEC Sp_InsertSeriesDefaults @CompSno,@BranchSno

        INSERT INTO Transaction_Setup(      AreaCode_AutoGen, AreaCode_Prefix, AreaCode_CurrentNo, PartyCode_AutoGen,PartyCode_Prefix, PartyCode_CurrentNo, SuppCode_AutoGen,SuppCode_Prefix,
                                      SuppCode_CurrentNo,BwrCode_AutoGen, BwrCode_Prefix, BwrCode_CurrentNo, GrpCode_AutoGen, GrpCode_Prefix, GrpCode_CurrentNo,
                                      ItemCode_AutoGen, ItemCode_Prefix, ItemCode_CurrentNo, SchemeCode_AutoGen, SchemeCode_Prefix, SchemeCode_CurrentNo, LocCode_AutoGen, LocCode_Prefix,
                                      LocCode_CurrentNo, PurityCode_AutoGen, PurityCode_Prefix, PurityCode_CurrentNo, BranchCode_AutoGen, BranchCode_Prefix, BranchCode_CurrentNo,
                                      Enable_Opening, Enable_RegLang, Reg_FontName, Reg_FontSize, Enable_FingerPrint, MakeFp_Mandatory, Allow_NullInterest, Show_CashBalance,
                                      Images_Mandatory, Enable_ReturnImage, Allow_DuplicateItems, Disable_AddLess, Entries_LockedUpto, Enable_Authentication, Enable_OldEntries,
                                      CompSno,BranchSno,MobileNumberMandatory, IntCalcinDays, Enable_AutoApproval, Lock_PreviousDate, Enable_EmptyWt)

        VALUES                       (      1, 'AR', 0, 1,'PR', 0, 1,'SUP', 0,1, 'BWR', 0, 1, 'GRP', 0, 1, 'IT', 0, 1, 'SCH', 0, 1, 'LOC', 0, 1, 'PUR', 0, 1, 'BRH', 0, 0, 0, '', 12, 0, 0, 0, 0,
                                      0, 0, 0, 0, 0, 1, 0,@CompSno,@BranchSno,0,0,0,0, 0)
        IF @@ERROR <> 0 GOTO CloseNow

        UPDATE Transaction_Setup SET BranchCode_CurrentNo = BranchCode_CurrentNo + 1 WHERE CompSno=@CompSno
        IF @@ERROR <> 0 GOTO CloseNow		

			END	

	SET @RetSno = @BranchSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getBranches') BEGIN DROP FUNCTION Udf_getBranches END
GO

CREATE FUNCTION Udf_getBranches(@BranchSno INT,@CompSno INT, @DivSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*
	FROM	  Branches 
	WHERE	  (BranchSno=@BranchSno OR @BranchSno = 0) AND (DivSno=@DivSno OR @DivSno=0) AND (CompSno=@CompSno OR @CompSno=0) 

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Branch_Delete') BEGIN DROP PROCEDURE Sp_Branch_Delete END
GO

CREATE PROCEDURE Sp_Branch_Delete
	@BranchSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT SeriesSno FROM Voucher_Series WHERE BranchSno=@BranchSno)
				BEGIN
					Raiserror ('Voucher Series exists with this Branch', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Branches WHERE BranchSno=@BranchSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Area') BEGIN DROP PROCEDURE Sp_Area END
GO

CREATE PROCEDURE Sp_Area
	@AreaSno INT,
	@Area_Code VARCHAR(10),
	@Area_Name VARCHAR(200),
	@Remarks VARCHAR(50),
	@Active_Status BIT,
	@Create_Date INT,
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
	@RetSno	INT OUTPUT
  
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION    
		IF EXISTS(SELECT AreaSno FROM Area WHERE AreaSno=@AreaSno)
			BEGIN
				UPDATE Area SET Area_Code=@Area_Code,Area_Name=@Area_Name,Remarks=@Remarks,Active_Status=@Active_Status,Create_Date=@Create_Date, UserSno=@UserSno, CompSno=@CompSno
				WHERE AreaSno=@AreaSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN

          DECLARE @AreaCode_AutoGen BIT
          SELECT @AreaCode_AutoGen=AreaCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @AreaCode_AutoGen=1
          BEGIN
              SELECT @Area_Code=TRIM(AreaCode_Prefix)+CAST((AreaCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End


        IF EXISTS(SELECT AreaSno FROM Area WHERE  Area_Code=@Area_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
          BEGIN
              Raiserror ('Area exists with this Code', 16, 1)  
              GOTO CloseNow
          END

				INSERT INTO Area(Area_Code, Area_Name, Remarks, Active_Status, Create_Date, UserSno, CompSno)
        VALUES (@Area_Code, @Area_Name, @Remarks, @Active_Status, @Create_Date, @UserSno, @CompSno)
				IF @@ERROR <> 0 GOTO CloseNow								
				SET @AreaSno = @@IDENTITY

        UPDATE Transaction_Setup SET AreaCode_CurrentNo = AreaCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow								
			END	

	SET @RetSno = @AreaSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getArea') BEGIN DROP FUNCTION Udf_getArea END
GO

CREATE FUNCTION Udf_getArea(@AreaSno INT,@CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN  
	SELECT	Ar.*, Ar.Area_Name as Name, 'Code: '+ Ar.Area_Code as Details
	FROM	  Area Ar
	WHERE	  (AreaSno=@AreaSno OR @AreaSno = 0) AND (CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Area_Delete') BEGIN DROP PROCEDURE Sp_Area_Delete END
GO

CREATE PROCEDURE Sp_Area_Delete
	@AreaSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT PartySno FROM Party WHERE AreaSno=@AreaSno)
				BEGIN
					Raiserror ('Party exists with this Area', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Area WHERE AreaSno=@AreaSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Party') BEGIN DROP PROCEDURE Sp_Party END
GO

CREATE PROCEDURE Sp_Party
	@PartySno        INT,
  @Party_Code      VARCHAR(20),
  @Party_Name      VARCHAR(200),
  @Print_Name      VARCHAR(200),
  @Party_Cat       TINYINT,
  @AreaSno         INT,
  @Rel             TINYINT,
  @RelName         VARCHAR(200),
  @Address1        VARCHAR(200),
  @Address2        VARCHAR(200),
  @Address3        VARCHAR(200),
  @Address4        VARCHAR(200),
  @City            VARCHAR(200),
  @State           VARCHAR(200),
  @Pincode         VARCHAR(10),
  @Phone           VARCHAR(20),
  @Mobile          VARCHAR(20),
  @Email           VARCHAR(50),
  @Reference         VARCHAR(50),
  @Dob               INT,
  @Sex               TINYINT,

  @Aadhar_No         VARCHAR(20),
  @Pancard_No        VARCHAR(20),
  @Smartcard_No      VARCHAR(20),
  @Voterid_No        VARCHAR(20),
  @Nominee           VARCHAR(50),
  @Nominee_Rel       VARCHAR(20),
  @Nominee_Aadhar    VARCHAR(20),

  @Remarks           VARCHAR(100),
  @Occupation        VARCHAR(20),
  @Monthly_Income    MONEY,
  @Loan_Value_Limit  MONEY,
  @Allow_More_Value  BIT,
  @Verify_Code       VARCHAR(10),
  @Verify_Status     BIT,
  @Fp_Status         BIT,
  @Active_Status     BIT,
  @IsFavorite         BIT,
  @BlackListed       BIT,
  @Create_Date       INT,
  @UserSno           INT,
  @CompSno           INT,
  @BranchSno         INT,
  @ImageDetailXML    XML,
  @LedSno             INT,

  @Bank_AccName      VARCHAR(50),
  @Bank_Name         VARCHAR(50),
  @Bank_Branch_Name  VARCHAR(50),
  @Bank_AccountNo    VARCHAR(50),
  @Bank_Ifsc         VARCHAR(20),

	@RetSno	            INT OUTPUT,
  @Ret_Party_Code   VARCHAR(20) OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

  IF (@CompSno=0) 
    BEGIN
        Raiserror ('Company is not Identified...Relogin the App' , 16, 1) 
        GOTO CloseNow
    END

    IF (@AreaSno=0) 
    BEGIN
        Raiserror ('Area cannot be emty' , 16, 1) 
        GOTO CloseNow
    END

     IF (@UserSno=0) 
    BEGIN
        Raiserror ('User cannot be emty' , 16, 1) 
        GOTO CloseNow
    END
    /*
    IF (@PartySno=0) AND (LEN(TRIM(@Mobile)) <> 0) AND (EXISTS(SELECT PartySno FROM Party WHERE Mobile=@Mobile AND CompSno=@CompSno))
    BEGIN
        Raiserror ('Party exists with this Mobile Number' , 16, 1) 
        GOTO CloseNow
    END
    */

		IF EXISTS(SELECT PartySno FROM Party WHERE PartySno=@PartySno)
			BEGIN
				UPDATE Party SET  Party_Code=@Party_Code, Party_Name=@Party_Name, Print_Name = @Print_Name, Party_Cat = @Party_Cat, AreaSno = @AreaSno, Rel = @Rel, RelName = @RelName, Address1 = @Address1, Address2 = @Address2,
                          Address3 = @Address3, Address4 = @Address4, City = @City, State = @State, Pincode = @Pincode, Phone = @Phone, Mobile = @Mobile, Email = @Email, Reference = @Reference, Dob = @Dob, Sex = @Sex,

                          Aadhar_No = @Aadhar_No,
                          Pancard_No = @Pancard_No,
                          Smartcard_No = @Smartcard_No,
                          Voterid_No = @Voterid_No,
                          Nominee = @Nominee,
                          Nominee_Rel = @Nominee_Rel,
                          Nominee_Aadhar = @Nominee_Aadhar,
                          Remarks = @Remarks, Occupation = @Occupation, Monthly_Income = @Monthly_Income, Loan_Value_Limit = @Loan_Value_Limit, Allow_More_Value = @Allow_More_Value,

                          Bank_AccName=@Bank_AccName, Bank_Name=@Bank_Name, Bank_Branch_Name=@Bank_Branch_Name, Bank_AccountNo=@Bank_AccountNo, Bank_Ifsc=@Bank_Ifsc,

                          Verify_Code = @Verify_Code, Verify_Status = @Verify_Status, Fp_Status = @Fp_Status, Active_Status = @Active_Status, IsFavorite=@IsFavorite, BlackListed=@BlackListed, Create_Date = @Create_Date,  UserSno = @UserSno,
                          CompSno = @CompSno         
				WHERE             PartySno=@PartySno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Image_Details WHERE TransSno=@PartySno AND Image_Grp = 1
        IF @@ERROR <> 0 GOTO CloseNow

			END
		ELSE
			BEGIN
      
      
          DECLARE @PartyCode_AutoGen BIT
          SELECT @PartyCode_AutoGen=PartyCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @PartyCode_AutoGen=1
          BEGIN
              SELECT @Party_Code=TRIM(PartyCode_Prefix)+CAST((PartyCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End
          
        IF EXISTS(SELECT PartySno FROM Party WHERE  Party_Code=@Party_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno))  )
          BEGIN
              Raiserror ('Party exists with this Party Code.', 16, 1)              
              GOTO CloseNow
          END

  
				INSERT INTO Party(Party_Code, Party_Name, Print_Name, Party_Cat, AreaSno, Rel, RelName, Address1, Address2, Address3, Address4, City, State, Pincode, Phone, Mobile, Email, Reference,
                          Dob, Sex, Aadhar_No, Pancard_No, Smartcard_No, Voterid_No, Nominee, Nominee_Rel, Nominee_Aadhar, Remarks, Occupation, Monthly_Income, Loan_Value_Limit, Allow_More_Value,
                          Verify_Code, Verify_Status, Fp_Status, Active_Status, IsFavorite, BlackListed, Create_Date,
                          Bank_AccName, Bank_Name, Bank_Branch_Name, Bank_AccountNo, Bank_Ifsc,
                          UserSno, CompSno)

        VALUES            (@Party_Code, @Party_Name, @Print_Name, @Party_Cat, @AreaSno, @Rel, @RelName, @Address1, @Address2, @Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Email, @Reference,
                          @Dob, @Sex, @Aadhar_No, @Pancard_No, @Smartcard_No, @Voterid_No, @Nominee, @Nominee_Rel, @Nominee_Aadhar, @Remarks, @Occupation, @Monthly_Income, @Loan_Value_Limit, @Allow_More_Value,
                          @Verify_Code, @Verify_Status, @Fp_Status, @Active_Status, @IsFavorite, @BlackListed, @Create_Date,
                          @Bank_AccName, @Bank_Name, @Bank_Branch_Name, @Bank_AccountNo, @Bank_Ifsc,
                          @UserSno, @CompSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @PartySno = @@IDENTITY
        UPDATE Transaction_Setup SET PartyCode_CurrentNo=PartyCode_CurrentNo+1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow								
			END	

     IF @Party_Cat = 1
        BEGIN
          EXEC SSp_AccLedger_Master @LedSno, '', @Party_Name, 31,  0, 0, 0, @Create_Date, @CompSno, @UserSno, @LedSno OUTPUT
        END
      ELSE
        BEGIN
          EXEC SSp_AccLedger_Master @LedSno, '', @Party_Name, 32,  0, 0, 0, @Create_Date, @CompSno, @UserSno, @LedSno OUTPUT
        END
      
      UPDATE Party SET LedSno=@LedSno WHERE PartySno=@PartySno 

    IF @ImageDetailXML IS NOT NULL
          BEGIN                     
              DECLARE @Sno         INT
              DECLARE @idoc1       INT
              DECLARE @doc1        XML
              DECLARE @Image_Name  VARCHAR(50)
              DECLARE @Image_Url   VARCHAR(100)
                                              
              /*Declaring Temporary Table for Details Table*/
              DECLARE @ImgTable Table
              (
                  Sno INT IDENTITY(1,1),Image_Name VARCHAR(50), Image_Url VARCHAR(200)
              )
              Set @doc1=@ImageDetailXML
              Exec sp_xml_preparedocument @idoc1 Output, @doc1
             
              /*Inserting into Temporary Table from Passed XML File*/
              INSERT INTO @ImgTable
              (
                  Image_Name, Image_Url
              )
             
              SELECT  * FROM  OpenXml 
              (
                  @idoc1, '/ROOT/Images/Image_Details',2
              )
              WITH 
              (
                  Image_Name VARCHAR(50) '@Image_Name', Image_Url VARCHAR(100) '@Image_Url'
              )
              SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
              FROM @ImgTable
                  
              /*Taking from Temporary Details Table and inserting into details table here*/
              WHILE @@ROWCOUNT <> 0 
                  BEGIN
                      INSERT INTO [dbo].Image_Details(TransSno,Image_Grp, Image_Name, Image_Url) 
                      VALUES (@PartySno,1, @Image_Name, (@Image_Url + @Party_Code + '/' + @Image_Name))
                      IF @@Error <> 0 GOTO CloseNow
             
                      DELETE FROM @ImgTable WHERE Sno = @Sno
                      SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                      FROM   @ImgTable
                  END
              Exec Sp_Xml_Removedocument @idoc1
        END

	SET @RetSno = @PartySno
  SET @Ret_Party_Code = @Party_Code
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getParties') BEGIN DROP FUNCTION Udf_getParties END
GO

CREATE FUNCTION Udf_getParties(@PartySno INT, @Party_Cat TINYINT, @Verify_Status TINYINT, @Fp_Status TINYINT, @Active_Status TINYINT,@CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

	SELECT    ( SELECT	Pty.*,
                      RelInfo  = CASE Rel WHEN 0 THEN 'S/o' WHEN 1 THEN 'D/o' WHEN 2 THEN 'W/o' WHEN 3 THEN 'C/o' END,
                      RelGroup = CASE Rel WHEN 0 THEN 'S/o ' + RelName WHEN 1 THEN 'D/o ' + RelName WHEN 2 THEN 'W/o ' + RelName WHEN 3 THEN 'C/o ' + RelName END,
                      Pty.Party_Name as 'Name', 'Code:' + Pty.Party_Code as Details, Ar.AreaSno as 'Area.AreaSno', Ar.Area_Code as 'Area.Area_Code', Ar.Area_Name as 'Area.Area_Name', Ar.Area_Name as 'Area.Name',
                      ProfileImage = (SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Pty.PartySno)

	            FROM	  Party Pty
                      INNER JOIN Area Ar ON Ar.AreaSno = Pty.AreaSno

	            WHERE	  (Pty.PartySno=@PartySno OR @PartySno=0) AND (Pty.Party_Cat=@Party_Cat OR @Party_Cat=0) AND
                      Pty.Verify_Status < (CASE WHEN @Verify_Status=0 THEN 3 ELSE @Verify_Status END ) AND
                      Pty.Fp_Status < (CASE WHEN @Fp_Status=0 THEN 3 ELSE @Fp_Status END ) AND
                      Pty.Active_Status < (CASE WHEN @Active_Status=0 THEN 3 ELSE @Active_Status END ) AND
                      (Pty.CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))

              ORDER BY  Pty.Create_Date DESC

              FOR JSON PATH) AS Json_Result

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Party_Delete') BEGIN DROP PROCEDURE Sp_Party_Delete END
GO
CREATE PROCEDURE Sp_Party_Delete
	@PartySno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
            
			IF EXISTS (SELECT TransSno FROM Transactions WHERE PartySno=@PartySno)
				BEGIN
					Raiserror ('Transactions exists with this Party', 16, 1) 
					GOTO CloseNow
				END

      DELETE FROM Party WHERE PartySno=@PartySno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Ledgers WHERE LedSno=(SELECT OpenSno FROM Party WHERE PartySno=@PartySno)
      IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Image_Details WHERE TransSno=@PartySno AND Image_Grp=1
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Scheme') BEGIN DROP PROCEDURE Sp_Scheme END
GO
CREATE PROCEDURE Sp_Scheme
	@SchemeSno      INT,
  @Scheme_Code    VARCHAR(10),
	@Scheme_Name    VARCHAR(20),
  @Roi            DECIMAL(4,2),
  @EmiDues        TINYINT,
  @OrgRoi         DECIMAL(4,2),
  @IsStdRoi       BIT,

  @Doc_Charges_Per  DECIMAL(4,2),
  @Doc_Charges      MONEY,
  @Tax_Per          DECIMAL(4,2),
  
  @Calc_Basis       TINYINT,
  @Calc_Method      TINYINT,
  @Compound_Period SMALLINT,
  @Custom_Style TINYINT,
  @Payment_Frequency TINYINT,
  @Enable_AmtSlab BIT,
  @Enable_FeeSlab BIT,
  @Preclosure_Days TINYINT,
  @Min_CalcDays TINYINT,
  @Grace_Days TINYINT,
  @SeriesSno INT,
  @LpYear TINYINT,
  @LpMonth TINYINT,
  @LpDays TINYINT,
  @AdvanceMonth TINYINT,
  @ProcessingFeePer FLOAT,
  @Min_MarketValue MONEY,
  @Max_MarketValue MONEY,
  @Min_LoanValue MONEY,
  @Max_LoanValue MONEY,
  @Active_Status     BIT,
  @Create_Date INT,
  @Remarks VARCHAR(50),
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
  @MultiIntXML XML,
  @AmtIntXML XML,
  @FeeSlabXML XML,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT SchemeSno FROM Schemes WHERE SchemeSno=@SchemeSno)
			BEGIN
				UPDATE Schemes SET  Scheme_Code=@Scheme_Code,Scheme_Name=@Scheme_Name, Roi=@Roi,EmiDues=@EmiDues,OrgRoi=@OrgRoi, IsStdRoi=@IsStdRoi,
                            Doc_Charges_Per=@Doc_Charges_Per, Doc_Charges=@Doc_Charges, Tax_Per=@Tax_Per,
                            Calc_Basis=@Calc_Basis, Calc_Method=@Calc_Method, Compound_Period=@Compound_Period, Custom_Style=@Custom_Style,Payment_Frequency=@Payment_Frequency,Enable_AmtSlab=@Enable_AmtSlab, Enable_FeeSlab=@Enable_FeeSlab, Preclosure_Days=@Preclosure_Days, Min_CalcDays=@Min_CalcDays,
                            Grace_Days=@Grace_Days, SeriesSno=@SeriesSno, LpYear=@LpYear, LpMonth=@LpMonth, LpDays=@LpDays, AdvanceMonth= @AdvanceMonth, ProcessingFeePer=@ProcessingFeePer,  Min_MarketValue=@Min_MarketValue, Max_MarketValue=@Max_MarketValue, Min_LoanValue=@Min_LoanValue, Max_LoanValue=@Max_LoanValue, Active_Status=@Active_Status,
                            Create_Date=@Create_Date,Remarks=@Remarks, UserSno=@UserSno, CompSno=@CompSno
				WHERE SchemeSno=@SchemeSno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Scheme_Details WHERE SchemeSno=@SchemeSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Amt_Slab_Details WHERE SchemeSno=@SchemeSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Fee_Slab_Details WHERE SchemeSno=@SchemeSno
        IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN

         DECLARE @SchemeCode_AutoGen BIT
          SELECT @SchemeCode_AutoGen=SchemeCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @SchemeCode_AutoGen=1
          BEGIN
              SELECT @Scheme_Code=TRIM(SchemeCode_Prefix)+CAST((SchemeCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End


        IF EXISTS(SELECT SchemeSno FROM Schemes WHERE  Scheme_Code=@Scheme_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
          BEGIN
              Raiserror ('Scheme exists with this Code', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Schemes (Scheme_Code,Scheme_Name, Roi,EmiDues, OrgRoi, IsStdRoi, Doc_Charges_Per, Doc_Charges, Tax_Per,
                            Calc_Basis, Calc_Method, Compound_Period, Custom_Style, Payment_Frequency, Enable_AmtSlab, Enable_FeeSlab, Preclosure_Days, Min_CalcDays, Grace_Days, SeriesSno, LpYear, LpMonth, LpDays, AdvanceMonth, ProcessingFeePer,  Min_MarketValue, Max_MarketValue, Min_LoanValue, Max_LoanValue,
                            Active_Status, Create_Date,Remarks, UserSno, CompSno)
        VALUES              (@Scheme_Code,@Scheme_Name, @Roi, @EmiDues, @OrgRoi, @IsStdRoi, @Doc_Charges_Per, @Doc_Charges, @Tax_Per,
                            @Calc_Basis, @Calc_Method, @Compound_Period, @Custom_Style, @Payment_Frequency, @Enable_AmtSlab, @Enable_FeeSlab, @Preclosure_Days, @Min_CalcDays, @Grace_Days, @SeriesSno, @LpYear, @LpMonth, @LpDays, @AdvanceMonth, @ProcessingFeePer, @Min_MarketValue, @Max_MarketValue, @Min_LoanValue, @Max_LoanValue,
                            @Active_Status, @Create_Date, @Remarks, @UserSno, @CompSno)
				IF @@ERROR <> 0 GOTO CloseNow								
				SET @SchemeSno = @@IDENTITY

        UPDATE Transaction_Setup SET SchemeCode_CurrentNo = SchemeCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow								
			END	

      IF @MultiIntXML IS NOT NULL       
             BEGIN
                 --For Inserting into Subtable
                 DECLARE @idoc       INT
                 DECLARE @doc        XML
                 DECLARE @Sno        INT     
                 DECLARE @FromPeriod SMALLINT
                 DECLARE @ToPeriod   SMALLINT
                 DECLARE @DRoi       DECIMAL(4,2)
                 DECLARE @DOrgRoi    DECIMAL(4,2)
                 
                 /*Declaring Temporary Table for Details Table*/
                 DECLARE @DetTable Table
                 (
                     Sno INT IDENTITY(1,1),FromPeriod NUMERIC,ToPeriod NUMERIC,DRoi FLOAT,DOrgRoi FLOAT
                 )
                 Set @doc=@MultiIntXML
                 Exec sp_xml_preparedocument @idoc Output, @doc
                 /*Inserting into Temporary Table from Passed XML File*/
                 INSERT INTO @DetTable
                 (
                     FromPeriod,ToPeriod,DRoi,DOrgRoi
                 )
                 SELECT  * FROM  OpenXml 
                 (
                     @idoc, '/ROOT/Scheme/Scheme_Details',2
                 )
                 WITH 
                 (
                     FromMonths SMALLINT '@FromPeriod', ToMonths SMALLINT '@ToPeriod', DRoi DECIMAL(4,2) '@DRoi', DOrgRoi DECIMAL(4,2) '@DOrgRoi'
                 )

                 SELECT  TOP 1 @Sno=Sno, @FromPeriod=FromPeriod, @ToPeriod=ToPeriod, @DRoi=DRoi, @DOrgRoi=DOrgRoi
                 FROM @DetTable
                 /*Taking from Temporary Details Table and inserting into details table here*/
                 WHILE @@ROWCOUNT <> 0 
                     BEGIN
                         INSERT INTO [dbo].Scheme_Details(SchemeSno,FromPeriod,ToPeriod,Roi,OrgRoi) 
                         VALUES (@SchemeSno,@FromPeriod,@ToPeriod,@DRoi,@DOrgRoi)
                         IF @@Error <> 0 GOTO CloseNow
                         DELETE FROM @DetTable WHERE Sno = @Sno
                         SELECT  TOP 1 @Sno=Sno, @FromPeriod=FromPeriod, @ToPeriod=ToPeriod, @DRoi=DRoi, @DOrgRoi=DOrgRoi
                 FROM @DetTable
                     END
                 Exec Sp_Xml_Removedocument @idoc
             END
      IF @AmtIntXML IS NOT NULL       
             BEGIN
                 --For Inserting into Subtable
                 
                 DECLARE @FromAmount MONEY
                 DECLARE @ToAmount   MONEY
                                  
                 /*Declaring Temporary Table for Details Table*/
                 DECLARE @DetTable1 Table
                 (
                     Sno INT IDENTITY(1,1),FromAmount MONEY,ToAmount MONEY,DRoi DECIMAL(4,2)  
                 )
                 Set @doc=@AmtIntXML
                 Exec sp_xml_preparedocument @idoc Output, @doc
                 /*Inserting into Temporary Table from Passed XML File*/
                 INSERT INTO @DetTable1
                 (
                     FromAmount,ToAmount,DRoi
                 )
                 SELECT  * FROM  OpenXml 
                 (
                     @idoc, '/ROOT/Amount/Amount_Details',2
                 )
                 WITH 
                 (
                     FromAmount MONEY '@FromAmount', ToAmount MONEY '@ToAmount', DRoi DECIMAL(4,2) '@DRoi'
                 )

                 SELECT  TOP 1 @Sno=Sno, @FromAmount=FromAmount, @ToAmount=ToAmount, @DRoi=DRoi
                 FROM @DetTable1
                 /*Taking from Temporary Details Table and inserting into details table here*/
                 WHILE @@ROWCOUNT <> 0 
                     BEGIN
                         INSERT INTO [dbo].Amt_Slab_Details(SchemeSno,FromAmount,ToAmount,Roi) 
                         VALUES (@SchemeSno,@FromAmount,@ToAmount,@DRoi)
                         IF @@Error <> 0 GOTO CloseNow
                         DELETE FROM @DetTable1 WHERE Sno = @Sno
                         SELECT  TOP 1 @Sno=Sno, @FromAmount=FromAmount, @ToAmount=ToAmount, @DRoi=DRoi
                         FROM @DetTable1
                     END
                 Exec Sp_Xml_Removedocument @idoc
             END
      IF @FeeSlabXML IS NOT NULL       
             BEGIN

                DECLARE @FeePer   DECIMAL(4,2)
                 /*Declaring Temporary Table for Details Table*/
                 DECLARE @DetTable2 Table
                 (
                     Sno INT IDENTITY(1,1),FromAmount MONEY,ToAmount MONEY,FeePer DECIMAL(4,2)  
                 )
                 Set @doc=@FeeSlabXML
                 Exec sp_xml_preparedocument @idoc Output, @doc
                 /*Inserting into Temporary Table from Passed XML File*/
                 INSERT INTO @DetTable2
                 (
                     FromAmount,ToAmount,FeePer
                 )
                 SELECT  * FROM  OpenXml 
                 (
                     @idoc, '/ROOT/Fee/Fee_Details',2
                 )
                 WITH 
                 (
                     FromAmount MONEY '@FromAmount', ToAmount MONEY '@ToAmount', FeePer DECIMAL(4,2) '@FeePer'
                 )

                 SELECT  TOP 1 @Sno=Sno, @FromAmount=FromAmount, @ToAmount=ToAmount, @FeePer=FeePer
                 FROM @DetTable2
                 /*Taking from Temporary Details Table and inserting into details table here*/
                 WHILE @@ROWCOUNT <> 0 
                     BEGIN
                         INSERT INTO [dbo].Fee_Slab_Details(SchemeSno,FromAmount,ToAmount,FeePer) 
                         VALUES (@SchemeSno,@FromAmount,@ToAmount,@FeePer)
                         IF @@Error <> 0 GOTO CloseNow
                         DELETE FROM @DetTable2 WHERE Sno = @Sno
                         SELECT  TOP 1 @Sno=Sno, @FromAmount=FromAmount, @ToAmount=ToAmount, @FeePer=FeePer
                         FROM @DetTable2
                     END
                 Exec Sp_Xml_Removedocument @idoc
             END
             
      SET @RetSno = @SchemeSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getScheme') BEGIN DROP FUNCTION Udf_getScheme END
GO

CREATE FUNCTION Udf_getScheme(@SchemeSno INT,@CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT (  SELECT	Sch.*, Scheme_Name as Name, (CAST(Roi AS VARCHAR)+'%  ' + CASE Calc_Method WHEN 0 THEN 'SIMPLE' WHEN 1 THEN 'MULTIPLE' WHEN 2 THEN 'COMPOUND' WHEN 3 THEN 'EMI' WHEN 4 THEN 'CUSTOM' END) AS Details,
                    Ser.SeriesSno as 'Series.SeriesSno', Ser.Series_Name as 'Series.Series_Name', 12 as 'Series.VouType.VouTypeSno', 'Loan Payment' as 'Series.VouType.VouType_Name',
                    Ser.Series_Name as 'Series.Name', 'Loan Payment' as 'Series.Details',
                    (SELECT Slb.* FROM Scheme_Details Slb WHERE Slb.SchemeSno = Sch.SchemeSno FOR JSON PATH) Slab_Json,
                    (SELECT aSlb.* FROM Amt_Slab_Details aSlb WHERE aSlb.SchemeSno = Sch.SchemeSno FOR JSON PATH) AmtSlab_Json,
                    (SELECT fSlb.* FROM Fee_Slab_Details fSlb WHERE fSlb.SchemeSno = Sch.SchemeSno FOR JSON PATH) FeeSlab_Json
	          FROM	  Schemes Sch
                    LEFT OUTER JOIN Voucher_Series Ser On Ser.SeriesSno = Sch.SeriesSno
	          WHERE	  (SchemeSno=@SchemeSno OR @SchemeSno = 0) AND (Sch.CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
            FOR JSON PATH) as Json_Result
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRoiforAmoount') BEGIN DROP FUNCTION Udf_getRoiforAmoount END
GO
CREATE FUNCTION Udf_getRoiforAmoount(@SchemeSno INT, @Amount MONEY)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT		ISNULL(Slb.Roi,0) as Roi, ISNULL(fSlb.FeePer,0) as FeePer
	FROM		  Schemes Sch
				    LEFT OUTER JOIN Amt_Slab_Details Slb ON Slb.SchemeSno=Sch.SchemeSno
            LEFT OUTER JOIN Fee_Slab_Details fSlb ON fSlb.SchemeSno=Sch.SchemeSno
				
	WHERE		  (Sch.SchemeSno=@SchemeSno) AND
            (@Amount >=Slb.FromAmount) AND (@Amount <= Slb.ToAmount  OR Slb.ToAmount = 0) OR
            (@Amount >=fSlb.FromAmount) AND (@Amount <= fSlb.ToAmount  OR fSlb.ToAmount = 0)

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Scheme_Delete') BEGIN DROP PROCEDURE Sp_Scheme_Delete END
GO
CREATE PROCEDURE Sp_Scheme_Delete
	@SchemeSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT TransSno FROM Transactions WHERE SchemeSno=@SchemeSno)
				BEGIN
					Raiserror ('Transactions exists with this Scheme', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Schemes WHERE SchemeSno=@SchemeSno
			IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Scheme_Details WHERE SchemeSno=@SchemeSno
			IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Amt_Slab_Details WHERE SchemeSno=@SchemeSno
			IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Fee_Slab_Details WHERE SchemeSno=@SchemeSno
      IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Item_Groups') BEGIN DROP PROCEDURE Sp_Item_Groups END
GO
CREATE PROCEDURE Sp_Item_Groups
	@GrpSno INT,
  @Grp_Code VARCHAR(10),
  @Grp_Name VARCHAR(20),
  @Market_Rate MONEY,
  @Loan_PerGram MONEY,
  @Restrict_Type TINYINT,
  @Remarks VARCHAR(50),
  @Active_Status     BIT,
  @Create_Date INT,
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT GrpSno FROM Item_Groups WHERE GrpSno=@GrpSno)
			BEGIN
				UPDATE Item_Groups SET  Grp_Code = @Grp_Code, Grp_Name = @Grp_Name, Market_Rate = @Market_Rate, Loan_PerGram = @Loan_PerGram, Restrict_Type = @Restrict_Type, Remarks = @Remarks, Active_Status = @Active_Status,
                                Create_Date = @Create_Date, UserSno  =  @UserSno,  CompSno = @CompSno
				WHERE GrpSno=@GrpSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
      
          DECLARE @GrpCode_AutoGen BIT
          SELECT @GrpCode_AutoGen=GrpCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @GrpCode_AutoGen=1
          BEGIN
              SELECT @Grp_Code=TRIM(GrpCode_Prefix)+CAST((GrpCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End

        IF EXISTS(SELECT GrpSno FROM Item_Groups WHERE Grp_Code=@Grp_Code AND CompSno IN(SELECT CompSno FROM Udf_GetCompList(@CompSno)))
          BEGIN
              Raiserror ('Item Group exists with this Code', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Loan_PerGram, Restrict_Type, Remarks, Active_Status, Create_Date, UserSno, CompSno)
        VALUES              (@Grp_Code, @Grp_Name, @Market_Rate, @Loan_PerGram, @Restrict_Type, @Remarks, @Active_Status, @Create_Date, @UserSno, @CompSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @GrpSno = @@IDENTITY

        UPDATE Transaction_Setup SET GrpCode_CurrentNo = GrpCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow	
			END	

	SET @RetSno = @GrpSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getItem_Groups') BEGIN DROP FUNCTION Udf_getItem_Groups END
GO
CREATE FUNCTION Udf_getItem_Groups(@GrpSno INT,@CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*, Grp_Name as Name, 'Loan per Gram:  ' + CAST(Loan_PerGram AS VARCHAR) as Details
	FROM	  Item_Groups
	WHERE	  (GrpSno=@GrpSno OR @GrpSno = 0) AND (CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
  
  
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Item_Groups_Delete') BEGIN DROP PROCEDURE Sp_Item_Groups_Delete END
GO
CREATE PROCEDURE Sp_Item_Groups_Delete
	@GrpSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT TransSno FROM Transactions WHERE GrpSno=@GrpSno)
				BEGIN
					Raiserror ('Transactions exists with this Item Group', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Item_Groups WHERE GrpSno=@GrpSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Locations') BEGIN DROP PROCEDURE Sp_Locations END
GO
CREATE PROCEDURE Sp_Locations
	@LocationSno INT,
  @Loc_Code VARCHAR(10),
  @Loc_Name VARCHAR(20),
  @Loc_Type TINYINT,
  @Remarks VARCHAR(50),
  @Active_Status     BIT,
  @Create_Date INT,
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT LocationSno FROM Locations WHERE LocationSno=@LocationSno)
			BEGIN
				UPDATE Locations SET  Loc_Code = @Loc_Code, Loc_Name = @Loc_Name, Loc_Type = @Loc_Type, Remarks = @Remarks, Active_Status = @Active_Status,
                                Create_Date = @Create_Date, UserSno  =  @UserSno,  CompSno = @CompSno
				WHERE LocationSno=@LocationSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN

         DECLARE @LocCode_AutoGen BIT
          SELECT @LocCode_AutoGen=LocCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @LocCode_AutoGen=1
          BEGIN
              SELECT @Loc_Code=TRIM(LocCode_Prefix)+CAST((LocCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End


        IF EXISTS(SELECT LocationSno FROM Locations WHERE Loc_Code=@Loc_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
          BEGIN
              Raiserror ('Location exists with this Code', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Locations(Loc_Code, Loc_Name, Loc_Type, Remarks, Active_Status, Create_Date, UserSno, CompSno)
        VALUES              (@Loc_Code, @Loc_Name, @Loc_Type, @Remarks, @Active_Status, @Create_Date, @UserSno, @CompSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @LocationSno = @@IDENTITY

        
        UPDATE Transaction_Setup SET LocCode_CurrentNo = LocCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow	
			END	

	SET @RetSno = @LocationSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLocations') BEGIN DROP FUNCTION Udf_getLocations END
GO
CREATE FUNCTION Udf_getLocations(@LocationSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*, Loc_Name as Name, ('Code: '+ Loc_Code + '  ' + CASE Loc_Type WHEN 1 THEN 'INTERNAL' ELSE 'EXTERNAL' END) AS Details 
	FROM	  Locations
	WHERE	  (LocationSno=@LocationSno OR @LocationSno = 0) AND (CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Location_Delete') BEGIN DROP PROCEDURE Sp_Location_Delete END
GO
CREATE PROCEDURE Sp_Location_Delete
	@LocationSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT TransSno FROM Transactions WHERE LocationSno=@LocationSno)
				BEGIN
					Raiserror ('Transactions exists with this Location', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Locations WHERE LocationSno=@LocationSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Items') BEGIN DROP PROCEDURE Sp_Items END
GO
CREATE PROCEDURE Sp_Items
	@ItemSno INT ,
  @Item_Code VARCHAR(10),
  @Item_Name VARCHAR(100),
  @GrpSno INT,
  @Remarks VARCHAR(50),
  @Active_Status     BIT,
  @Create_Date INT,
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS

BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT ItemSno FROM Items WHERE ItemSno=@ItemSno)
			BEGIN
				UPDATE Items SET  Item_Code = @Item_Code, Item_Name = @Item_Name, GrpSno = @GrpSno, Remarks = @Remarks, Active_Status = @Active_Status,
                                Create_Date = @Create_Date, UserSno  =  @UserSno,  CompSno = @CompSno
				WHERE ItemSno=@ItemSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN

        DECLARE @ItemCode_AutoGen BIT
          SELECT @ItemCode_AutoGen=ItemCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @ItemCode_AutoGen=1
          BEGIN
              SELECT @Item_Code=TRIM(ItemCode_Prefix)+CAST((ItemCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End


        IF EXISTS(SELECT ItemSno FROM Items WHERE Item_Code=@Item_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno))) 
          BEGIN
              Raiserror ('Items exists with this Code', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Items   (Item_Code, Item_Name, GrpSno, Remarks, Active_Status, Create_Date, UserSno, CompSno)
        VALUES              (@Item_Code,@Item_Name, @GrpSno, @Remarks, @Active_Status, @Create_Date, @UserSno, @CompSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @ItemSno = @@IDENTITY

        UPDATE Transaction_Setup SET ItemCode_CurrentNo = ItemCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow	
			END	

	SET @RetSno = @ItemSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getItems') BEGIN DROP FUNCTION Udf_getItems END
GO
CREATE FUNCTION Udf_getItems(@ItemSno INT, @GrpSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
  SELECT (	SELECT  It.*,
                    It.Item_Name as Name,
                    'Code: ' + It.Item_Code as Details,
                    Ig.GrpSno as 'IGroup.GrpSno',
                    Ig.Grp_Code as 'IGroup.Grp_Code',
                    Ig.Grp_Name as 'IGroup.Grp_Name',
                    Ig.Grp_Name as 'IGroup.Name',
                    ('Loan Per Gram: ' + CAST(Ig.Loan_PerGram AS VARCHAR)) as 'IGroup.Details'
			      FROM    Items It
					          INNER JOIN Item_Groups Ig ON Ig.GrpSno = It.GrpSno
            WHERE	  (ItemSno=@ItemSno OR @ItemSno = 0) AND (It.GrpSno = @GrpSno OR @GrpSno = 0) AND (It.CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))

            FOR JSON PATH) as Json_Result
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Item_Delete') BEGIN DROP PROCEDURE Sp_Item_Delete END
GO
CREATE PROCEDURE Sp_Item_Delete
	@ItemSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT DetSno FROM Transaction_Details WHERE ItemSno=@ItemSno)
				BEGIN
					Raiserror ('Transactions exists with this Item', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Items WHERE ItemSno=@ItemSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Purity') BEGIN DROP PROCEDURE Sp_Purity END
GO
CREATE PROCEDURE Sp_Purity
	@PuritySno INT,
  @Purity_Code VARCHAR(10),
  @Purity_Name VARCHAR(20),
  @Purity DECIMAL(4,2),
  @GrpSno INT,
  @Remarks VARCHAR(50),
  @Active_Status     BIT,
  @Create_Date INT,
  @UserSno INT,
  @CompSno INT,
  @BranchSno INT,
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF @Purity > 99.99
      BEGIN
          Raiserror ('Purity cannot be greate than 99.99 ', 16, 1) 
          GOTO CloseNow
      END

		IF EXISTS(SELECT PuritySno FROM Purity WHERE PuritySno=@PuritySno)
			BEGIN
				UPDATE Purity SET  Purity_Code = @Purity_Code, Purity_Name = @Purity_Name, Purity= @Purity, GrpSno=@GrpSno, Remarks = @Remarks, Active_Status = @Active_Status,
                                Create_Date = @Create_Date, UserSno  =  @UserSno,  CompSno = @CompSno
				WHERE PuritySno=@PuritySno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
         DECLARE @PurityCode_AutoGen BIT
          SELECT @PurityCode_AutoGen=PurityCode_AutoGen FROM Transaction_Setup WHERE BranchSno=@BranchSno
          IF @PurityCode_AutoGen=1
          BEGIN
              SELECT @Purity_Code=TRIM(PurityCode_Prefix)+CAST((PurityCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE BranchSno=@BranchSno
          End


        IF EXISTS(SELECT PuritySno FROM Purity WHERE Purity_Code=@Purity_Code AND CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))
          BEGIN
              Raiserror ('Purity exists with this Code', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Purity   (Purity_Code, Purity_Name,Purity, GrpSno, Remarks, Active_Status, Create_Date, UserSno, CompSno)
        VALUES              (@Purity_Code, @Purity_Name, @Purity, @GrpSno, @Remarks, @Active_Status, @Create_Date, @UserSno, @CompSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @PuritySno = @@IDENTITY

        UPDATE Transaction_Setup SET PurityCode_CurrentNo = PurityCode_CurrentNo + 1 WHERE BranchSno=@BranchSno
        IF @@ERROR <> 0 GOTO CloseNow	
			END	

	SET @RetSno = @PuritySno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getPurity') BEGIN DROP FUNCTION Udf_getPurity END
GO
CREATE FUNCTION Udf_getPurity(@PuritySno INT, @GrpSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
  SELECT  (     SELECT	Pur.*,Ig.GrpSno as 'IGroup.GrpSno', Ig.Grp_Code as 'IGroup.Grp_Code', Ig.Grp_Name as 'IGroup.Grp_Name', Ig.Grp_Name as 'IGroup.Name', ('Loan Per Gram: ' + CAST(Ig.Loan_PerGram AS VARCHAR)) as 'IGroup.Details',
                        Pur.Purity_Name as Name, ('Purity: ' + CAST(Pur.Purity AS VARCHAR) ) AS Details
	              FROM	  Purity Pur
                        INNER JOIN Item_Groups Ig ON Ig.GrpSno = Pur.GrpSno
	              WHERE	  (PuritySno=@PuritySno OR @PuritySno = 0) AND (Pur.GrpSno = @GrpSno OR @GrpSno = 0) AND (Pur.CompSno IN (SELECT CompSno FROM Udf_GetCompList(@CompSno)))

        FOR JSON PATH) as Json_Result

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Purity_Delete') BEGIN DROP PROCEDURE Sp_Purity_Delete END
GO
CREATE PROCEDURE Sp_Purity_Delete
	@PuritySno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			IF EXISTS (SELECT DetSno FROM Transaction_Details WHERE PuritySno=@PuritySno)
				BEGIN
					Raiserror ('Transactions exists with this Purity', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Purity WHERE PuritySno=@PuritySno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT name FROM SYS.OBJECTS WHERE NAME='GetVoucherXML') BEGIN DROP FUNCTION GetVoucherXML END
GO

CREATE FUNCTION [dbo].GetVoucherXML
( 
	@CompSno				    INT,
	@VouTypeSno				  INT,
	@PartySno				    INT,
	@IsOpen					    TINYINT,
	@Principal				  MONEY,
	@AdvIntAmount			  MONEY,
	@DocChargesAmt		  MONEY,
	@Rec_Principal		  MONEY,
	@Rec_Interest			  MONEY,
	@Rec_AddLess			  MONEY,
	@Rec_DefaultAmt		  MONEY,
	@Rec_Other_Debits	  MONEY,
	@Rec_Other_Credits  MONEY,
	@PayModeXml				  VARCHAR(MAX)
)

RETURNS VARCHAR(MAX)
WITH ENCRYPTION
AS

   BEGIN  

	DECLARE @LedSno INT = (SELECT LedSno FROM Party WHERE PartySno=@PartySno)
	DECLARE @RetXml VARCHAR(MAX) 

	  DECLARE @StdLedgerCashAc			    INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=2)
    DECLARE @StdLedgerProfitandLoss		INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=3)
    DECLARE @StdLedgerInterestIncome	INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=4)
    DECLARE @StdLedgerDocumentIncome	INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=5)
    DECLARE @StdLedgerDefaultIncome		INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=6)
    DECLARE @StdLedgerAddLess			    INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=7)
    DECLARE @StdLedgerOtherIncome		  INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=8)
    DECLARE @StdLedgerShortageExcess	INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=9)
    DECLARE @StdLedgerInterestPaid		INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=10)
    DECLARE @StdLedgerBankCharges		  INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=11)

	SET @RetXml = '<ROOT>'
	SET @RetXml = @RetXml + '<Voucher>'
			
			IF @VouTypeSno = 12  --Loan Payment
				BEGIN
					SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Debit="' + CAST(@Principal AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
					IF @IsOpen = 2
						BEGIN
              SET @RetXml = @RetXml + CASE WHEN @AdvIntAmount > 0 THEN  '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Debit="0"  Credit="' + CAST(@AdvIntAmount AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                +							
                            CASE WHEN @DocChargesAmt > 0 THEN  '<Voucher_Details LedSno="' + CAST(@StdLedgerDocumentIncome AS VARCHAR) + '" Debit="0"  Credit="' + CAST(@DocChargesAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                +
                            CAST(@PayModeXml AS VARCHAR(MAX))						    
						  END
				END
        
			ELSE IF @VouTypeSno = 13 --Loan Receipt
				BEGIN
          SET @RetXml = @RetXml + CASE WHEN @Rec_Principal > 0 THEN '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Debit="0" Credit="'+ CAST(@Rec_Principal AS VARCHAR) +'" > </Voucher_Details> ' ELSE '' END					
					IF @IsOpen = 2
						BEGIN
              SET @RetXml = @RetXml + CASE WHEN @Rec_Interest > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_Interest AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +
                            CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Debit="0" Credit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +
                            CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Debit="0" Credit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +							
                            CASE WHEN @Rec_AddLess < 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Debit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" Credit="0" > </Voucher_Details> ' ELSE '' END							
                                  +
                            CASE WHEN @Rec_DefaultAmt > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerDefaultIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_DefaultAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END							
                                  +
                            CASE WHEN @Rec_Other_Debits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_Other_Debits AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +
                            CASE WHEN @Rec_Other_Credits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Debit="' + CAST(@Rec_Other_Credits AS VARCHAR) + '" Credit="0" > </Voucher_Details> ' ELSE '' END
                                  +
                            CAST(@PayModeXml AS VARCHAR(MAX))                
						END
				  END

			  ELSE IF @VouTypeSno = 14 --Loan Redemption
				  BEGIN
            SET @RetXml = @RetXml + CASE WHEN @Rec_Principal > 0 THEN '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Debit="0" Credit="'+ CAST(@Rec_Principal AS VARCHAR) +'" > </Voucher_Details> ' ELSE '' END
                                          +					  
                                    CASE WHEN @Rec_Interest > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_Interest AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END						
                                          +
                                    CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Debit="0" Credit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                          +						
                                    CASE WHEN @Rec_AddLess < 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Debit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" Credit="0" > </Voucher_Details> ' ELSE '' END
                                          +						
                                    CASE WHEN @Rec_DefaultAmt > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerDefaultIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_DefaultAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                          +
                                    CASE WHEN @Rec_Other_Debits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Debit="0" Credit="' + CAST(@Rec_Other_Debits AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                          +
                                    CASE WHEN  @Rec_Other_Credits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Debit="' + CAST(@Rec_Other_Credits AS VARCHAR) + '" Credit="0" > </Voucher_Details> ' ELSE '' END						
                                          +
                                    CAST(@PayModeXml AS VARCHAR(MAX))						                
				  END

        ELSE IF @VouTypeSno = 17 -- Repledge
				  BEGIN
            SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="' + CAST(@Principal AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'
					  IF @IsOpen = 2
						  BEGIN
                SET @RetXml = @RetXml + CASE WHEN @AdvIntAmount > 0 THEN  '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Credit="0"  Debit="' + CAST(@AdvIntAmount AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +							
                              CASE WHEN @DocChargesAmt > 0 THEN  '<Voucher_Details LedSno="' + CAST(@StdLedgerDocumentIncome AS VARCHAR) + '" Credit="0"  Debit="' + CAST(@DocChargesAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                  +
                              CAST(@PayModeXml AS VARCHAR(MAX))						    
						    END				                
				  END

        ELSE IF @VouTypeSno = 18 --Repledge Payment
				  BEGIN
            SET @RetXml = @RetXml + CASE WHEN @Rec_Principal > 0 THEN '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="0" Debit="'+ CAST(@Rec_Principal AS VARCHAR) +'" > </Voucher_Details> ' ELSE '' END					
					  IF @IsOpen = 2
						  BEGIN
                SET @RetXml = @RetXml + CASE WHEN @Rec_Interest > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_Interest AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                    +
                              CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Credit="0" Debit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                    +
                              CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Credit="0" Debit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                    +							
                              CASE WHEN @Rec_AddLess < 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Credit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" Debit="0" > </Voucher_Details> ' ELSE '' END							
                                    +
                              CASE WHEN @Rec_DefaultAmt > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerDefaultIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_DefaultAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END							
                                    +
                              CASE WHEN @Rec_Other_Debits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_Other_Debits AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                    +
                              CASE WHEN @Rec_Other_Credits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Credit="' + CAST(@Rec_Other_Credits AS VARCHAR) + '" Debit="0" > </Voucher_Details> ' ELSE '' END
                                    +
                              CAST(@PayModeXml AS VARCHAR(MAX))                
						  END
				   END

        ELSE IF @VouTypeSno = 19 --Repledge Closure
				BEGIN
          SET @RetXml = @RetXml + CASE WHEN @Rec_Principal > 0 THEN '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="0" Debit="'+ CAST(@Rec_Principal AS VARCHAR) +'" > </Voucher_Details> ' ELSE '' END
                                        +					  
                                  CASE WHEN @Rec_Interest > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerInterestIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_Interest AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END						
                                        +
                                  CASE WHEN @Rec_AddLess > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Credit="0" Debit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                        +						
                                  CASE WHEN @Rec_AddLess < 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerAddLess AS VARCHAR) + '" Credit="' + CAST(ABS(@Rec_AddLess) AS VARCHAR) + '" Debit="0" > </Voucher_Details> ' ELSE '' END
                                        +						
                                  CASE WHEN @Rec_DefaultAmt > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerDefaultIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_DefaultAmt AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                        +
                                  CASE WHEN @Rec_Other_Debits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Credit="0" Debit="' + CAST(@Rec_Other_Debits AS VARCHAR) + '" > </Voucher_Details> ' ELSE '' END
                                        +
                                  CASE WHEN  @Rec_Other_Credits > 0 THEN '<Voucher_Details LedSno="' + CAST(@StdLedgerOtherIncome AS VARCHAR) + '" Credit="' + CAST(@Rec_Other_Credits AS VARCHAR) + '" Debit="0" > </Voucher_Details> ' ELSE '' END						
                                        +
                                  CAST(@PayModeXml AS VARCHAR(MAX))						                
				END
	
	SET @RetXml = @RetXml + '</Voucher>'
	SET @RetXml = @RetXml + '</ROOT>'

  
	RETURN @RetXml
  END
  
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transactions') BEGIN DROP PROCEDURE Sp_Transactions END
GO
CREATE PROCEDURE Sp_Transactions
	@TransSno				      INT,
	@VouTypeSno				    INT,
	@SeriesSno				    INT,
	@Trans_No				      VARCHAR(20),

  /*FOR REPLEDGE */
	@Ref_No					      VARCHAR(20),
	@BorrowerSno			    INT,
	
	@Trans_Date				    INT,
	@PartySno				      INT,
	@SchemeSno				    INT,
	@GrpSno					      INT,
	@TotQty					      TINYINT,
	@TotGrossWt				    DECIMAL(8,3),
	@TotNettWt				    DECIMAL(8,3),
  @TotPureWt				    DECIMAL(8,3),
	@Market_Value			    MONEY,

  @Market_Rate          MONEY,
  @Loan_PerGram         MONEY,

	@Principal				    MONEY,
	@Roi					        DECIMAL(4,2),
	@AdvIntDur				    TINYINT,
	@AdvIntAmt				    MONEY,
	@DocChargesPer			  DECIMAL(2,1),
	@DocChargesAmt			  MONEY,

  @Emi_Due_Amt          MONEY,
  @OrgEmi_Due_Amt       MONEY,
  @Due_Start_Date       INT,
  @Emi_Principal        MONEY,
  @Emi_Interest         MONEY,
	
	/* FOR RECEIPT */
	@RefSno				        INT,
	@Rec_Principal			  MONEY,
	@Rec_IntMonths			  MONEY,
	@Rec_IntDays			    MONEY,
	@Rec_Interest			    MONEY,
	@Rec_Other_Credits		MONEY,
	@Rec_Other_Debits		  MONEY,
	@Rec_Default_Amt		  MONEY,
	@Rec_Add_Less			    MONEY,
  @Rec_DuesCount        TINYINT,
  @Rec_DueAmount        MONEY,

  /*FOR REDEMPTION */
	@Red_Method				    TINYINT,  
	@Nett_Payable			    MONEY,
	@Mature_Date			    INT,
	@PayModeSno				    INT,
	@LocationSno			    INT,
  @AgentSno             INT,
	@Remarks				      VARCHAR(100),
	
	@VouSno					      INT,
	@UserSno				      INT,
	@CompSno				      INT,
	@BranchSno				    INT,
	@ItemDetailXML			  XML,
	@ImageDetailXML			  XML,
  @RepledgeLoansXML     XML,
	@PaymentModesXML		  XML,
	@RetSno					      INT OUTPUT,
	@RetTrans_No			    VARCHAR(20) OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF (@VouTypeSno=0) OR (@SeriesSno=0) OR (@UserSno=0) OR (@CompSno=0)
      BEGIN
          Raiserror ('Server responded with some mandatory values missing like VouType, Series, User, Party or Company', 16, 1) 
          GOTO CloseNow
      END

    IF (@Trans_Date < 20000101) OR (@Trans_Date > 20500101)
      BEGIN
          Raiserror ('Invalid Date. Date is not in correct format', 16, 1) 
          GOTO CloseNow
      END

	IF EXISTS(SELECT TransSno FROM Transactions WHERE TransSno=@TransSno)
			BEGIN

        IF (@VouTypeSno = 12) AND EXISTS(SELECT TransSno FROM Transactions WHERE (VouTypeSno=13 OR VouTypeSno=14) AND RefSno=@TransSno)
          BEGIN
            Raiserror ('Cannot alter Loan when Receipt or Redemption exists', 16, 1) 
            GOTO CloseNow
          END

        IF EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=@TransSno)
          BEGIN
            Raiserror ('Cannot alter when this Document is referenced in other document', 16, 1) 
            GOTO CloseNow
          END


				UPDATE Transactions SET   VouTypeSno = @VouTypeSno, SeriesSno = @SeriesSno, Trans_No = @Trans_No, Ref_No = @Ref_No, BorrowerSno = @BorrowerSno, Trans_Date = @Trans_Date, PartySno = @PartySno, SchemeSno = @SchemeSno,
	                                GrpSno = @GrpSno, TotQty = @TotQty,	TotGrossWt = @TotGrossWt,	TotNettWt = @TotNettWt,	TotPureWt=@TotPureWt, Market_Value = @Market_Value, Market_Rate=@Market_Rate, Loan_PerGram=@Loan_PerGram,
                                  Principal = @Principal,	Roi = @Roi,	AdvIntDur = @AdvIntDur,	AdvIntAmt = @AdvIntAmt, DocChargesPer = @DocChargesPer, Emi_Due_Amt=@Emi_Due_Amt, OrgEmi_Due_Amt=@OrgEmi_Due_Amt,
                                  Due_Start_Date=@Due_Start_Date, Emi_Principal=@Emi_Principal, Emi_Interest=@Emi_Interest, DocChargesAmt = @DocChargesAmt,	RefSno  = @RefSno,	Rec_Principal = @Rec_Principal,
                                  Rec_IntMonths = @Rec_IntMonths,	Rec_IntDays = @Rec_IntDays, Rec_Interest = @Rec_Interest, Rec_Other_Credits = @Rec_Other_Credits,	Rec_Other_Debits = @Rec_Other_Debits,
                                  Rec_Default_Amt = @Rec_Default_Amt,	Rec_Add_Less = @Rec_Add_Less, Rec_DuesCount=@Rec_DuesCount, Rec_DueAmount=@Rec_DueAmount, Red_Method = @Red_Method, Nett_Payable = @Nett_Payable, Mature_Date = @Mature_Date,	PayModeSno = @PayModeSno,
                                  LocationSno = @LocationSno, AgentSno=@AgentSno,Remarks = @Remarks,	UserSno = @UserSno, CompSno = @CompSno,BranchSno=@BranchSno					  
				WHERE TransSno=@TransSno
				IF @@ERROR <> 0 GOTO CloseNow

				DELETE FROM Transaction_Details WHERE TransSno = @TransSno
				IF @@ERROR <> 0 GOTO CloseNow

				DELETE FROM Image_Details WHERE TransSno = @TransSno AND Image_Grp=2
				IF @@ERROR <> 0 GOTO CloseNow

				DELETE FROM PaymentMode_Details WHERE TransSno = @TransSno 
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Repledge_Details WHERE TransSno = @TransSno 
				IF @@ERROR <> 0 GOTO CloseNow        
			END
		ELSE
			BEGIN

        IF (@VouTypeSno=14)
          BEGIN
              DECLARE @RpStatus TINYINT
              SELECT @RpStatus = Repledge_Status FROM VW_REPLEDGES WHERE RepledgeSno = (SELECT MAX(TransSno) FROM Repledge_Details WHERE LoanSno=@RefSno)
              SET @RpStatus = ISNULL(@RpStatus,0)
              IF (@RpStatus = 1) OR (@RpStatus=3)
                BEGIN
                  Raiserror ('Cannot Close the Loan when Repledge exists for this Loan', 16, 1) 
                  GOTO CloseNow
                END
          END

        DECLARE @Num_Method TINYINT
        SELECT @Num_Method=Num_Method FROM Voucher_Series WHERE SeriesSno=@SeriesSno

        IF (@Num_Method=2)
        BEGIN
            SET @Trans_No= [dbo].GenerateVoucherNo(@SeriesSno)               
        END

        IF EXISTS(SELECT TransSno FROM Transactions WHERE Trans_No=@Trans_No AND CompSno=@CompSno)
          BEGIN
              Raiserror ('Transaction exists with this Number', 16, 1) 
              GOTO CloseNow
          END

      	INSERT INTO Transactions (VouTypeSno, SeriesSno, Trans_No, Ref_No, BorrowerSno, Trans_Date, PartySno, SchemeSno, GrpSno, TotQty, TotGrossWt, TotNettWt, TotPureWt,	Market_Value, Market_Rate, Loan_PerGram,	Principal, Roi,
                                  AdvIntDur, AdvIntAmt, DocChargesPer, DocChargesAmt, Emi_Due_Amt, OrgEmi_Due_Amt, Due_Start_Date, Emi_Principal, Emi_Interest, RefSno, Rec_Principal, Rec_IntMonths,	Rec_IntDays, Rec_Interest, Rec_Other_Credits,	Rec_Other_Debits,
                                  Rec_Default_Amt,	Rec_Add_Less, Rec_DuesCount, Rec_DueAmount, Red_Method,	Nett_Payable, Mature_Date,	PayModeSno,	LocationSno, AgentSno, Remarks, UserSno,	CompSno, BranchSno)
        VALUES                    (@VouTypeSno, @SeriesSno, @Trans_No, @Ref_No, @BorrowerSno, @Trans_Date, @PartySno, @SchemeSno, @GrpSno, @TotQty, @TotGrossWt, @TotNettWt, @TotPureWt, @Market_Value, @Market_Rate, @Loan_PerGram,	@Principal, @Roi,
                                  @AdvIntDur, @AdvIntAmt, @DocChargesPer, @DocChargesAmt, @Emi_Due_Amt, @OrgEmi_Due_Amt, @Due_Start_Date, @Emi_Principal, @Emi_Interest, @RefSno, @Rec_Principal, @Rec_IntMonths,	@Rec_IntDays, @Rec_Interest, @Rec_Other_Credits,	@Rec_Other_Debits,
                                  @Rec_Default_Amt,	@Rec_Add_Less, @Rec_DuesCount, @Rec_DueAmount, @Red_Method,	@Nett_Payable, @Mature_Date,	@PayModeSno,	@LocationSno,	@AgentSno, @Remarks, @UserSno,	@CompSno,@BranchSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @TransSno = @@IDENTITY

        DECLARE @Enable_AutoApproval BIT
        SELECT @Enable_AutoApproval= Enable_AutoApproval FROM Transaction_Setup WHERE BranchSno=@BranchSno

        IF @Enable_AutoApproval = 1
          BEGIN
            INSERT INTO Status_Updation(Updation_Date, Updation_Type, Document_Type, TransSno, UserSno, Remarks) VALUES ( [dbo].DateToInt(GETDATE()), 1, 1, @TransSno, @UserSno, '')
            IF @@ERROR <> 0 GOTO CloseNow								
          END


        IF (@Num_Method <> 0)
        BEGIN
          UPDATE Voucher_Series SET Current_No = Current_No + 1 WHERE SeriesSno=@SeriesSno
          IF @@ERROR <> 0 GOTO CloseNow
        END

			END

	DECLARE	@IsOpen TINYINT = CASE WHEN @Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=@CompSno) THEN 1 ELSE 2 END
  DECLARE  @VouDetailXML XML  = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @PartySno, @IsOpen, @Principal, @AdvIntAmt, @DocChargesAmt, @Rec_Principal, @Rec_Interest, @Rec_Add_Less, @Rec_Default_Amt,  @Rec_Other_Debits,
	                                        @Rec_Other_Credits, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML) 

                                          
  EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Trans_No,  @Trans_Date, '', 0, 1, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
  UPDATE Transactions SET VouSno=@VouSno WHERE TransSno=@TransSno

   IF @ItemDetailXML IS NOT NULL
          BEGIN
              --For Inserting into Subtable
              DECLARE @idoc        INT
              DECLARE @doc         XML
              DECLARE @Sno         INT     
              DECLARE @ItemSno     INT
              DECLARE @Qty         TINYINT
              DECLARE @GrossWt     DECIMAL(8,3)
              DECLARE @StoneWt     DECIMAL(8,3)
              DECLARE @NettWt      DECIMAL(8,3)
              DECLARE @PuritySno   INT                 
              DECLARE @ItemValue   MONEY
              DECLARE @IteRemarks  VARCHAR(30)
                              
              /*Declaring Temporary Table for Details Table*/
              DECLARE @DetTable Table
              (
                  Sno INT IDENTITY(1,1),ItemSno INT,Qty TINYINT,GrossWt DECIMAL(8,3),StoneWt DECIMAL(8,3),NettWt DECIMAL(8,3),PuritySno INT,ItemValue MONEY,IteRemarks VARCHAR(30)
              )
              Set @doc=@ItemDetailXML
              Exec sp_xml_preparedocument @idoc Output, @doc
             
              /*Inserting into Temporary Table from Passed XML File*/
              INSERT INTO @DetTable
              (
                  ItemSno,Qty,GrossWt,StoneWt,NettWt,PuritySno,ItemValue,IteRemarks
              )
             
              SELECT  * FROM  OpenXml 
              (
                  @idoc, '/ROOT/Transaction/Transaction_Details',2
              )
              WITH 
              (
                  ItemSno INT '@ItemSno',Qty TINYINT '@Qty',GrossWt DECIMAL(8,3) '@GrossWt',StoneWt DECIMAL(8,3) '@StoneWt', NettWt DECIMAL(8,3) '@NettWt',PuritySno INT '@PuritySno',ItemValue MONEY '@ItemValue',IteRemarks VARCHAR(30) '@IteRemarks'
              )
              SELECT  TOP 1 @Sno=Sno,@ItemSno=ItemSno,@Qty=Qty,@GrossWt=GrossWt,@StoneWt=StoneWt,@NettWt=NettWt,@PuritySno=PuritySno,@ItemValue=ItemValue,@IteRemarks=IteRemarks
              FROM @DetTable
                  
              /*Taking from Temporary Details Table and inserting into details table here*/
              WHILE @@ROWCOUNT <> 0 
                  BEGIN
                      INSERT INTO Transaction_Details(TransSno,ItemSno,Qty,Gross_Wt,Stone_Wt,Nett_Wt,PuritySno,Item_Value,Remarks) 
                      VALUES (@TransSno,@ItemSno,@Qty,@GrossWt,@StoneWt,@NettWt,@PuritySno,@ItemValue,@IteRemarks)
                      IF @@Error <> 0 GOTO CloseNow
             
                    DELETE FROM @DetTable WHERE Sno = @Sno

                    SELECT  TOP 1 @Sno=Sno,@ItemSno=ItemSno,@Qty=Qty,@GrossWt=GrossWt,@StoneWt=StoneWt,@NettWt=NettWt,@PuritySno=PuritySno,@ItemValue=ItemValue,@IteRemarks=IteRemarks
                    FROM @DetTable
                  END
              Exec Sp_Xml_Removedocument @idoc
          END

   IF @ImageDetailXML IS NOT NULL
              BEGIN                     

                  DECLARE @idoc1       INT
                  DECLARE @doc1        XML
                  DECLARE @Image_Name  VARCHAR(50)
                  DECLARE @Image_Url   VARCHAR(100)
                                              
                  /*Declaring Temporary Table for Details Table*/
                  DECLARE @ImgTable Table
                  (
                      Sno INT IDENTITY(1,1),Image_Name VARCHAR(50), Image_Url VARCHAR(200)
                  )
                  Set @doc1=@ImageDetailXML
                  Exec sp_xml_preparedocument @idoc1 Output, @doc1
             
                  /*Inserting into Temporary Table from Passed XML File*/
                  INSERT INTO @ImgTable
                  (
                      Image_Name, Image_Url
                  )
             
                  SELECT  * FROM  OpenXml 
                  (
                      @idoc1, '/ROOT/Images/Image_Details',2
                  )
                  WITH 
                  (
                      Image_Name VARCHAR(50) '@Image_Name', Image_Url VARCHAR(100) '@Image_Url'
                  )
                  SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                  FROM @ImgTable
                  
                  /*Taking from Temporary Details Table and inserting into details table here*/
                  WHILE @@ROWCOUNT <> 0 
                      BEGIN
                          INSERT INTO [dbo].Image_Details(TransSno,Image_Grp, Image_Name, Image_Url) 
                          VALUES (@TransSno,2, @Image_Name, (@Image_Url + '/'+@Trans_No+'/'+ @Image_Name))
                          IF @@Error <> 0 GOTO CloseNow
             
                          DELETE FROM @ImgTable WHERE Sno = @Sno
                          SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                          FROM   @ImgTable
                      END
                  Exec Sp_Xml_Removedocument @idoc1
            END
            
   IF @PaymentModesXML IS NOT NULL
      BEGIN
			DECLARE @XmlPrefix VARCHAR(20) =  '<ROOT> <Voucher>'
			DECLARE @XmlSuffix VARCHAR(20) =  '</Voucher> </ROOT> '
			SET @PaymentModesXML = @XmlPrefix + CAST(@PaymentModesXML AS VARCHAR(MAX)) + @XmlSuffix
         DECLARE @idoc2       INT
         DECLARE @Sno2        INT 
         DECLARE @LedSno     INT
         DECLARE @Debit      MONEY
         DECLARE @Credit     MONEY
        
         DECLARE @DetTable2 TABLE
             (
             Sno INT IDENTITY(1,1),LedSno INT,Debit MONEY,Credit MONEY
             )
         Exec sp_xml_preparedocument @idoc2 OUTPUT, @PaymentModesXML
        
         INSERT INTO @DetTable2
             (
              LedSno,Debit,Credit
             )
         SELECT  * FROM  OpenXml 
             (
              @idoc2, '/ROOT/Voucher/Voucher_Details',2
             )
         WITH 
            (
              LedSno INT '@LedSno',Debit MONEY '@Debit',Credit MONEY '@Credit'
            )
         SELECT      TOP 1 @Sno2=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                     FROM @DetTable2
        /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
         WHILE @@ROWCOUNT <> 0 
             BEGIN 
                 INSERT INTO PaymentMode_Details(TransSno,LedSno,Amount) 
                 VALUES (@TransSno,@LedSno,CASE WHEN @Debit=0 THEN @Credit ELSE @Debit END)
                 IF @@Error <> 0 GOTO CloseNow
                 DELETE FROM @DetTable2 WHERE Sno = @Sno2
                 
				 SELECT      TOP 1 @Sno2=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                 FROM        @DetTable2
             END
         Exec Sp_Xml_Removedocument @idoc2
      END

    IF @RepledgeLoansXML IS NOT NULL
          BEGIN                                 
              DECLARE @RpLoanSno     INT               
              DECLARE @DetTableRP Table
              (
                  Sno INT IDENTITY(1,1),LoanSno INT
              )
              Set @doc=@RepledgeLoansXML
              Exec sp_xml_preparedocument @idoc Output, @doc
                           
              INSERT INTO @DetTableRP
              (
                  LoanSno
              )
             
              SELECT  * FROM  OpenXml 
              (
                  @idoc, '/ROOT/Loans/Loan',2
              )
              WITH 
              (
                  LoanSno INT '@LoanSno'
              )

              SELECT  TOP 1 @Sno=Sno,@RpLoanSno=LoanSno
              FROM @DetTableRp
              
              WHILE @@ROWCOUNT <> 0 
                  BEGIN                  
                      INSERT INTO Repledge_Details(TransSno,LoanSno) 
                      VALUES (@TransSno,@RpLoanSno)
                      IF @@Error <> 0 GOTO CloseNow
             
                    DELETE FROM @DetTableRp WHERE Sno = @Sno

                    SELECT  TOP 1 @Sno=Sno,@RpLoanSno=LoanSno
                    FROM @DetTableRp
                  END
              Exec Sp_Xml_Removedocument @idoc
          END

  SET @RetSno = @TransSno
  SET @RetTrans_No = @Trans_No
	COMMIT TRANSACTION
	RETURN @TransSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getTransactions') BEGIN DROP FUNCTION Udf_getTransactions END
GO
CREATE FUNCTION Udf_getTransactions(@TransSno INT, @CompSno INT, @BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*
	FROM	  Transactions           
	WHERE	  (TransSno=@TransSno OR @TransSno=0) AND (CompSno=@CompSno) AND (BranchSno=@BranchSno OR @BranchSno=0)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transaction_Delete') BEGIN DROP PROCEDURE Sp_Transaction_Delete END
GO
CREATE PROCEDURE Sp_Transaction_Delete
	@TransSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION					
      DECLARE @VouSno INT = (SELECT VouSno FROM Transactions WHERE TransSno=@TransSno)
      IF EXISTS (SELECT TransSno FROM Transactions WHERE RefSno=@TransSno)
        BEGIN
          Raiserror ('Cannot Delete. Transactions exists referring this Transaction', 16, 1) 
          GOTO CloseNow
        END
			DELETE FROM Transactions WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM PaymentMode_Details WHERE TransSno=@TransSno 
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Vouchers WHERE VouSno=@VouSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Voucher_Details WHERE VouSno=@VouSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Transaction_Details WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Repledge_Details WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Image_Details WHERE TransSno=@TransSno AND Image_Grp = 2
			IF @@ERROR <> 0 GOTO CloseNow

	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Loan_Payments') BEGIN DROP PROCEDURE Sp_Loan_Payments END
GO
CREATE PROCEDURE Sp_Loan_Payments
@LoanSno INT,
@PaymentsXML XML
WITH ENCRYPTION AS
BEGIN
SET NOCOUNT ON 
	BEGIN TRANSACTION
  DELETE FROM Loan_Payments WHERE LoanSno=@LoanSno
  IF @PaymentsXML IS NOT NULL
             BEGIN
                
                IF @@Error <> 0 GOTO CloseNow
                 --For Inserting into Subtable
                 DECLARE @idoc        INT
                 DECLARE @doc         XML
                 DECLARE @Sno         INT
                 DECLARE @Pmt_Date     INT
                 DECLARE @Amount      MONEY
                 DECLARE @Remarks         VARCHAR(100)
                                               
                 /*Declaring Temporary Table for Details Table*/
                 DECLARE @DetTable Table
                 (
                     Sno INT IDENTITY(1,1),Pmt_Date INT,Amount MONEY, Remarks VARCHAR(100)
                 )
                 Set @doc=@PaymentsXML
                 Exec sp_xml_preparedocument @idoc Output, @doc
             
                 /*Inserting into Temporary Table from Passed XML File*/
                 INSERT INTO @DetTable
                 (
                     Pmt_Date, Amount, Remarks
                 )
             
                 SELECT  * FROM  OpenXml 
                 (
                     @idoc, '/ROOT/Payments/Payment_Details',2
                 )
                 WITH 
                 (
                     Pmt_Date INT '@Pmt_Date', Amount MONEY '@Amount', Remarks VARCHAR(100) '@Remarks'
                 )
                 SELECT  TOP 1 @Sno=Sno,@Pmt_Date=Pmt_Date,@Amount=Amount, @Remarks=Remarks
                 FROM @DetTable
                  
                 /*Taking from Temporary Details Table and inserting into details table here*/
                 WHILE @@ROWCOUNT <> 0 
                     BEGIN
                         INSERT INTO Loan_Payments(Pmt_Date, LoanSno, Amount, Remarks) 
                         VALUES (@Pmt_Date, @LoanSno, @Amount, @Remarks)
                         IF @@Error <> 0 GOTO CloseNow
             
                        DELETE FROM @DetTable WHERE Sno = @Sno

                        SELECT  TOP 1 @Sno=Sno,@Pmt_Date=Pmt_Date,@Amount=Amount, @Remarks=Remarks
                        FROM @DetTable
                     END
                 Exec Sp_Xml_Removedocument @idoc
             END
             COMMIT TRANSACTION
	RETURN @LoanSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0

END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_InsertDefaults') BEGIN DROP PROCEDURE Sp_InsertDefaults END
GO
CREATE PROCEDURE Sp_InsertDefaults
  @CompSno INT
AS
BEGIN

  DECLARE @DivSno INT = 0;
  INSERT INTO Divisions(Div_Code, Div_Name,	Remarks,	Create_Date, CompSno )
  VALUES ('MAIN','MAIN DIVISION','',[dbo].DateToInt(GETDATE()),@CompSno)
  SET @DivSno = @@IDENTITY

  DECLARE @BranchSno INT = 0
  INSERT INTO Branches(Branch_Code,Branch_Name,Remarks,DivSno,Active_Status,Create_Date,UserSno,CompSno)
  VALUES ('MAIN', 'MAIN BRANCH', '',@DivSno, 0, [dbo].DateToInt(GETDATE()) ,1,@CompSno)
  SET @BranchSno = @@IDENTITY

  INSERT INTO Agent(Agent_Code,	Agent_Name,	Remarks, Create_Date,	CompSno, BranchSno)
  VALUES ('MAIN','MAIN AGENT','',[dbo].DateToInt(GETDATE()),@CompSno,@BranchSno)

  EXEC Sp_InsertSeriesDefaults @CompSno,@BranchSno

  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('','',1,0,'G001GL000L',1,0,@CompSno,1,1)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('CashA/c','Cash A/c',22,0,'G001GG007GG022GL000L',1,0,@CompSno,1,2)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Profit & Loss A/c','Profit & Loss A/c',1,0,'G001GL000L',1,0,@CompSno,1,3)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('InterestIncomeA/c','Interest Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,4)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('DocumentIncomeA/c','Document Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,5)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('DefaultIncomeA/c','Default Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,6)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Add/Less','Add/Less',26,0,'G001GG026GL000L',1,0,@CompSno,1,7)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('OtherIncomeA/c','Other Income A/c',4,0,'G001GG026GL000L',1,0,@CompSno,1,8)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Shortage&ExcessA/c','Shortage & Excess A/c',4,0,'G001GG004GL000L',1,0,@CompSno,1,9)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Interest PaidA/c','Interest Paid A/c',27,0,'G001GG027GL000L',1,0,@CompSno,1,10)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Bank ChargesA/c','Bank Charges A/c',27,0,'G001GG027GL000L',1,0,@CompSno,1,11)

  /* INSERTIN INTO Companies_Ledger_Groups For Each Companies for Accouting Purpose */

  INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Primary','Primary',1,0,'G001G',0,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CapitalAccount','Capital Account',1,1,'G001GG002G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Loans(Liability)','Loans(Liability)',1,1,'G001GG003G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CurrentLiabilities','Current Liabilities',1,1,'G001GG004G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('FixedAssets','Fixed Assets',1,1,'G001GG005G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Investments','Investments',1,1,'G001GG006G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CurrentAssets','Current Assets',1,1,'G001GG007G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno    )
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Branch/Divisions','Branch / Divisions',1,1,'G001GG008G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Misc.Expenses(Asset)','Misc.Expenses(Asset)',1,1,'G001GG009G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SuspenseA/c','Suspense A/c',1,1,'G001GG010G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Reserves&Surplus','Reserves & Surplus',2,2,'G001GG002GG011G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('BankODA/c','Bank OD A/c',3,2,'G001GG003GG012G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SecuredLoans','Secured Loans',3,2,'G001GG003GG013G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('UnSecuredLoans','UnSecured Loans',3,2,'G001GG003GG014G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Duties&Taxes','Duties & Taxes',4,2,'G001GG004GG015G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Provisions','Provisions',4,2,'G001GG004GG016G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SundryCreditors','Sundry Creditors',4,2,'G001GG004GG017G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('StockinHand','Stock in Hand',7,2,'G001GG007GG018G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Deposits(Asset)','Deposits (Asset)',7,2,'G001GG007GG019G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Loans&Adv(Asset)','Loans&Adv(Asset)',7,2,'G001GG007GG020G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SundryDebtors','Sundry Debtors',7,2,'G001GG007GG021G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CashInHand','Cash In Hand',7,2,'G001GG007GG022G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('BankAccounts','Bank Accounts',7,2,'G001GG007GG023G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SalesAccounts','Sales Accounts',1,1,'G001GG024G',4,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('PurchaseAccounts','Purchase Accounts',1,1,'G001GG025G',3,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('DirectIncomes','Direct Incomes',1,1,'G001GG026G',4,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('DirectExpenses','Direct Expenses',1,1,'G001GG027G',3,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('IndirectIncomes','Indirect Incomes',1,1,'G001GG028G',4,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('IndirectExpenses','Indirect Expenses',1,1,'G001GG029G',3,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Agent/Broker','Agent/Broker',1,1,'G001GG030G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
  INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Loan Party(s)','Loan Party(s)',7,2,'G001GG007GG031G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
  INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('RePledge Party(s)','RePledge Party(s)',4,2,'G001GG004GG033G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)  


  INSERT INTO Area (Area_Code,Area_Name,Remarks,Active_Status,Create_Date,UserSno,CompSno) VALUES ('PRIMARY','PRIMARY','',1,dbo.DateToInt(GETDATE()),1,@CompSno)
  
  
  INSERT INTO Schemes(Scheme_Code,Scheme_Name, Roi, EmiDues, OrgRoi, IsStdRoi, Calc_Basis, Calc_Method, Custom_Style, Payment_Frequency, Enable_AmtSlab, Preclosure_Days, Min_CalcDays, Grace_Days, LpYear,
                      LpMonth, LpDays, Min_MarketValue, Max_MarketValue, Active_Status, AdvanceMonth, ProcessingFeePer, Min_LoanValue, Max_LoanValue, Enable_FeeSlab, SeriesSno,
                      Create_Date, Remarks, UserSno, CompSno)
  VALUES ('STD','STANDARD',24, 0, 24, 0, 2,0, 0,0 ,0, 30, 15, 3, 1, 0, 7, 0, 100, 1, 1, 0, 0, 0, 0, 12,[dbo].DateToInt(GETDATE()),'', 1, @CompSno)


  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Loan_PerGram, Restrict_Type, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('GOLD', 'GOLD',6000, 4500, 1, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)
  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Loan_PerGram, Restrict_Type, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('SILVER', 'SILVER',3000, 500, 1, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)

  INSERT INTO Locations (Loc_Code, Loc_Name, Loc_Type, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('PRIMARY', 'PRIMARY',1,'',1,[dbo].DateToInt(GETDATE()), 1, @CompSno)

  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('1','RING',1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('2','CHAIN',1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('3','BRACELET',1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('4','JIMIKKI',1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('5','NECKLACE',1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')

  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('6','KOLUSU',2,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Active_Status, Create_Date, UserSno, CompSno,Remarks)
  VALUES ('7','BRACELET',2,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'')

  INSERT INTO Purity(Purity_Code,Purity_Name, Purity, GrpSno, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('DEF','DEF 100',99.99,1,'',1,[dbo].DateToInt(GETDATE()),1,@CompSno)
  INSERT INTO Purity(Purity_Code,Purity_Name, Purity, GrpSno, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('916','916',91.6,1,'',1,[dbo].DateToInt(GETDATE()),1,@CompSno) 

  
  INSERT INTO Transaction_Setup(      AreaCode_AutoGen, AreaCode_Prefix, AreaCode_CurrentNo, PartyCode_AutoGen,PartyCode_Prefix, PartyCode_CurrentNo, SuppCode_AutoGen,SuppCode_Prefix,
                                      SuppCode_CurrentNo,BwrCode_AutoGen, BwrCode_Prefix, BwrCode_CurrentNo, GrpCode_AutoGen, GrpCode_Prefix, GrpCode_CurrentNo,
                                      ItemCode_AutoGen, ItemCode_Prefix, ItemCode_CurrentNo, SchemeCode_AutoGen, SchemeCode_Prefix, SchemeCode_CurrentNo, LocCode_AutoGen, LocCode_Prefix,
                                      LocCode_CurrentNo, PurityCode_AutoGen, PurityCode_Prefix, PurityCode_CurrentNo, BranchCode_AutoGen, BranchCode_Prefix, BranchCode_CurrentNo,
                                      Enable_Opening, Enable_RegLang, Reg_FontName, Reg_FontSize, Enable_FingerPrint, MakeFp_Mandatory, Allow_NullInterest, Show_CashBalance,
                                      Images_Mandatory, Enable_ReturnImage, Allow_DuplicateItems, Disable_AddLess, Entries_LockedUpto, Enable_Authentication, Enable_OldEntries,
                                      CompSno,BranchSno,MobileNumberMandatory, IntCalcinDays, Enable_AutoApproval, Lock_PreviousDate, Enable_EmptyWt)

  VALUES                       (      1, 'AR', 0, 1,'PR', 0, 1,'SUP', 0,1, 'BWR', 0, 1, 'GRP', 0, 1, 'IT', 0, 1, 'SCH', 0, 1, 'LOC', 0, 1, 'PUR', 0, 1, 'BRH', 0, 0, 0, '', 12, 0, 0, 0, 0,
                                      0, 0, 0, 0, 0, 1, 0,@CompSno,@BranchSno,0,0,0,0, 0)

  INSERT INTO Alerts_Setup  (CompSno, Admin_Mobile, Sms_Api, Sms_Sender_Id, Sms_Username, Sms_Password, Sms_Peid, WhatsApp_Instance,Add_91,Add_91Sms)
  VALUES                    (@CompSno, '','','','','','','',0,0)

  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Day History','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Loan Summary','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Customer History','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Loan History','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Auction History','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Pending Report','',@CompSno)
  INSERT INTO Report_Properties(Report_Name, Report_Style, CompSno) VALUES ('Age Analysis','',@CompSno)

END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_LOANS') BEGIN DROP VIEW VW_LOANS END
GO
CREATE VIEW VW_LOANS
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as LoanSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno,
				    Trans.Trans_No as Loan_No, Trans.Ref_No, Trans.Trans_Date as Loan_Date, 
				    Pty.PartySno, Pty.Party_Code, Pty.Party_Name,Pty.Rel, Pty.RelName,Pty.Mobile,
            ProfileImage = ISNULL((SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Pty.PartySno),''),
            Loan_Image = ISNULL((SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 2 AND TransSno=Trans.TransSno),''),
            Ar.AreaSno, Ar.Area_Code, Ar.Area_Name,
				    Sch.SchemeSno, Sch.Scheme_Code, Sch.Scheme_Name,
				    Grp.GrpSno, Grp.Grp_Code, Grp.Grp_Name,

            Trans.Emi_Due_Amt, Trans.OrgEmi_Due_Amt, Trans.Due_Start_Date, Trans.Emi_Principal, Trans.Emi_Interest,
          
               STUFF(( SELECT   (','+ It.Item_Name + '-' + CAST(Ld.Qty AS VARCHAR))
                    FROM     Transaction_Details Ld
                             INNER JOIN Items it on it.itemsno =Ld.itemsno
                    Where    Ld.TransSno = Trans.TransSno
                    FOR XML PATH('')), 1, 1, '') as Item_Details,
                    
				    Trans.TotQty, Trans.TotGrossWt, Trans.TotNettWt, Trans.TotPureWt, CAST(Trans.Market_Value AS DECIMAL(10,2)) as Market_Value, CAST(Trans.Market_Rate AS DECIMAL(10,2)) as Market_Rate, CAST(Trans.Loan_PerGram AS DECIMAL(10,2)) as Loan_PerGram, CAST(Trans.Principal AS DECIMAL(10,2)) as Principal, Trans.Roi, Trans.AdvIntDur,
            CAST(Trans.AdvIntAmt AS DECIMAL(10,2)) as AdvIntAmt, Trans.DocChargesPer, CAST(Trans.DocChargesAmt AS DECIMAL(10,2)) as DocChargesAmt, CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Mature_Date, Trans.PayModeSno, 
				    Loc.LocationSno, Loc.Loc_Code, Loc.Loc_Name,
            Trans.AgentSno, Ag.Agent_Code, Ag.Agent_Name,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,            
            Loan_Status = CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=14) -- Loan Closed and Redemption Made Redemtion VouTypeSno is 14
                                    THEN 2
                               WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=15) -- Auction entry Made Auction Entry VouTypeSno is 15
                                    THEN 4
                               WHEN (SELECT Mature_Date FROM Transactions WHERE TransSno=Trans.TransSno) < [dbo].DateToInt(GETDATE()) --Loan has crossed the mature date and Ready for Auction
                                    THEN 3
                               ELSE
                                  1  -- So Reference entries and not crossed the mature date. So it is Open Loan
                               END,
			Approval_Status = CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 1) THEN 2 ELSE 1 END,
			Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END,
      IsOpen = CASE WHEN Trans.Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=Trans.CompSno) THEN 1 ELSE 2 END,
			Last_Receipt_Date		= (SELECT ISNULL(MAX(Trans_Date),0) FROM Transactions WHERE VouTypeSno=13 AND RefSno=Trans.TransSno),

            Ason_Duration_Months	= (SELECT Months FROM [dbo].SDateDiff([dbo].IntToDate(Trans.Trans_Date),
                                        CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=14) THEN
                                          (SELECT [dbo].IntToDate(MAX(Trans_Date)) FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=14)
                                        ELSE
                                          GETDATE()
                                        END )),

            Ason_Duration_Days		= (SELECT Days FROM [dbo].SDateDiff([dbo].IntToDate(Trans.Trans_Date),
                                        CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=14) THEN
                                          (SELECT [dbo].IntToDate(MAX(Trans_Date)) FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=14)
                                        ELSE
                                          GETDATE()
                                        END )),

      ReLoan_Type = CASE WHEN EXISTS (Select TransSno FROM Transactions WHERE VouTypeSno=20 AND RefSno=Trans.TransSno) THEN 'Re Loan' ELSE 'New Loan' END,

      --1 REPLEDGED --0 NOT REPLEDGED
      Loan_Repledge_Status = CASE WHEN EXISTS(SELECT DetSno FROM Repledge_Details WHERE LoanSno=Trans.TransSno)
                                  THEN
                                      (CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno= (SELECT MAX(TransSno) FROM Repledge_Details WHERE LoanSno=Trans.TransSno) AND VouTypeSno=19 ) THEN 0 ELSE 1 END)
                                  ELSE 0
                             END,

      Loan_RepledgeSno    = CASE WHEN EXISTS(SELECT DetSno FROM Repledge_Details WHERE LoanSno=Trans.TransSno)
                                  THEN                                      
										                  (SELECT MAX(TransSno) FROM Repledge_Details WHERE LoanSno=Trans.TransSno)									                    
                                  ELSE 0
                             END


	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=12
				  INNER JOIN Party Pty ON Pty.PartySno = Trans.PartySno
          INNER JOIN Area Ar ON Ar.AreaSno = Pty.AreaSno
				  INNER JOIN Schemes Sch ON Sch.SchemeSno = Trans.SchemeSno
				  INNER JOIN Item_Groups Grp ON Grp.GrpSno = Trans.GrpSno
				  INNER JOIN Locations Loc ON Loc.LocationSno = Trans.LocationSno
          INNER JOIN Agent Ag ON Ag.AgentSno = Trans.AgentSno
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr On Usr.UserSno = Trans.UserSno

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_RECEIPTS') BEGIN DROP VIEW VW_RECEIPTS END
GO
CREATE VIEW VW_RECEIPTS
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as ReceiptSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno, 
            Ln.Loan_No,Pty.Party_Code  as Customer_Code, Pty.PartySno,Pty.Party_Name as Customer_Name, Ln.Item_Details,
				    Trans.Trans_No as Receipt_No, Trans.Trans_Date as Receipt_Date,
            Trans.RefSno as LoanSno, CAST(Trans.Rec_Principal AS DECIMAL(10,2)) as Rec_Principal, Trans.Rec_IntMonths,Trans.Rec_IntDays, CAST(Trans.Rec_Interest AS DECIMAL(10,2)) as Rec_Interest,
            CAST(Trans.Rec_Other_Credits AS DECIMAL(10,2)) as Rec_Other_Credits, CAST(Trans.Rec_Other_Debits AS DECIMAL(10,2)) as Rec_Other_Debits, CAST(Trans.Rec_Default_Amt AS DECIMAL(10,2)) as Rec_Default_Amt,
            CAST(Trans.Rec_Add_Less AS DECIMAL(10,2)) as Rec_Add_Less,
            Trans.Rec_DuesCount, Trans.Rec_DueAmount,
            Trans.Red_Method,
				    Trans.PayModeSno, CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,
            IsOpen = CASE WHEN Trans.Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=Trans.CompSno) THEN 1 ELSE 2 END,
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END
           
	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=13
          INNER JOIN VW_LOANS Ln ON Ln.LoanSno = Trans.RefSno
				  INNER JOIN Party Pty ON Pty.PartySno = Ln.PartySno          
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_REDEMPTIONS') BEGIN DROP VIEW VW_REDEMPTIONS END
GO
CREATE VIEW VW_REDEMPTIONS
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as RedemptionSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno,
            Ln.Loan_No,Pty.PartySno, Pty.Party_Code  as Customer_Code, Pty.Party_Name as Customer_Name, Ln.Item_Details,
				    Trans.Trans_No as Redemption_No, Trans.Trans_Date as Redemption_Date,
             Trans.RefSno as LoanSno, CAST(Trans.Rec_Principal AS DECIMAL(10,2)) as Rec_Principal, Trans.Rec_IntMonths,Trans.Rec_IntDays, CAST(Trans.Rec_Interest AS DECIMAL(10,2)) as Rec_Interest,
            CAST(Trans.Rec_Other_Credits AS DECIMAL(10,2)) as Rec_Other_Credits, CAST(Trans.Rec_Other_Debits AS DECIMAL(10,2)) as Rec_Other_Debits, CAST(Trans.Rec_Default_Amt AS DECIMAL(10,2)) as Rec_Default_Amt,
            CAST(Trans.Rec_Add_Less AS DECIMAL(10,2)) as Rec_Add_Less,
            Trans.Rec_DuesCount, Trans.Rec_DueAmount,
				    Trans.Red_Method,
            Trans.PayModeSno, CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END
           
	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=14
          INNER JOIN VW_LOANS Ln ON Ln.LoanSno = Trans.RefSno
				  INNER JOIN Party Pty ON Pty.PartySno = Ln.PartySno          
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_AUCTION_ENTRIES') BEGIN DROP VIEW VW_AUCTION_ENTRIES END
GO
CREATE VIEW VW_AUCTION_ENTRIES
WITH ENCRYPTION
AS
	SELECT		Trans.TransSno as AuctionSno, Trans.Trans_No as Auction_No, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno,
				    Ln.LoanSno, Ln.Loan_No, Ln.Loan_No as Ref_No, Pty.Party_Name as Customer_Name,
				    Trans.Trans_Date as Auction_Date,
				    Trans.PayModeSno, 
				    CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Auction_Amount,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END
           
FROM			Transactions Trans
				INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=15
				INNER JOIN VW_LOANS Ln ON Ln.LoanSno = Trans.RefSno
				INNER JOIN Party Pty ON Pty.PartySno = Ln.PartySno          
				INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
        INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_REPLEDGES') BEGIN DROP VIEW VW_REPLEDGES END
GO
CREATE VIEW VW_REPLEDGES
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as RepledgeSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno,
				    Trans.Trans_No as Repledge_No, Trans.Ref_No, Trans.Trans_Date as Repledge_Date, 
				    Pty.PartySno, Pty.Party_Code, Pty.Party_Name,Pty.Rel, Pty.RelName,Pty.Mobile,
            ProfileImage = ISNULL((SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Pty.PartySno),''),

            Bwr.PartySno as BorrowerSno, Bwr.Party_Code as Borrower_Code, Bwr.Party_Name as Borrower_Name,Bwr.Rel as Borrower_Rel, Bwr.RelName as Borrower_RelName, Bwr.Mobile as Borrower_Mobile,
            Bwr_ProfileImage = ISNULL((SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Bwr.PartySno),''),

            Repledge_Image = ISNULL((SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 2 AND TransSno=Trans.TransSno),''),
            Ar.AreaSno, Ar.Area_Code, Ar.Area_Name,
				    Sch.SchemeSno, Sch.Scheme_Code, Sch.Scheme_Name,
				    
               STUFF(( SELECT   (','+ Ln.Loan_No)
                    FROM     Repledge_Details Rp
                             INNER JOIN VW_LOANS Ln on Ln.LoanSno =Rp.LoanSno
                    Where    Rp.TransSno = Trans.TransSno
                    FOR XML PATH('')), 1, 1, '') as Repledge_Details, 
                    
				    Trans.TotQty, Trans.TotGrossWt, Trans.TotNettWt, CAST(Trans.Market_Value AS DECIMAL(10,2)) as Market_Value , CAST(Trans.Principal AS DECIMAL(10,2)) as Principal, Trans.Roi,
            Trans.DocChargesPer, CAST(Trans.DocChargesAmt AS DECIMAL(10,2)) as DocChargesAmt, CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Mature_Date,       
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,            
            Repledge_Status = CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno AND VouTypeSno=19) -- Repledge Closed and Redemption Made Redemtion VouTypeSno is 19
                                    THEN 2                               
                               WHEN (SELECT Mature_Date FROM Transactions WHERE TransSno=Trans.TransSno) < [dbo].DateToInt(GETDATE()) --Repledge has crossed the mature date and Ready for Auction
                                    THEN 3
                               ELSE
                                  1  -- So Reference entries and not crossed the mature date. So it is Open Loan
                               END, 
			
			Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END,
      IsOpen = CASE WHEN Trans.Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=Trans.CompSno) THEN 1 ELSE 2 END,
			Last_Payment_Date		= (SELECT ISNULL(MAX(Trans_Date),0) FROM Transactions WHERE VouTypeSno=18 AND RefSno=Trans.TransSno),
            Ason_Duration_Months	= (SELECT Months FROM [dbo].SDateDiff([dbo].IntToDate(Trans.Trans_Date),GETDATE())),
            Ason_Duration_Days		= (SELECT Days FROM [dbo].SDateDiff([dbo].IntToDate(Trans.Trans_Date),GETDATE()))
      
	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=17
				  INNER JOIN Party Pty ON Pty.PartySno = Trans.PartySno
          INNER JOIN Party Bwr ON Bwr.PartySno = Trans.BorrowerSno
          INNER JOIN Area Ar ON Ar.AreaSno = Pty.AreaSno
				  INNER JOIN Schemes Sch ON Sch.SchemeSno = Trans.SchemeSno				  				  
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr On Usr.UserSno = Trans.UserSno

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_RPPAYMENTS') BEGIN DROP VIEW VW_RPPAYMENTS END
GO
CREATE VIEW VW_RPPAYMENTS
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as RpPaymentSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno, 
            Rp.Repledge_No,Pty.Party_Code  as Customer_Code, Pty.PartySno,Pty.Party_Name as Customer_Name,
				    Trans.Trans_No as RpPayment_No, Trans.Trans_Date as RpPayment_Date,
            Trans.RefSno as RepledgeSno, CAST(Trans.Rec_Principal AS DECIMAL(10,2)) as Rp_Principal, CAST(Trans.Rec_Interest AS DECIMAL(10,2)) as Rp_Interest,
            CAST(Trans.Rec_Default_Amt AS DECIMAL(10,2)) as Rp_Default_Amt, CAST(Trans.Rec_Add_Less AS DECIMAL(10,2)) as Rp_Add_Less,            
				    CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,
            IsOpen = CASE WHEN Trans.Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=Trans.CompSno) THEN 1 ELSE 2 END,
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END
           
	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=18
          INNER JOIN VW_REPLEDGES Rp ON Rp.RepledgeSno = Trans.RefSno
				  INNER JOIN Party Pty ON Pty.PartySno = Rp.PartySno          
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_RPCLOSURE') BEGIN DROP VIEW VW_RPCLOSURE END
GO
CREATE VIEW VW_RPCLOSURE
WITH ENCRYPTION
AS

	SELECT		Trans.TransSno as RpClosureSno, Trans.SeriesSno, Ser.VouTypeSno, Ser.Series_Name, Trans.VouSno, 
            Rp.Repledge_No,Pty.Party_Code  as Customer_Code, Pty.PartySno,Pty.Party_Name as Customer_Name,
				    Trans.Trans_No as RpClosure_No, Trans.Trans_Date as RpClosure_Date,
            Trans.RefSno as RepledgeSno, CAST(Trans.Rec_Principal AS DECIMAL(10,2)) as Rp_Principal, CAST(Trans.Rec_Interest AS DECIMAL(10,2)) as Rp_Interest,
            CAST(Trans.Rec_Default_Amt AS DECIMAL(10,2)) as Rp_Default_Amt, CAST(Trans.Rec_Add_Less AS DECIMAL(10,2)) as Rp_Add_Less,            
				    CAST(Trans.Nett_Payable AS DECIMAL(10,2)) as Nett_Payable,
				    Trans.Remarks, Trans.UserSno, Usr.UserName, Trans.CompSno, 
				    Brh.BranchSno, Brh.Branch_Code, Brh.Branch_Name,            
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Trans.TransSno AND Document_Type = 1 AND Updation_Type = 2) THEN 2 ELSE 1 END
           
	FROM		Transactions Trans
				  INNER JOIN Voucher_Series Ser ON Ser.SeriesSno=Trans.SeriesSno AND Ser.VouTypeSno=19
          INNER JOIN VW_REPLEDGES Rp ON Rp.RepledgeSno = Trans.RefSno
				  INNER JOIN Party Pty ON Pty.PartySno = Rp.PartySno          
				  INNER JOIN Branches Brh ON Brh.BranchSno = Trans.BranchSno
          INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoans') BEGIN DROP FUNCTION Udf_getLoans END
GO

CREATE FUNCTION Udf_getLoans(@LoanSno INT,@CompSno INT, @Loan_Status TINYINT, @Approval_Status TINYINT, @Cancel_Status TINYINT, @OpenStatus TINYINT, @BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

SELECT      Ln.*, Ln.Loan_No  as 'Name', Ln.Party_Name + ', Date:' + CAST([dbo].IntToDate(Ln.Loan_Date) as VARCHAR)  as 'Details',
         
             /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Ln.SeriesSno FOR JSON PATH) Series_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* PARTY OBJECT (PARTY JSON)------------------------------------------------------------------------*/
            (SELECT     Pty.*, Pty.Party_Name as 'Name', Pty.Party_Code as 'Details', ProfileImage
             FROM       Party Pty WHERE PartySno = Ln.PartySno FOR JSON PATH) Party_Json,
             ---------------------------------------------------------------------------------------------------
             
             /* SCHEMES OBJECT  (SCHEMES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Sch.*, Sch.Scheme_Name as 'Name', Sch.Scheme_Name as 'Details' FROM Schemes Sch WHERE SchemeSno = Ln.SchemeSno FOR JSON PATH) Scheme_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* SCHEME SLAB OBJECT  (SCHEME SLAB JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            ISNULL((SELECT * FROM Scheme_Details WHERE SchemeSno = Ln.SchemeSno FOR JSON PATH),'') SchemeSlab_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

             /* GROUPS OBJECT  (GROUP JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Grp.*, Grp.Grp_Name as 'Name', Grp.Grp_Name as 'Details' FROM Item_Groups Grp WHERE GrpSno = Ln.GrpSno FOR JSON PATH) Group_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------
                        
             /* LOCATIONS OBJECT  (LOCATION JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Loc.*, Loc.Loc_Name as 'Name', Loc.Loc_Name as 'Details' FROM Locations Loc WHERE LocationSno = Ln.LocationSno FOR JSON PATH) Location_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* AGENTS OBJECT  (AGENT JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Ag.*, Ag.Agent_Name as 'Name', Ag.Agent_Name as 'Details' FROM Agent Ag WHERE AgentSno = Ln.AgentSno FOR JSON PATH) Agent_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* GROUPS OBJECT  (GROUP JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Grp.*, Grp.Grp_Name as 'Name', Grp.Grp_Name as 'Details' FROM Item_Groups Grp WHERE GrpSno = Ln.GrpSno FOR JSON PATH) IGroup_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* PAYMENT MODE JSON ---------------------------------- */
            (SELECT Pm.*, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'  FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Ln.LoanSno FOR JSON PATH) PaymentModes_Json,
            
             /* ITEMS OBJECT (ITEMS JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
             (SELECT    Det.DetSno, Det.TransSno, Det.ItemSno, Det.Qty, Det.Gross_Wt, Det.Stone_Wt, Det.Nett_Wt, Det.PuritySno, CAST(Det.Item_Value AS DECIMAL(10,2)) as Item_Value, ISNULL(Det.Remarks,'') as Remarks,
                        It.ItemSno as 'Item.ItemSno', It.Item_Name as 'Item.Item_Name', It.Item_Name as 'Item.Name', 'Code:' + It.Item_Code as 'Item.Details',
                        Pur.PuritySno as 'Purity.PuritySno', Pur.Purity_Name as 'Purity.Purity_Name', Pur.Purity_Name as 'Purity.Name', 'Code:' + Pur.Purity_Code as 'Purity.Details', Pur.Purity as 'Purity.Purity'                

             FROM       Transaction_Details Det                    
                        INNER JOIN Items It On It.ItemSno=Det.ItemSno
                        INNER JOIN Purity Pur ON Pur.PuritySno=Det.PuritySno
             WHERE      Det.TransSno = Ln.LoanSno FOR JSON PATH) Items_Json,
             ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             
             /* IMAGES OBJECT (IMAGES JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
              ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url=Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Ln.LoanSno AND Image_Grp=2 FOR JSON PATH),'') Images_Json
              ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

FROM        VW_LOANS Ln

WHERE       (Ln.LoanSno=@LoanSno OR @LoanSno=0) AND (Ln.CompSno=@CompSno) 
			      AND (Ln.Loan_Status=@Loan_Status OR @Loan_Status=0)			
			      AND (Ln.Approval_Status=@Approval_Status OR @Approval_Status=0)
			      AND (Ln.Cancel_Status=@Cancel_Status OR @Cancel_Status=0)
            AND (Ln.IsOpen=@OpenStatus OR @OpenStatus=0)
            AND (Ln.BranchSno=@BranchSno OR @BranchSno=0)
GO




IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRepledges') BEGIN DROP FUNCTION Udf_getRepledges END
GO
CREATE FUNCTION Udf_getRepledges(@RepledgeSno INT,@CompSno INT, @Repledge_Status TINYINT, @Cancel_Status TINYINT, @OpenStatus TINYINT, @BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

SELECT      Rp.*, Rp.Repledge_No  as 'Name', Rp.Party_Name + ', Date:' + CAST([dbo].IntToDate(Rp.Repledge_Date) as VARCHAR)  as 'Details',
         
             /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Rp.SeriesSno FOR JSON PATH) Series_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* PARTY OBJECT (PARTY JSON)------------------------------------------------------------------------*/
            (SELECT     Pty.*, Pty.Party_Name as 'Name', Pty.Party_Code as 'Details', ProfileImage
             FROM       Party Pty WHERE PartySno = Rp.PartySno FOR JSON PATH) Party_Json,
             ---------------------------------------------------------------------------------------------------


              /* BORROWER OBJECT (BORROWER JSON)------------------------------------------------------------------------*/
            (SELECT     Pty.*, Pty.Party_Name as 'Name', Pty.Party_Code as 'Details', ProfileImage
             FROM       Party Pty WHERE PartySno = Rp.BorrowerSno FOR JSON PATH) Borrower_Json,
             ---------------------------------------------------------------------------------------------------


             /* SCHEMES OBJECT  (SCHEMES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            (SELECT Sch.*, Sch.Scheme_Name as 'Name', Sch.Scheme_Name as 'Details' FROM Schemes Sch WHERE SchemeSno = Rp.SchemeSno FOR JSON PATH) Scheme_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* SCHEME SLAB OBJECT  (SCHEME SLAB JSON)------------------------------------------------------------------------------------------------------------------------------------*/
            ISNULL((SELECT * FROM Scheme_Details WHERE SchemeSno = Rp.SchemeSno FOR JSON PATH),'') SchemeSlab_Json,
            ----------------------------------------------------------------------------------------------------------------------------------------------------------

            /* PAYMENT MODE JSON ---------------------------------- */
            (SELECT Pm.*, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'  FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Rp.RepledgeSno FOR JSON PATH) PaymentModes_Json,
            
             /* LOANS OBJECT (LOANS JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
             (SELECT    Rd.DetSno, Rd.TransSno, Rd.LoanSno,Ln.Loan_No, Ln.Loan_Date, Ln.Principal, Ln.TotGrossWt, Ln.TotNettWt,Ln.Party_Name 

             FROM       Repledge_Details Rd
                        INNER JOIN VW_LOANS Ln On Ln.LoanSno=Rd.LoanSno
                        
             WHERE      Rd.TransSno = Rp.RepledgeSno FOR JSON PATH) RepledgeLoans_Json,
             ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             
             /* IMAGES OBJECT (IMAGES JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
              ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url=Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Rp.RepledgeSno AND Image_Grp=2 FOR JSON PATH),'') Images_Json
              ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

FROM        VW_REPLEDGES Rp

WHERE       (Rp.RepledgeSno=@RepledgeSno OR @RepledgeSno=0) AND (Rp.CompSno=@CompSno) 
			      AND (Rp.Repledge_Status=@Repledge_Status OR @Repledge_Status=0)						      
			      AND (Rp.Cancel_Status=@Cancel_Status OR @Cancel_Status=0)
            AND (Rp.IsOpen=@OpenStatus OR @OpenStatus=0)
            AND (Rp.BranchSno=@BranchSno OR @BranchSno=0)
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRpPayments') BEGIN DROP FUNCTION Udf_getRpPayments END
GO
CREATE FUNCTION Udf_getRpPayments(@RpPaymentSno INT,@CompSno INT,@OpenStatus TINYINT,@BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

      SELECT    Rpp.*,
                    /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Rpp.SeriesSno FOR JSON PATH) Series_Json,

                  /* PAYMENT MODE JSON ---------------------------------- */                  
                  (SELECT Pm.*,Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details' FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Rpp.RpPaymentSno FOR JSON PATH) PaymentModes_Json,
                    /* REPLEDGE OBJECT  (Repledge JSON)------------------------------------------------------------------------------------------------------------------------------------*/

                  (SELECT Rp.*, Rp.Repledge_No as 'Name', Rp.Ref_No as 'Details' FROM VW_REPLEDGES Rp WHERE RepledgeSno = Rpp.RepledgeSno FOR JSON PATH) Repledge_Json,

                    /* SUPPLIER OBJECT  (SUPPLIER JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Supp.*,Supp.Party_Name as 'Name', 'Code:' + Supp.Party_Code as 'Details'  FROM Party Supp WHERE Supp.PartySno=Rp.PartySno FOR JSON PATH) as Supplier_Json,

                    /* SUPPLIER OBJECT  (SUPPLIER JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Bwr.*,Bwr.Party_Name as 'Name', 'Code:' + Bwr.Party_Code as 'Details'  FROM Party Bwr WHERE Bwr.PartySno=Rp.BorrowerSno FOR JSON PATH) as Borrower_Json
                  

        FROM      VW_RPPAYMENTS Rpp
                  INNER JOIN VW_REPLEDGES Rp ON Rp.RepledgeSno=Rpp.RepledgeSno
                  --INNER JOIN Party Customer ON Customer.PartySno = Loan.PartySno

        WHERE     (Rpp.RpPaymentSno=@RpPaymentSno OR @RpPaymentSno=0) AND (Rpp.CompSno=@CompSno) AND (Rpp.IsOpen=@OpenStatus OR @OpenStatus=0)  AND (Rpp.BranchSno=@BranchSno OR @BranchSno=0)
                
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRpClosures') BEGIN DROP FUNCTION Udf_getRpClosures END
GO
CREATE FUNCTION Udf_getRpClosures(@RpClosureSno INT,@CompSno INT,@BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

      SELECT    Rc.*,
                    /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Rc.SeriesSno FOR JSON PATH) Series_Json,

                  /* PAYMENT MODE JSON ---------------------------------- */                  
                  (SELECT Pm.*,Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details' FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Rc.RpClosureSno FOR JSON PATH) PaymentModes_Json,

                  /* REPLEDGE OBJECT  (Repledge JSON)------------------------------------------------------------------------------------------------------------------------------------*/

                  (SELECT Rp.*, Rp.Repledge_No as 'Name', Rp.Ref_No as 'Details' FROM VW_REPLEDGES Rp WHERE RepledgeSno = Rc.RepledgeSno FOR JSON PATH) Repledge_Json,

                    /* SUPPLIER OBJECT  (SUPPLIER JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Supp.*,Supp.Party_Name as 'Name', 'Code:' + Supp.Party_Code as 'Details'  FROM Party Supp WHERE Supp.PartySno=Rp.PartySno FOR JSON PATH) as Supplier_Json,

                    /* SUPPLIER OBJECT  (SUPPLIER JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Bwr.*,Bwr.Party_Name as 'Name', 'Code:' + Bwr.Party_Code as 'Details'  FROM Party Bwr WHERE Bwr.PartySno=Rp.BorrowerSno FOR JSON PATH) as Borrower_Json
                  

        FROM      VW_RPCLOSURE Rc
                  INNER JOIN VW_REPLEDGES Rp ON Rp.RepledgeSno=Rc.RepledgeSno
                  --INNER JOIN Party Customer ON Customer.PartySno = Loan.PartySno

        WHERE     (Rc.RpClosureSno=@RpClosureSno OR @RpClosureSno=0) AND (Rc.CompSno=@CompSno) AND (Rc.BranchSno=@BranchSno OR @BranchSno=0)
                
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getReceipts') BEGIN DROP FUNCTION Udf_getReceipts END
GO
CREATE FUNCTION Udf_getReceipts(@ReceiptSno INT,@CompSno INT,@BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

SELECT (SELECT    Rec.*
                    /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  --(SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Rec.SeriesSno FOR JSON PATH) Series_Json
        FROM      VW_RECEIPTS Rec
                  INNER JOIN VW_LOANS Loan ON Loan.LoanSno=Rec.LoanSno
                  INNER JOIN Party Customer ON Customer.PartySno = Loan.PartySno

        WHERE     (Rec.ReceiptSno=@ReceiptSno OR @ReceiptSno=0) AND (Rec.CompSno=@CompSno) AND (Rec.BranchSno=@BranchSno OR @BranchSno=0) FOR JSON AUTO)

        AS Json_Result
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAuctionEntries') BEGIN DROP FUNCTION Udf_getAuctionEntries END
GO
CREATE FUNCTION Udf_getAuctionEntries(@AuctionSno INT,@CompSno INT,@BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

  SELECT      Auc.*, Auc.Auction_No as 'Name', Auc.Auction_No as 'Details',
         
               /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
              (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details' FROM Voucher_Series Ser WHERE SeriesSno = Auc.SeriesSno FOR JSON PATH) Series_Json,
              ----------------------------------------------------------------------------------------------------------------------------------------------------------
              /* PAYMENT MODE JSON ---------------------------------- */
              (SELECT Pm.*, Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details' FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Auc.AuctionSno FOR JSON PATH) PaymentModes_Json,

              /* LOAN OBJECT (PARTY JSON)------------------------------------------------------------------------*/
              (SELECT     Ln.*, Ln.Loan_No as 'Name', Ln.Party_Name as 'Details'
               FROM       VW_LOANS Ln WHERE LoanSno = Auc.LoanSno FOR JSON PATH) Loan_Json

  FROM        VW_AUCTION_ENTRIES Auc

  WHERE       (Auc.AuctionSno=@AuctionSno OR @AuctionSno=0) AND (Auc.CompSno=@CompSno) AND (Auc.BranchSno=@BranchSno OR @BranchSno=0)
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoanDetailed') BEGIN DROP FUNCTION Udf_getLoanDetailed END
GO
CREATE FUNCTION Udf_getLoanDetailed(
  @LoanSno    INT,
  @AsOn       INT,
  @IsCompound BIT)
  RETURNS @Result TABLE (Interest_Balance MONEY, Principal_Balance MONEY, Last_Receipt_Date INT, Ason_Duration_Months INT, Ason_Duration_Days INT, Struc_Json VARCHAR(MAX), Statement_Json VARCHAR(MAX),
                        Total_Dues TINYINT, Paid_Dues TINYINT, Balance_Dues TINYINT, Pending_Dues TINYINT)
WITH ENCRYPTION AS
BEGIN
    DECLARE @Calc_Method TINYINT
	  DECLARE @Custom_Style TINYINT
    SELECT @Calc_Method=Calc_Method, @Custom_Style=Custom_Style FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)

    IF @Calc_Method = 0  -- Simple Calculation Method
		BEGIN
          INSERT INTO @Result
            SELECT   CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0)))  AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        --(SELECT ISNULL(MAX(Receipt_Date),0) FROM VW_RECEIPTS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						            (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						            (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END
	ELSE IF @Calc_Method = 1 -- Multiple Calculation Method
		BEGIN
          INSERT INTO @Result
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                       CAST( ((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn)
		END
	ELSE IF @Calc_Method = 2 -- COMPOUND Calculation Method
		BEGIN  -----------------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
            INSERT INTO @Result
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 3 -- EMI Calculation Method
		BEGIN  ---------CAST(--------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
            INSERT INTO @Result
			                  SELECT      CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                                    CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                                    (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						                        (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						                        (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                                    (SELECT * FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) FOR JSON PATH) Struc_Json,
                                    (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,

                                    (SELECT EmiDues FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)) as  Total_Dues,
                                    ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0) as  Paid_Dues,

                                    (SELECT EmiDues FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)) -
                                    ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0) as Balance_Dues,

                                    ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn)),0)-
                                    ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0)  as Pending_Dues                                   
                                    
            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 4 -- CUSTOMIZED CALCULATION METHODS
		BEGIN
			IF @Custom_Style = 0
				BEGIN -- IF CUSTOM STYLE IS ZERO (0) THEN SIMPLY CALL SIMPLE INTEREST CALCULATION STRUCTURE ELSE CALL CUSTOM STRUCTURES
         INSERT INTO @Result
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								(SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

					FROM		Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
				END
			ELSE IF @Custom_Style = 1
				BEGIN		-- THIS IS THE CUSTOM STYLE FOR VELUSAMY BANKERS, THENI
          INSERT INTO @Result
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								    CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								    (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								    (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								    (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								    (SELECT * FROM Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                    (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                    0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

					FROM		Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound)

				END
		END
    RETURN
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_getLoanDetailed') BEGIN DROP PROCEDURE Sp_getLoanDetailed END
GO
CREATE PROCEDURE Sp_getLoanDetailed
  @LoanSno    INT,
  @AsOn       INT,
  @IsCompound BIT

WITH ENCRYPTION AS
BEGIN
    DECLARE @Calc_Method TINYINT
	  DECLARE @Custom_Style TINYINT
    SELECT @Calc_Method=Calc_Method, @Custom_Style=Custom_Style FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)

    IF @Calc_Method = 0  -- Simple Calculation Method
		BEGIN
            SELECT   CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0)))  AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        --(SELECT ISNULL(MAX(Receipt_Date),0) FROM VW_RECEIPTS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						            (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						            (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END
	ELSE IF @Calc_Method = 1 -- Multiple Calculation Method
		BEGIN  
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                       CAST( ((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn)
		END
	ELSE IF @Calc_Method = 2 -- COMPOUND Calculation Method
		BEGIN  -----------------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 3 -- EMI Calculation Method
		BEGIN  ---------CAST(--------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
			      SELECT      CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                        
                        (SELECT EmiDues FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)) as  Total_Dues,
                        ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0) as  Paid_Dues,

                        (SELECT EmiDues FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)) -
                        ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0) as Balance_Dues,

                        ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn)),0)-
                        ISNULL((SELECT COUNT(*) FROM Udf_GetInterestStruc_Emi(@LoanSno, @AsOn) WHERE PaidAmt <>0 ),0)  as Pending_Dues       

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 4 -- CUSTOMIZED CALCULATION METHODS
		BEGIN
			IF @Custom_Style = 0
				BEGIN -- IF CUSTOM STYLE IS ZERO (0) THEN SIMPLY CALL SIMPLE INTEREST CALCULATION STRUCTURE ELSE CALL CUSTOM STRUCTURES
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								(SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

					FROM		Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
				END
			ELSE IF @Custom_Style = 1
				BEGIN		-- THIS IS THE CUSTOM STYLE FOR VELUSAMY BANKERS, THENI
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								    CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								    (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								    (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								    (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								    (SELECT * FROM Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                    (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json,
                    0 as Total_Dues, 0 as Paid_Dues, 0 as Balance_Dues, 0 as Pending_Dues

					FROM		Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound)

				END
		END
END

GO





IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getCustomerDetailed') BEGIN DROP FUNCTION Udf_getCustomerDetailed END
GO
CREATE FUNCTION Udf_getCustomerDetailed(@PartySno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
  SELECT		Pty.*,ProfileImage = (SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Pty.PartySno),
			      OpenLoans = (SELECT COUNT(LoanSno) FROM VW_LOANS WHERE PartySno=Pty.PartySno AND Loan_Status=1 AND Cancel_Status <> 2 ),
			      ClosedLoans = (SELECT COUNT(LoanSno) FROM VW_LOANS WHERE PartySno=Pty.PartySno AND Loan_Status=2 AND Cancel_Status <> 2),
			      MaturedLoans = (SELECT COUNT(LoanSno) FROM VW_LOANS WHERE PartySno=Pty.PartySno AND Loan_Status=3 AND Cancel_Status <> 2),
			      AuctionedLoans = (SELECT COUNT(LoanSno) FROM VW_LOANS WHERE PartySno=Pty.PartySno AND Loan_Status=4 AND Cancel_Status <> 2),
			      ( SELECT    Ln.*,Grp_Name as 'IGroup.Grp_Name', Loc_Name as 'Location.Loc_Name' , Scheme_Name as 'Scheme.Scheme_Name',

                       STUFF((  SELECT   (','+ It.Item_Name + '-' + CAST(Ld.Qty AS VARCHAR))
                                FROM     Transaction_Details Ld
                                          INNER JOIN Items it on it.itemsno =Ld.itemsno
                                WHERE    Ld.TransSno = Ln.LoanSno
                                FOR XML PATH('')), 1, 1, '') as Item_Details_With_Qty,

                        Interest_Balance = (SELECT Interest_Balance FROM Udf_getLoanDetailed(Ln.LoanSno,[dbo].DateToInt(GETDATE()),0)),
                        Principal_Balance = (SELECT Principal_Balance FROM Udf_getLoanDetailed(Ln.LoanSno,[dbo].DateToInt(GETDATE()),0))
              FROM      VW_LOANS Ln
              WHERE     PartySno = Pty.PartySno
              ORDER BY  Loan_Date DESC FOR JSON PATH) Loans_Json

  FROM		Party Pty
			
  WHERE		Pty.PartySno=@PartySno

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoanStatement') BEGIN DROP FUNCTION Udf_getLoanStatement END
GO
CREATE FUNCTION Udf_getLoanStatement(@LoanSno INT,@AsOn INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT	Ln.LoanSno as Sno, Ln.VouTypeSno, Ln.Series_Name, Ln.Loan_No as Number, Ln.Loan_Date as Date, Ln.Principal as Principal, Ln.AdvIntAmt as Interest,  Ln.Nett_Payable
    FROM	VW_LOANS Ln
    WHERE	Ln.LoanSno = @LoanSno

    UNION ALL

    SELECT	Rec.ReceiptSno as Sno, Rec.VouTypeSno, Rec.Series_Name, Rec.Receipt_No as Number, Rec.Receipt_Date as Date, Rec.Rec_Principal as Principal, Rec.Rec_Interest as Interest,  Rec.Nett_Payable
    FROM	VW_RECEIPTS Rec
    WHERE	Rec.LoanSno = @LoanSno AND Rec.Receipt_Date <=@AsOn

    UNION ALL

    SELECT	Red.RedemptionSno as Sno, Red.VouTypeSno, Red.Series_Name, Red.Redemption_No as Number, Red.Redemption_Date as Date, Red.Rec_Principal as Principal, Red.Rec_Interest as Interest,  Red.Nett_Payable
    FROM	VW_REDEMPTIONS Red
    WHERE	Red.LoanSno = @LoanSno AND Red.Redemption_Date <=@AsOn
	
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getBalanceSummary') BEGIN DROP FUNCTION Udf_getBalanceSummary END
GO
CREATE FUNCTION Udf_getBalanceSummary(@LoanSno    INT,  @AsOn       INT,  @IsCompound BIT)
  RETURNS @Result TABLE (Interest_Balance MONEY, Principal_Balance MONEY, Last_Receipt_Date INT , Ason_Duration_Months TINYINT, Ason_Duration_Days INT, Struc_Json NVARCHAR(MAX), Statement_Json NVARCHAR(MAX) )
  WITH ENCRYPTION AS
  BEGIN
	DECLARE @Calc_Method TINYINT
	DECLARE @Custom_Style TINYINT
    SELECT @Calc_Method=Calc_Method, @Custom_Style=Custom_Style FROM Schemes WHERE SchemeSno=(SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)

    IF @Calc_Method = 0  -- Simple Calculation Method
		BEGIN
		INSERT INTO @Result
            SELECT   CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0)))  AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        --(SELECT ISNULL(MAX(Receipt_Date),0) FROM VW_RECEIPTS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						            (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						            (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END
	ELSE IF @Calc_Method = 1 -- Multiple Calculation Method
		BEGIN  
		INSERT INTO @Result
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                       CAST( ((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

            FROM    Udf_GetInterestStruc_Multiple(@LoanSno, @AsOn)
		END
	ELSE IF @Calc_Method = 2 -- COMPOUND Calculation Method
		BEGIN  -----------------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
		INSERT INTO @Result
			      SELECT  CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
                        CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
                        (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
						(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
						(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
                        (SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                        (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 3 -- EMI Calculation Method
		BEGIN  ---------CAST(--------------------------------------------TO BE ALTERED LATER AS PER CALCULATION METHOD
		INSERT INTO @Result
			SELECT      CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
				CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
				(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
				(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
				(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
				(SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
				(SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

            FROM    Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
		END

	ELSE IF @Calc_Method = 4 -- CUSTOMIZED CALCULATION METHODS
		BEGIN
			IF @Custom_Style = 0
				BEGIN -- IF CUSTOM STYLE IS ZERO (0) THEN SIMPLY CALL SIMPLE INTEREST CALCULATION STRUCTURE ELSE CALL CUSTOM STRUCTURES
				INSERT INTO @Result
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								(SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								(SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								(SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								(SELECT * FROM Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

					FROM		Udf_GetInterestStruc_Simple(@LoanSno, @AsOn, @IsCompound)
				END
			ELSE IF @Custom_Style = 1
				BEGIN		-- THIS IS THE CUSTOM STYLE FOR VELUSAMY BANKERS, THENI
					INSERT INTO @Result	
					SELECT		CAST((SUM(IntAccured)-(SUM(IntPaid)-ISNULL(SUM(AdjPrincipal),0))) AS DECIMAL(10,2)) as Interest_Balance,
								    CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_LOANS WHERE LoanSno=@LoanSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,
								    (SELECT Last_Receipt_Date FROM VW_LOANS WHERE LoanSno=@LoanSno) as Last_Receipt_Date,
								    (SELECT Ason_Duration_Months FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Months,
								    (SELECT Ason_Duration_Days FROM VW_LOANS WHERE LoanSno=@LoanSno) as Ason_Duration_Days,
								    (SELECT * FROM Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                    (SELECT * FROM Udf_getLoanStatement(@LoanSno,@AsOn) FOR JSON PATH) Statement_Json

					FROM		Udf_GetInterestStruc_Velsamy(@LoanSno, @AsOn, @IsCompound)

				END
		END
		RETURN
	END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoanHistory') BEGIN DROP FUNCTION Udf_getLoanHistory END
GO

CREATE FUNCTION Udf_getLoanHistory(@LoanStatus INT, @CompSno INT, @Fromdate INT, @ToDate INT,@BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT    Ln.*,
              AsOn_Loan_Status = CASE   WHEN EXISTS(SELECT TransSno FROM Transactions WHERE (RefSno=Ln.LoanSno) AND (VouTypeSno=14) AND (Trans_Date <=@ToDate) ) -- Loan Closed and Redemption Made Redemtion VouTypeSno is 14
                                          THEN 2
                                        WHEN EXISTS(SELECT TransSno FROM Transactions WHERE (RefSno=Ln.LoanSno) AND (VouTypeSno=15) AND (Trans_Date <=@ToDate)) -- Auction entry Made Auction Entry VouTypeSno is 15
                                          THEN 4
                                        WHEN (SELECT Mature_Date FROM Transactions WHERE TransSno=Ln.LoanSno) < @ToDate --Loan has crossed the mature date and Ready for Auction
                                          THEN 3
                                        ELSE
                                            1  -- So Reference entries and not crossed the mature date. So it is Open Loan
                                        END

    FROM      Udf_getLoans(0,@CompSno,0,2,1,0,@BranchSno) Ln
    WHERE     (Ln.Loan_Date BETWEEN @FromDate AND @ToDate) AND (Ln.Loan_Status=@LoanStatus OR @LoanStatus=0) 

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoanStatusCount') BEGIN DROP FUNCTION Udf_getLoanStatusCount END
GO
CREATE FUNCTION Udf_getLoanStatusCount(@CompSno INT, @AsOn INT, @BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN  

    SELECT		Ln.Loan_Status, COUNT(Ln.LoanSno) LoansCount, SUM(Ln.Principal) as Principal
    FROM		  VW_LOANS Ln
    WHERE     (Ln.CompSno = @CompSno) AND (Ln.BranchSno=@BranchSno OR @BranchSno=0)
    GROUP BY	Ln.Loan_Status 	
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRepledgeHistory') BEGIN DROP FUNCTION Udf_getRepledgeHistory END
GO

CREATE FUNCTION Udf_getRepledgeHistory(@RepledgeStatus INT, @CompSno INT, @Fromdate INT, @ToDate INT, @BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT    Rp.*,
              AsOn_Repledge_Status = CASE WHEN EXISTS(SELECT TransSno FROM Transactions WHERE RefSno=Rp.RepledgeSno AND VouTypeSno=19) -- Repledge Closed and Redemption Made Redemtion VouTypeSno is 19
                                          THEN 2                               
                                     WHEN (SELECT Mature_Date FROM Transactions WHERE TransSno=Rp.RepledgeSno) < [dbo].DateToInt(GETDATE()) --Repledge has crossed the mature date and Ready for Auction
                                          THEN 3
                                     ELSE
                                        1  -- So Reference entries and not crossed the mature date. So it is Open Loan
                                     END 

    FROM      Udf_getRepledges(0,@CompSno,0,0,0,@BranchSno) Rp
    
    WHERE     (Rp.Repledge_Date BETWEEN @FromDate AND @ToDate) AND (Rp.Repledge_Status=@RepledgeStatus OR @RepledgeStatus=0 AND Rp.Cancel_Status=1)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRepledgeStatusCount') BEGIN DROP FUNCTION Udf_getRepledgeStatusCount END
GO
CREATE FUNCTION Udf_getRepledgeStatusCount(@CompSno INT, @AsOn INT, @BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN  

    SELECT		Rp.Repledge_Status, COUNT(Rp.RepledgeSno) RepledgesCount, SUM(Rp.Principal) as Principal
    FROM		  VW_REPLEDGES Rp
    WHERE     Rp.CompSno = @CompSno AND (Rp.BranchSno=@BranchSno OR @BranchSno=0)
    GROUP BY	Rp.Repledge_Status 	
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRepledgeAuctionList') BEGIN DROP FUNCTION Udf_getRepledgeAuctionList END
GO


CREATE FUNCTION Udf_getRepledgeAuctionList(@CompSno INT, @AsOn INT, @BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT	Rp.*

    FROM		Udf_getRepledges(0,@CompSno,0,1,0,@BranchSno) Rp
    
	  WHERE		Rp.RepledgeSno NOT IN (SELECT RepledgeSno FROM VW_RPCLOSURE	WHERE (RpClosure_Date <=@AsOn) AND RepledgeSno=Rp.RepledgeSno) -- No Redemptions Made
				    AND
				    Rp.Mature_Date < @AsOn
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAuctionList') BEGIN DROP FUNCTION Udf_getAuctionList END
GO

CREATE FUNCTION Udf_getAuctionList(@CompSno INT, @AsOn INT,@BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT		Ln.*,
              ( SELECT  Oln.*
                FROM    VW_LOANS Oln
                WHERE   (Oln.CompSno=@CompSno) AND (Oln.BranchSno=@BranchSno) AND (Oln.Approval_Status=2) AND (Oln.Cancel_Status=1)
                        AND
                        (PartySno=Ln.PartySno) -- AND  (Oln.LoanSno <> Ln.LoanSno)
                        AND
                        OLn.LoanSno NOT IN (SELECT LoanSno FROM VW_REDEMPTIONS	WHERE (Redemption_Date <=@AsOn) AND LoanSno=OLn.LoanSno) -- No Redemptions Made
				                AND 
				                OLn.LoanSno NOT IN (SELECT TransSno FROM Transactions WHERE VouTypeSno=15 AND (Trans_Date <=@AsOn)	AND RefSno=OLn.LoanSno) -- No Auction Entries Made
				                AND
				                OLn.Mature_Date < @AsOn FOR JSON PATH ) as OtherLoans_Json

    FROM		  Udf_getLoans(0,@CompSno,0,2,1,0,@BranchSno) Ln
    
	  WHERE		  Ln.LoanSno NOT IN (SELECT LoanSno FROM VW_REDEMPTIONS	WHERE (Redemption_Date <=@AsOn) AND LoanSno=Ln.LoanSno) -- No Redemptions Made
				      AND 
				      Ln.LoanSno NOT IN (SELECT TransSno FROM Transactions WHERE VouTypeSno=15 AND (Trans_Date <=@AsOn)	AND RefSno=Ln.LoanSno) -- No Auction Entries Made
				      AND
				      Ln.Mature_Date < @AsOn
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getPendingReport') BEGIN DROP FUNCTION Udf_getPendingReport END
GO
CREATE FUNCTION Udf_getPendingReport(@CompSno INT, @AsOn INT, @DueDays SMALLINT,@BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
	  SELECT		Ln.*, Pending_Interest = CAST((SELECT Interest_Balance FROM Udf_getBalanceSummary(Ln.LoanSno,@AsOn,0)) AS DECIMAL(10,2)),

                    Pending_Dues = CASE 
										WHEN Ln.Last_Receipt_Date = 0 
											THEN DATEDIFF(MONTH, [dbo].IntToDate(Ln.Loan_Date), CASE @AsOn 
																										WHEN 0 THEN GETDATE() 
																										ELSE [dbo].IntToDate(@AsOn) END) -1
																										
										  ELSE 
											  DATEDIFF(MONTH, [dbo].IntToDate(Ln.Last_Receipt_Date), CASE @AsOn 
																										WHEN 0 THEN GETDATE() 
																										ELSE [dbo].IntToDate(@AsOn) END) 
																										END,

                     Pending_Days = CASE 
										  WHEN Ln.Last_Receipt_Date = 0 
											  THEN DATEDIFF(DAY, [dbo].IntToDate(Ln.Loan_Date), CASE @AsOn 
																										WHEN 0 THEN GETDATE() 
																										ELSE [dbo].IntToDate(@AsOn) END) 
																										
										  ELSE 
											  DATEDIFF(DAY, [dbo].IntToDate(Ln.Last_Receipt_Date), CASE @AsOn 
																										WHEN 0 THEN GETDATE() 
																										ELSE [dbo].IntToDate(@AsOn) END) 
																										END,
                    Due_Date = [dbo].DateToInt(DATEADD(DAY,@DueDays,(CASE WHEN Last_Receipt_Date=0 THEN [dbo].IntToDate(Loan_Date) ELSE [dbo].IntToDate(Last_Receipt_Date) END)))

                   
    FROM		Udf_getLoans(0,@CompSno,0,2,1,0,@BranchSno) Ln

    WHERE   Ln.Loan_Status IN (1,3)
	
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getSupplierDetailed') BEGIN DROP FUNCTION Udf_getSupplierDetailed END
GO

CREATE FUNCTION Udf_getSupplierDetailed(@PartySno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
  SELECT		Pty.*,ProfileImage = (SELECT TOP 1 Image_Url FROM Image_Details WHERE Image_Grp = 1 AND TransSno=Pty.PartySno),
			      OpenLoans = (SELECT COUNT(RepledgeSno) FROM VW_REPLEDGES WHERE PartySno=Pty.PartySno AND Repledge_Status=1 AND Cancel_Status <> 2 ),
			      ClosedLoans = (SELECT COUNT(RepledgeSno) FROM VW_REPLEDGES WHERE PartySno=Pty.PartySno AND Repledge_Status=2 AND Cancel_Status <> 2),
			      MaturedLoans = (SELECT COUNT(RepledgeSno) FROM VW_REPLEDGES WHERE PartySno=Pty.PartySno AND Repledge_Status=3 AND Cancel_Status <> 2),
			      AuctionedLoans = (SELECT COUNT(RepledgeSno) FROM VW_REPLEDGES WHERE PartySno=Pty.PartySno AND Repledge_Status=4 AND Cancel_Status <> 2),
			      ( SELECT    Rp.*,Scheme_Name as 'Scheme.Scheme_Name'
              FROM      VW_REPLEDGES Rp
              WHERE     PartySno = Pty.PartySno
              ORDER BY  Repledge_Date DESC FOR JSON PATH) RepledgeLoans_Json

  FROM		Party Pty
			
  WHERE		Pty.PartySno=@PartySno

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_getRepledgeDetailed') BEGIN DROP PROCEDURE Sp_getRepledgeDetailed END
GO

CREATE PROCEDURE  Sp_getRepledgeDetailed
  @RepledgeSno    INT,
  @AsOn       INT,
  @IsCompound BIT

WITH ENCRYPTION AS
BEGIN
		-- Simple Calculation Method
		
        SELECT   CAST((SUM(IntAccured)-SUM(IntPaid)) AS DECIMAL(10,2)) as Interest_Balance,
                    CAST(((SELECT Principal+SUM(AddedPrincipal) FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno) - (SUM(PrinPaid)+SUM(AdjPrincipal))) AS DECIMAL(10,2)) as Principal_Balance,                    
					(SELECT Last_Payment_Date FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno) as Last_Payment_Date,
						        (SELECT Ason_Duration_Months FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno) as Ason_Duration_Months,
						        (SELECT Ason_Duration_Days FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno) as Ason_Duration_Days,
                    (SELECT * FROM Udf_GetInterestStruc_Simple_Repledge(@RepledgeSno, @AsOn, @IsCompound) FOR JSON PATH) Struc_Json,
                    (SELECT * FROM Udf_getRepledgeStatement(@RepledgeSno,@AsOn) FOR JSON PATH) Statement_Json

        FROM    Udf_GetInterestStruc_Simple_Repledge(@RepledgeSno, @AsOn, @IsCompound)
		
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getRepledgeStatement') BEGIN DROP FUNCTION Udf_getRepledgeStatement END
GO
CREATE FUNCTION Udf_getRepledgeStatement(@RepledgeSno INT,@AsOn INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT	Rp.RepledgeSno as Sno, Rp.VouTypeSno, Rp.Series_Name, Rp.Repledge_No as Number, Rp.Repledge_Date as Date, Rp.Principal as Principal, 0 as Interest, Rp.Nett_Payable
    FROM	  VW_REPLEDGES Rp
    WHERE	  Rp.RepledgeSno = @RepledgeSno

    UNION ALL

    SELECT	Rpp.RpPaymentSno as Sno, Rpp.VouTypeSno, Rpp.Series_Name, Rpp.RpPayment_No as Number, Rpp.RpPayment_Date as Date, Rpp.Rp_Principal as Principal, Rpp.Rp_Interest as Interest,  Rpp.Nett_Payable
    FROM	VW_RPPAYMENTS Rpp
    WHERE	Rpp.RepledgeSno = @RepledgeSno AND Rpp.RpPayment_Date <=@AsOn

    UNION ALL

    SELECT	Red.RpClosureSno as Sno, Red.VouTypeSno, Red.Series_Name, Red.RpClosure_No as Number, Red.RpClosure_Date as Date, Red.Rp_Principal as Principal, Red.Rp_Interest as Interest,  Red.Nett_Payable
    FROM	  VW_RPCLOSURE Red
    WHERE	  Red.RepledgeSno = @RepledgeSno AND Red.RpClosure_Date <=@AsOn
	
GO

-----------------------------------------------------------------/* ACCOUNTS */------------------------------------------------------------------------

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_AccLedger_Groups') BEGIN DROP PROCEDURE Sp_AccLedger_Groups END
GO
CREATE PROCEDURE Sp_AccLedger_Groups
  -- Add the parameters for the stored PROCEDURE here
  @GrpSno         INT,
  @Grp_Code       VARCHAR(20),
  @Grp_Name       VARCHAR(50),         
  @Grp_Under      INT,
  @Grp_Level      INT,
  @Affect_Gp       BIT,
  @Remarks        VARCHAR(100),
  @Created_Date   INT,
  @RetSno	        INT OUTPUT

  WITH ENCRYPTION AS 
        BEGIN
        SET NOCOUNT ON
        DECLARE @isExists INT
        DECLARE @Grp_Nature INT

    BEGIN TRANSACTION

        SELECT @Grp_Level=Grp_Level+1 FROM Ledger_Groups WHERE GrpSno=@Grp_Under
        SELECT @Grp_Nature=Grp_Nature FROM Ledger_Groups WHERE GrpSno=@Grp_Under

        DECLARE @GrpDesc VARCHAR(200)

        IF EXISTS(SELECT GrpSno FROM Ledger_Groups WHERE GrpSno=@GrpSno)
            BEGIN
                IF (SELECT IsStd FROM Ledger_Groups WHERE GrpSno=@GrpSno) =1
                  BEGIN
                    Raiserror ('Standard Group cannot be altered', 16, 1) 
					          GOTO CloseNow
                  END
               IF @GrpSno=@Grp_Under
                BEGIN
                  Raiserror ('Ledger Group and under group cannot be same. Invalid', 16, 1) 
					        GOTO CloseNow
                END

                Update Ledger_Groups SET Grp_Code=@Grp_Code,Grp_Name=@Grp_Name,Grp_Under=@Grp_Under,Grp_Level=@Grp_Level,Grp_Nature=@Grp_Nature,Remarks=@Remarks,Created_Date=@Created_Date, Affect_Gp=@Affect_Gp
                WHERE GrpSno=@GrpSno
                If @@ERROR <> 0 GOTO CloseNow
            END
        ELSE
            BEGIN
                IF EXISTS (SELECT GrpSno FROM Ledger_Groups WHERE Grp_Name=@Grp_Name)
                  BEGIN
                    Raiserror ('Ledger Group already exists', 16, 1) 
					          GOTO CloseNow
                  END
                SET @Grp_Code = LEFT(@Grp_Name, 20)
                INSERT INTO Ledger_Groups (Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Nature,Remarks,Created_Date,Affect_Gp,IsStd) 
                VALUES (@Grp_Code,@Grp_Name,@Grp_Under,@Grp_Level,@Grp_Nature,@Remarks,@Created_Date,@Affect_Gp,0)
                IF @@Error <> 0 GOTO CloseNow
                SET @GrpSno=@@IDENTITY
            END
            SELECT @GrpDesc=Grp_Desc FROM Ledger_Groups WHERE GrpSno=@Grp_Under
            SET @GrpDesc=@GrpDesc+'G'+[dbo].PreFillString(@GrpSno,3)+'G'
            UPDATE Ledger_Groups SET Grp_Desc=@GrpDesc  WHERE GrpSno=@GrpSno
            IF @@Error <> 0 GOTO CloseNow

        COMMIT TRANSACTION
        SET @RetSno = @GrpSno
        RETURN @GrpSno
        CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END

GO
       

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLedger_Groups') BEGIN DROP FUNCTION Udf_getLedger_Groups END
GO
CREATE FUNCTION Udf_getLedger_Groups(@GrpSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
        
  SELECT  (
            SELECT      Ag.* ,Ag.Grp_Name as 'Name', Ag.Grp_Name as 'Details',
                        Gu.GrpSno as 'GroupUnder.GrpSno', Gu.Grp_Code as 'GroupUnder.Grp_Code', Gu.Grp_Name as 'GroupUnder.Grp_Name', Gu.Grp_Name as 'GroupUnder.Name', Gu.Grp_Name as 'GroupUnder.Details'
            FROM        Ledger_Groups Ag
                        INNER JOIN Ledger_Groups Gu ON Gu.GrpSno=Ag.Grp_Under
            WHERE       (Ag.GrpSno=@GrpSno OR @GrpSno=0)
            FOR JSON PATH
          ) as Json_Result
        
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Ledger_Group_Delete') BEGIN DROP PROCEDURE Sp_Ledger_Group_Delete END
GO
CREATE PROCEDURE Sp_Ledger_Group_Delete
	@GrpSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
      DECLARE @IsStd BIT = (SELECT IsStd FROM Ledger_Groups WHERE GrpSno=@GrpSno)
      IF @IsStd = 1
        BEGIN
          Raiserror ('Standard Groups cannot be deleted', 16, 1) 
					GOTO CloseNow
        END

			IF EXISTS (SELECT LedSno FROM Ledgers WHERE GrpSno=@GrpSno)
				BEGIN
					Raiserror ('Ledgers exists with this Group. Cannot Delete', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Ledger_Groups WHERE GrpSno=@GrpSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SSp_AccLedger_Master') BEGIN DROP PROCEDURE SSp_AccLedger_Master END
GO

CREATE PROCEDURE SSp_AccLedger_Master 
        -- Add the parameters for the stored PROCEDURE here
         @LedSno            INT,
         @Led_Code          VARCHAR(20),
         @Led_Name          VARCHAR(200),         
         @GrpSno            INT,
         @OpenSno           INT,
         @Opening_Balance   MONEY,
         @AcType            BIT,         
         @Created_Date      INT,
         @CompSno           INT,
         @UserSno           INT,
         @RetSno	        INT OUTPUT

    WITH ENCRYPTION AS 
        BEGIN
         SET NOCOUNT ON
         DECLARE @isExists   INT
         DECLARE @Grp_Desc    VARCHAR(50)
         DECLARE @Led_Desc    VARCHAR(50)        
         BEGIN TRANSACTION
         

         SELECT @Grp_Desc=Grp_Desc FROM Ledger_Groups WHERE GrpSno=@GrpSno
         SET @Led_Desc=@Grp_Desc+'L'+[dbo].PreFillString(0,3)+'L'
         SET @Led_Code = LEFT(@Led_Name,20)

         IF EXISTS(SELECT LedSno FROM Ledgers WHERE LedSno=@LedSno)
             BEGIN
                  DECLARE @IsStd BIT = (SELECT IsStd FROM Ledgers WHERE LedSno=@LedSno)
                  IF @IsStd <> 1
                  BEGIN
                     UPDATE Ledgers SET Led_Code=@Led_Code,Led_Name=@Led_Name,GrpSno=@GrpSno,Created_Date=@Created_Date, CompSno=@CompSno, UserSno=@UserSno
                     WHERE LedSno=@LedSno
                     IF @@ERROR <> 0 GOTO CloseNow
                  END
                 DELETE FROM Vouchers WHERE VouSno=@OpenSno
                 IF @@ERROR <> 0 GOTO CloseNow
                 DELETE FROM Voucher_Details WHERE VouSno=@OpenSno
                 IF @@ERROR <> 0 GOTO CloseNow
             END
         ELSE
             BEGIN                
                 INSERT INTO Ledgers (Led_Code,Led_Name,GrpSno, OpenSno, Led_Desc, IsStd, Created_Date,CompSno,UserSno,Std_No) 
                 VALUES (@Led_Code,@Led_Name,@GrpSno,0,@Led_Desc,0,@Created_Date,@CompSno,@UserSno,0)
                 IF @@ERROR <> 0 GOTO CloseNow
                 SET @LedSno=@@IDENTITY
             END

            IF @Opening_Balance <> 0
              BEGIN
                DECLARE @SeriesSno INT = (SELECT SeriesSno FROM Voucher_Series WHERE CompSno=@CompSno AND VouTypeSno = 1)
                INSERT INTO Vouchers(VouTypeSno, SeriesSno, Vou_No, Vou_Date, Narration, TrackSno, IsAuto, GenType, UserSno, CompSno)
                VALUES (1, @SeriesSno, '', 0, 'Ledger Opening Balance', 0, 1, 0, @UserSno, @CompSno)
                IF @@ERROR <> 0 GOTO CloseNow
                SET @OpenSno=@@IDENTITY

                IF @AcType = 0
                  BEGIN
                    INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) VALUES  (@OpenSno, @LedSno, @Opening_Balance, 0)
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
                ELSE
                  BEGIN
                    INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) VALUES  (@OpenSno, @LedSno, 0, @Opening_Balance)
                    IF @@ERROR <> 0 GOTO CloseNow
                  END                 

                UPDATE Ledgers SET OpenSno=@OpenSno WHERE LedSno=@LedSno
                IF @@ERROR <> 0 GOTO CloseNow

              END

        COMMIT TRANSACTION
        SET @RetSno = @LedSno
        RETURN @LedSno
        CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLedgers') BEGIN DROP FUNCTION Udf_getLedgers END
GO
CREATE FUNCTION Udf_getLedgers(@LedSno INT, @GrpSno INT, @CompSno INT, @ExcludeGrpSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT  (
          SELECT      Led.*, Led.Led_Name as 'Name', Grp.Grp_Name as 'Details',
                      Opening_Balance = ISNULL(CASE
                                          WHEN (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno) <> 0
                                            THEN  (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno)
                                          ELSE (SELECT SUM(Credit) FROM Voucher_Details WHERE VouSno = Led.OpenSno)
                                          END,0),
                      AcType = CASE
                                    WHEN (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno) <> 0
                                      THEN  0
                                    ELSE 1
                                    END,
                      Grp.GrpSno as 'Group.GrpSno', Grp.Grp_Code as 'Group.Grp_Code', Grp.Grp_Name as 'Group.Grp_Name', Grp.Grp_Name as 'Group.Name', Grp.Grp_Name as 'Group.Details' 
          FROM        Ledgers Led
                      INNER JOIN Ledger_Groups Grp ON Grp.GrpSno = Led.GrpSno                            
          WHERE       (Led.LedSno=@LedSno OR @LedSno=0) AND (Led.GrpSno=@GrpSno OR @GrpSno = 0) AND (Led.CompSno=@CompSno) AND (Led.LedSno <> @ExcludeGrpSno)

          FOR JSON PATH
          ) as Json_Result
        
 GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Ledger_Delete') BEGIN DROP PROCEDURE Sp_Ledger_Delete END
GO
CREATE PROCEDURE Sp_Ledger_Delete
	@LedSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
      DECLARE @IsStd BIT = (SELECT IsStd FROM Ledgers WHERE LedSno=@LedSno)
      DECLARE @OpenSno INT = (SELECT OpenSno FROM Ledgers WHERE LedSno=@LedSno)
      IF @IsStd = 1
        BEGIN
          Raiserror ('Standard Ledgers cannot be deleted', 16, 1) 
					GOTO CloseNow
        END
        
			IF EXISTS (SELECT LedSno FROM Voucher_Details WHERE LedSno=@LedSno AND VouSno <> @OpenSno)
				BEGIN
					Raiserror ('Vouchers exists with this Ledger. Cannot Delete', 16, 1) 
					GOTO CloseNow
				END
      DELETE FROM Voucher_Details WHERE VouSno=@OpenSno
      IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Vouchers WHERE VouSno=@OpenSno
      IF @@ERROR <> 0 GOTO CloseNow
			DELETE FROM Ledgers WHERE LedSno=@LedSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_AccVouchers') BEGIN DROP PROCEDURE Sp_AccVouchers END
GO

CREATE PROCEDURE Sp_AccVouchers        
  @VouSno             INT,
  @VouTypeSno         INT,
  @SeriesSno          INT,    
  @Vou_No             VARCHAR(20),
  @Vou_Date           INT,                  
  @Narration          VARCHAR(200),
  @TrackSno           INT,
  @IsAuto             BIT,
  @GenType            TINYINT,
  @UserSno            INT,
  @CompSno			      INT,
  @VouDetailXML      XML,
  @RetSno			        INT OUTPUT
        
WITH ENCRYPTION AS 
BEGIN
  SET NOCOUNT ON		 
  DECLARE @NumType    TINYINT
  BEGIN TRANSACTION
         
	IF EXISTS(SELECT VouSno FROM Vouchers WHERE VouSno=@VouSno)
          BEGIN
              UPDATE Vouchers SET VouTypeSno=@VouTypeSno,SeriesSno=@SeriesSno,Vou_No=@Vou_No,Vou_Date=@Vou_Date,Narration=@Narration,TrackSno=@TrackSno,IsAuto=@IsAuto,GenType=@GenType,UserSno=@UserSno, CompSno=@CompSno
              WHERE VouSno=@VouSno
              If @@Error <> 0 Goto CloseNow
              /* Deleting All sub TABLE Rows*/
              DELETE FROM Voucher_Details WHERE VouSno=@VouSno
              If @@Error <> 0 Goto CloseNow
          END
      ELSE        
          BEGIN    
              IF @VouTypeSno < 12
                BEGIN
                    DECLARE @Num_Method TINYINT
                    SELECT @Num_Method=Num_Method FROM Voucher_Series WHERE SeriesSno=@SeriesSno

                    IF (@Num_Method=2)
                    BEGIN
                        SET @Vou_No= [dbo].GenerateVoucherNo(@SeriesSno)           
                    END                  
                END
                
              INSERT INTO Vouchers (VouTypeSno,SeriesSno,Vou_No,Vou_Date,Narration,TrackSno,IsAuto,GenType,UserSno,CompSno)
              VALUES (@VouTypeSno,@SeriesSno,@Vou_No,@Vou_Date,@Narration,@TrackSno,@IsAuto,@GenType,@UserSno,@CompSno)
              IF @@Error <> 0 GOTO CloseNow
              SET @VouSno=@@Identity

              IF (@Num_Method <> 0)
                BEGIN
                    UPDATE Voucher_Series SET Current_No = Current_No + 1 WHERE SeriesSno=@SeriesSno
                    IF @@ERROR <> 0 GOTO CloseNow
                END
          END

         DECLARE @idoc       INT
         DECLARE @Sno        INT 
         DECLARE @LedSno     INT
         DECLARE @Debit      MONEY
         DECLARE @Credit     MONEY
        
         DECLARE @DetTable TABLE
             (
             Sno INT IDENTITY(1,1),LedSno INT,Debit MONEY,Credit MONEY
             )
         Exec sp_xml_preparedocument @idoc OUTPUT, @VouDetailXML
        
         INSERT INTO @DetTable
             (
             LedSno,Debit,Credit
             )
         SELECT  * FROM  OpenXml 
             (
              @idoc, '/ROOT/Voucher/Voucher_Details',2
             )
         WITH 
            (
              LedSno INT '@LedSno',Debit MONEY '@Debit',Credit MONEY '@Credit'
            )
         SELECT      TOP 1 @Sno=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                     FROM @DetTable
        /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
         WHILE @@ROWCOUNT <> 0 
             BEGIN
                 INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) 
                 VALUES (@VouSno,@LedSno,@Debit,@Credit)
                 IF @@Error <> 0 GOTO CloseNow
                 DELETE FROM @DetTable WHERE Sno = @Sno
                 
				 SELECT      TOP 1 @Sno=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                 FROM        @DetTable
             END
         Exec Sp_Xml_Removedocument @idoc
        COMMIT TRANSACTION
        SET @RetSno = @VouSno
        RETURN @VouSno

  CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERS') BEGIN DROP VIEW VW_VOUCHERS END
GO

CREATE VIEW VW_VOUCHERS
WITH ENCRYPTION AS
  SELECT    Vou.*, VTyp.VouType_Name, Ser.Series_Name,
            Voucher_Amount = (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno=Vou.VouSno),
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Vou.VouSno AND Document_Type = 2 AND Updation_Type = 2) THEN 2 ELSE 1 END

  FROM      Vouchers Vou
            INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Vou.VouTypeSno
            INNER JOIN Voucher_Series Ser ON Ser.SeriesSno = Vou.SeriesSno            
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVouchers') BEGIN DROP FUNCTION Udf_getVouchers END
GO
CREATE FUNCTION Udf_getVouchers(@VouSno INT, @VouTypeSno INT, @SeriesSno INT, @CompSno INT, @Cancel_Status TINYINT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
  SELECT    Vou.*,
            --Det.DetSno, Det.LedSno, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Led_Name', Led.Led_Name as 'Ledger.Name',Led.Led_Name as 'Ledger.Details',
            ( SELECT  Det.*, Type = CASE WHEN Debit > 0 THEN 0 ELSE 1 END, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Led_Name', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'
              FROM    Voucher_Details Det
                      INNER JOIN Ledgers Led ON Led.LedSno = Det.LedSno
              WHERE   VouSno = Vou.VouSno FOR JSON PATH) VouDetails_Json
  FROM      VW_VOUCHERS Vou
            
  WHERE     (Vou.VouSno=@VouSno OR @VouSno = 0) AND
            (Vou.VouTypeSno=@VouTypeSno OR @VouTypeSno = 0) AND
            (Vou.SeriesSno=@SeriesSno OR @SeriesSno = 0) AND
            (Vou.Cancel_Status = @Cancel_Status OR @Cancel_Status=0) AND
            (Vou.CompSno=@CompSno)

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Delete') BEGIN DROP PROCEDURE Sp_Voucher_Delete END
GO
CREATE PROCEDURE Sp_Voucher_Delete
	@VouSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION      
      DELETE FROM Voucher_Details WHERE VouSno=@VouSno
      IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Vouchers WHERE VouSno=@VouSno
      IF @@ERROR <> 0 GOTO CloseNow			
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERMASTER') BEGIN DROP VIEW VW_VOUCHERMASTER END
GO

CREATE VIEW VW_VOUCHERMASTER
        WITH ENCRYPTION
        AS
            SELECT      Vm.VouSno, Vm.VouTypeSno, Vt.VouType_Name, Vm.SeriesSno,Vs.Series_Name,
                        Vm.Vou_No, Vm.Vou_Date,
                        Vm.TrackSno, Vm.Narration, 
                        Vs.BranchSno, Vm.CompSno
            FROM        Vouchers Vm
                        INNER JOIN  Voucher_Types Vt ON Vm.VouTypeSno = Vt.VouTypeSno
                        INNER JOIN  Voucher_Series Vs ON Vs.SeriesSno = Vm.SeriesSno
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERDETAILS') BEGIN DROP VIEW VW_VOUCHERDETAILS END
GO
CREATE VIEW VW_VOUCHERDETAILS
        WITH ENCRYPTION
        AS
          SELECT    Vd.DetSno, Vd.VouSno, Vm.Vou_Date,Vm.TrackSno, Vm.VouTypeSno, Vt.VouType_Name,
                    Vm.Vou_No, Vd.LedSno, Lm.GrpSno, Lg.Grp_Name, Lm.Led_Name,
                    Vd.Credit, Vd.Debit, Lg.Grp_Nature, Lm.Led_Desc, Vs.BranchSno,
                    Vm.Narration, Vm.CompSno
          FROM      Voucher_Details Vd
                    INNER JOIN Ledgers Lm  ON Vd.LedSno = Lm.LedSno
                    INNER JOIN Vouchers Vm       ON Vd.VouSno = Vm.VouSno
                    INNER JOIN  Voucher_Types Vt  ON Vm.VouTypeSno = Vt.VouTypeSno
                    INNER JOIN Ledger_Groups Lg  ON Lm.GrpSno = Lg.GrpSno
                    INNER JOIN  Voucher_Series Vs ON Vm.SeriesSno = Vs.SeriesSno
        
   GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_BILLWISEDETAILS') BEGIN DROP VIEW VW_BILLWISEDETAILS END
GO

CREATE VIEW VW_BILLWISEDETAILS
WITH ENCRYPTION
AS
SELECT          Vd.LedSno,Av.Vou_Date,Av.SeriesSno,Av.VouTypeSno,Vt.VouType_Name,
                Vd.VouSno,Vd.DetSno,Amount=Vd.Credit -Vd.Debit,
                Vd.Credit,Vd.Debit,Lm.Led_Name,Lm.GrpSno,
                Lg.Grp_Name,Lg.Grp_Level,Lg.Grp_Under,Lg.Grp_Nature ,Lg.Affect_Gp,
                Lg.Grp_Desc,Lm.Led_Desc + CAST(Lm.LedSno AS VARCHAR(10)) AS Led_Desc,
                Vs.BranchSno,Av.CompSno,
                Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Av.VouSno AND Document_Type = 2 AND Updation_Type = 2) THEN 2 ELSE 1 END
FROM            Voucher_Details Vd
                INNER JOIN Vouchers Av ON Av.VouSno  = Vd.VouSno
                INNER JOIN Voucher_Types Vt ON Vt.VouTypeSno = Av.VouTypeSno
                INNER JOIN Ledgers Lm ON Lm.LedSno = Vd.LedSno
                INNER JOIN Ledger_Groups Lg ON Lg.GrpSno = Lm.GrpSno
                INNER JOIN Voucher_Series Vs ON Vs.SeriesSno = Av.SeriesSno
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_LEDGERS') BEGIN DROP VIEW VW_LEDGERS END
GO

CREATE VIEW VW_LEDGERS
  WITH ENCRYPTION
  AS
    SELECT         GrpSno AS Sno, Grp_Name AS [Name],
                    Grp_Level, 1 AS IsGrp, Grp_Desc AS hDesc,Grp_Nature,Affect_Gp,CompSno
    FROM           Companies_Ledger_Groups
    Union All
    SELECT        Lm.LedSno AS Sno, lm.Led_Name AS [Name],
                  Lg.Grp_Level + 1 AS [Grp_Level],0 AS IsGrp, Lm.Led_Desc+ Cast(LedSno AS VARCHAR(10)) AS hDesc,Lg.Grp_Nature,Lg.Affect_Gp, CompSno
    FROM          Ledgers Lm INNER JOIN
                  Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
    Union All
    SELECT        0 AS Sno,'Opening Stock' AS [Name],
                  2 AS [Grp_Level], 0 AS IsGrp,'G001GG007GG000G' AS HDesc,2 AS GrpNature, 0 AS AffectGp, 0 as CompSno
 GO

 
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_LEDGERMASTER') BEGIN DROP VIEW VW_LEDGERMASTER END
GO

CREATE VIEW VW_LEDGERMASTER
WITH ENCRYPTION
AS
  SELECT    Lm.LedSno,Lm.Led_Name,Lm.Led_Desc,
            Lm.IsStd,Lg.GrpSno,
            Lg.Grp_Name,Lg.Grp_Level,Lg.Grp_Under,Lg.Grp_Nature,Lg.Affect_Gp ,
            Lg.Grp_Desc,Lm.CompSno
  FROM      Ledgers Lm
            INNER JOIN Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
  WHERE     Lm.Std_No <> 1
 GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_VoucherDisplay') BEGIN DROP FUNCTION Udf_VoucherDisplay END
GO

CREATE FUNCTION Udf_VoucherDisplay(@FromDt INT, @ToDt AS INT,
@BranchSno AS INT, @VouTypeSno AS INT,
@Vou_No AS VARCHAR(20),@CompSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT      *
  FROM           VW_VOUCHERDETAILS
  WHERE        (@VouTypeSno=0  OR VouTypeSno = @VouTypeSno)
                AND (CompSno=@CompSno)
                AND (@BranchSno=0   OR BranchSno = @BranchSno)
                AND (@Vou_No = ''   OR Vou_No = @Vou_No)                        
                AND (Vou_Date BETWEEN @FromDt AND @ToDt)

  GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='GetFinYrFromDt') BEGIN DROP FUNCTION GetFinYrFromDt END
GO

  CREATE FUNCTION GetFinYrFromDt(@cDate AS INT) 
        RETURNS INTEGER 
        WITH ENCRYPTION 
        AS 
          BEGIN
				DECLARE @Date DATE = [dbo].IntToDate(@cDate)
              DECLARE @Month  INTEGER
              DECLARE @Year   INTEGER
              DECLARE @Result INTEGER
              SELECT @Month   = MONTH(@Date) 
              SELECT @Year    = YEAR(@Date) 
              SELECT @Year    = CASE 
                          WHEN @Month < 4 THEN @Year - 1 
                          ELSE @Year 
                        END  
              SELECT @Result  = CAST(@Year AS VARCHAR) + CAST('0401' AS VARCHAR)              
              RETURN (CAST(@Result AS INT)) 
          END
GO

  IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetOutStandingSummary') BEGIN DROP FUNCTION Udf_GetOutStandingSummary END
  GO
  
  CREATE FUNCTION Udf_GetOutStandingSummary(@hDesc VARCHAR(100),@AsOn INT,@CompSno INT)
    RETURNS TABLE
    WITH ENCRYPTION
		RETURN		(	SELECT			GrpSno,LedSno,Led_Desc, Led_Name, SUM(Credit) AS Credit, SUM(Debit) AS Debit
						    FROM			  ( SELECT    GrpSno,LedSno,Led_Desc,Led_Name,
														            Credit = CASE When SUM(Amount)< 0 Then 0 ELSE Abs(SUM(Amount)) END,
														            Debit  = CASE When SUM(Amount)> 0 Then 0 ELSE Abs(SUM(Amount)) END
										          FROM		  VW_BILLWISEDETAILS
										          WHERE			CompSno=@CompSno AND (Led_Desc LIKE @hDesc AND Vou_Date <= @AsOn)
                          
										          GROUP BY		GrpSno, LedSno,Led_Desc, Led_Name ) t

          GROUP BY     GrpSno, LedSno,Led_Desc, Led_Name)
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetGrpBalance') BEGIN DROP FUNCTION Udf_GetGrpBalance END
  GO

  CREATE FUNCTION Udf_GetGrpBalance
			(@GrpSno AS INTEGER,
			@AsOn AS INTEGER,
			@YearFrom AS INTEGER,
			@BranchSno AS INTEGER,
			@CompSno INT)
        RETURNS MONEY
        WITH ENCRYPTION
        AS
          BEGIN
              DECLARE @Grp_Nature       TINYINT
              DECLARE @Grp_Desc         VARCHAR(100)
              DECLARE @PrvYear          INTEGER
              DECLARE @Bal              MONEY
              DECLARE @MyTable          TABLE(  Vou_Date    INT,
                                    LedSno          INT,
                                    Led_Desc        VARCHAR(100),
                                    Grp_Nature      TINYINT,
                                    Credit          MONEY,
                                    Debit           MONEY,
                                    Amount          MONEY,                                    
                                    Cancel_Status   BIT)
        
              IF @YearFrom = 0
                  SET @YearFrom = @AsOn
              SET @PrvYear = @YearFrom -1

              SELECT    @Grp_Desc = Grp_Desc +'%',@Grp_Nature = Grp_Nature
              FROM		Ledger_Groups
              WHERE     GrpSno = @GrpSno
        
              INSERT INTO	@Mytable
				  SELECT        Vou_Date, LedSno, Led_Desc, Grp_Nature, Credit, Debit, Amount, Cancel_Status
				  FROM			VW_BILLWISEDETAILS
				  WHERE         (@BranchSno =0 OR BranchSno = @BranchSno) AND (CompSno= @CompSno)

					Union All

				  SELECT        0 AS Vou_Date,Lm.LedSno, Lm.Led_Desc + CAST(Lm.LedSno AS VARCHAR(10)) AS Led_Desc,Lg.Grp_Nature, 0 AS Credit, 0 AS Debit, 0 AS Amount,1 AS Cancel_Status
				  FROM          Ledgers lm 
								        Inner Join Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
				  WHERE			    (Lm.Std_No = 3) AND (lm.CompSno=@CompSno)
        
			SELECT      @Bal =  CASE WHEN @Grp_Nature = 0 THEN
                                  (SELECT SUM(Amount) FROM  @Mytable
                                   WHERE (Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4) AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN 0 AND @PrvYear)
                              WHEN @Grp_Nature = 1 OR @Grp_Nature = 2 THEN  --If this ledger GrpNature is Assets AND Liabilities
                                  (SELECT SUM(Amount) FROM @Mytable
                                  WHERE Led_Desc LIKE @Grp_Desc AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN 0 AND @AsOn)
                              ELSE -- ELSE it should be Income AND exp
                                  (SELECT SUM(Amount) FROM @Mytable
                                  WHERE Led_Desc LIKE @Grp_Desc AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN @YearFrom AND @AsOn)
                          END
              SELECT      @Bal = ISNULL(@Bal,0)
              RETURN      @Bal
          END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetLedBalance') BEGIN DROP FUNCTION Udf_GetLedBalance END
  GO

CREATE FUNCTION Udf_GetLedBalance(@LedSno AS INTEGER ,@AsOn AS INTEGER ,@YearFrom AS INTEGER = 0, @BranchSno AS integer,@CompSno INT)
        RETURNS MONEY
        WITH ENCRYPTION
        AS
          BEGIN
              DECLARE @GrpNature      TINYINT
              DECLARE @PrvYear        INTEGER
              DECLARE @Bal            MONEY
              If @YearFrom = 0
                  SET @YearFrom = @AsOn
              SET @PrvYear= @YearFrom -1
              SELECT  @GrpNature = gm.Grp_Nature
              FROM    Ledgers lm 
						Inner Join Ledger_Groups gm On lm.GrpSno = gm.GrpSno
              WHERE   (lm.LedSno = @LedSno)

              If @GrpNature = 1 OR @GrpNature = 2
                  SELECT        @Bal = SUM(Amount)
                  FROM			VW_BILLWISEDETAILS
                  WHERE         LedSno = @LedSno
                                AND (Vou_Date BETWEEN 0 AND @AsOn)
                                AND Cancel_Status = 1
                                AND (@BranchSno = 0 OR BranchSno = @BranchSno)                                
              ELSE If @GrpNature = 0
                  SELECT        @Bal = SUM(Amount)
                  FROM		VW_BILLWISEDETAILS
                  WHERE			(Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4)
                          AND (Vou_Date BETWEEN 0 AND @PrvYear)
                          AND Cancel_Status = 1
                          AND (@BranchSno = 0 OR BranchSno = @BranchSno)
                          AND CompSno=@CompSno
                          
              ELSE
                  SELECT      @Bal = SUM(Amount)
                  FROM			VW_BILLWISEDETAILS
                  WHERE       LedSno = @LedSno
                          AND (Vou_Date BETWEEN @YearFrom AND @AsOn)
                          AND Cancel_Status = 1
                          AND (@BranchSno = 0 OR BranchSno = @BranchSno)
                          
              SELECT      @Bal = ISNULL(@Bal,0)
              RETURN      @Bal
          END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetLedgerTransaction') BEGIN DROP FUNCTION Udf_GetLedgerTransaction END
GO
  
CREATE FUNCTION Udf_GetLedgerTransaction( @GrpDesc VARCHAR(100),@FromDt AS INTEGER ,@ToDt AS INTEGER,@YearFrom AS INTEGER,@BranchSno AS INTEGER,@CompSno INT)
        RETURNS @RetResult TABLE (LedSno     INT, Led_Desc    VARCHAR(100), OpnCr     MONEY, OpnDr     MONEY, TrnCr     MONEY, TrnDr     MONEY, ClsCr     MONEY, ClsDr     MONEY)
  WITH ENCRYPTION
        AS
          BEGIN
            DECLARE @PandL_Sno      INT
            DECLARE @PandL_HeadNo   VARCHAR(100)

            SELECT  @PandL_Sno = lm.LedSno, @PandL_HeadNo = lm.Led_Desc + CAST(lm.LedSno AS VARCHAR(10))
            FROM    Ledgers lm 
					          INNER JOIN Ledger_Groups gm On lm.GrpSno = gm.GrpSno
            WHERE   CompSno=@CompSno AND lm.Std_No = 3 --  Profit & Loss a/c

            INSERT @RetResult
              SELECT    Coalesce(T1.LedSno,T2.LedSno) LedSno,
                        Coalesce(T1.Led_Desc,T2.Led_Desc) Led_Desc,
                        OpnCr = CASE When OpnAmt > 0 Then Abs(OpnAmt) ELSE 0 END,
                        OpnDr = CASE When OpnAmt < 0 Then Abs(OpnAmt) ELSE 0 END,
                        TrnCr = ISNULL(T1.TrnCr, 0),
                        TrnDr = ISNULL(T1.TrnDr, 0),
                        ClsCr = CASE When ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0) > 0 Then Abs(ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0)) ELSE 0 END,
                        ClsDr = CASE When ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0) < 0 Then Abs(ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0)) ELSE 0 END

                        

              FROM      ( SELECT      LedSno,Led_Desc,SUM(Credit) AS TrnCr, SUM(Debit) AS TrnDr
                          FROM        VW_BILLWISEDETAILS
					                WHERE       Cancel_Status = 1 AND (Vou_Date BETWEEN @FromDt AND @ToDt) AND (CompSno=@CompSno) AND (@BranchSno =0 OR BranchSno =@BranchSno)
                                      AND Led_Desc LIKE @GrpDesc
                          GROUP BY    LedSno,Led_Desc) T1

                          Full OUTER JOIN 
        
                          ( SELECT        @PandL_Sno AS LedSno,@PandL_HeadNo AS Led_Desc,SUM(Amount) AS OpnAmt
                            FROM			    VW_BILLWISEDETAILS
                            WHERE			    Cancel_Status = 1 AND (Vou_Date BETWEEN 0 AND @FromDt-1) AND (Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4)
                                          AND (CompSno=@CompSno)
							                            AND (@BranchSno =0 OR BranchSno = @BranchSno)AND Led_Desc LIKE @GrpDesc
                            UNION ALL

                            SELECT      LedSno,Led_Desc,SUM(Amount) AS OpnAmt
                            FROM			  VW_BILLWISEDETAILS
                            WHERE       (Vou_Date BETWEEN 0 AND @FromDt-1) AND Cancel_Status = 1 AND (Grp_Nature = 1 OR Grp_Nature = 2) AND (CompSno=@CompSno)
                                        AND (@BranchSno =0 OR BranchSno =@BranchSno)AND Led_Desc LIKE @GrpDesc
                            GROUP BY    LedSno,Led_Desc) T2

                            On T1.LedSno = T2.LedSno 
            RETURN
          END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetBalanceSheet') BEGIN DROP FUNCTION Udf_GetBalanceSheet END
GO


CREATE FUNCTION Udf_GetBalanceSheet(@FromDt INTEGER, @ToDt   INTEGER, @Grouped Bit=1, @ValutionMethod TinyInt, @BranchSno AS INTEGER,@CompSno INT)
RETURNS @RetResult TABLE(Sno      INTEGER,
          [Name]      VARCHAR(50),
          [Grp_Level]     INTEGER,
          IsGrp       BIT,
          HDesc      VARCHAR(100),
          Grp_Nature   TINYINT,
          Affect_Gp    BIT,
          Amount      MONEY)
WITH ENCRYPTION
AS
  BEGIN
      DECLARE @PrvYearTo  INTEGER
      DECLARE @OpnPL      MONEY
      DECLARE @CurPL      MONEY
      DECLARE @TrnPL      MONEY
      DECLARE @MyTable    TABLE(LedSno INT,Led_Desc VARCHAR(100),Amount MONEY)
      DECLARE @LedList    TABLE(Sno INT,[Name] VARCHAR(50), [Grp_Level] INT, IsGrp BIT, hDesc VARCHAR(100), Grp_Nature TINYINT, Affect_Gp BIT,CompSno INT)
        
      SET @PrvYearTo      = @FromDt-1
      INSERT INTO @MyTable
      SELECT  LedSno, Led_Desc,Amount
      FROM VW_BILLWISEDETAILS
      WHERE   (Grp_Nature=1 OR Grp_Nature=2)AND (Cancel_Status=1)AND
          (Vou_Date BETWEEN 0 AND @ToDt)AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)
        
      -- find PrvYear P&L AND assign to @OpnPL
      SELECT @OpnPL = [dbo].Udf_GetLedBalance( (SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno),@FromDt,0,@BranchSno,@CompSno)
      SELECT @OpnPL = ISNULL(@OpnPL,0)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LBAL',@OpnPL)
        
      -- find CurPeriod P&L AND assign to @CurPL
      SELECT  @CurPL = SUM(Amount) FROM  VW_BILLWISEDETAILS
      WHERE   (Grp_Nature=3 OR Grp_Nature=4)AND (Cancel_Status = 1)AND
          (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)

      SELECT  @CurPL = ISNULL(@CurPL,0)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LCUR',@CurPL)
        
      -- find Transferred P&L AND assign to @TrnPL
      SELECT  @TrnPL = SUM(Amount) FROM  VW_BILLWISEDETAILS
      WHERE   (LedSno=(SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno)) AND (Cancel_Status = 1)AND
          (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LTRN',@TrnPL)
        
      INSERT INTO @LedList SELECT * FROM  VW_LEDGERS WHERE Grp_Nature =1 OR Grp_Nature = 2 AND CompSno=@CompSno
        
      -- in the above cond profit & Loss a/c will not be added,Bcoz its GrpNature is 0,AND also we should change Isgrp = 1 so that we add manualy
      INSERT INTO @LedList SELECT Sno,[Name],[Grp_Level],1,hDesc,Grp_Nature,Affect_Gp,CompSno FROM  VW_LEDGERS WHERE Grp_Nature = 0 AND Sno =(SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno) AND CompSno=@CompSno
        
      -- under prpfit & loss, the following ledger should be added, to show detail of P&L
      INSERT INTO @LedList VALUES(0,'Opening Balance',2,0,'G001GL000L3LBAL',0,0,@CompSno)
      INSERT INTO @LedList VALUES(0,'Current Period',2,0,'G001GL000L3LCUR',0,0,@CompSno)
      INSERT INTO @LedList VALUES(0,'Transferred',2,0,'G001GL000L3LTRN',0,0,@CompSno)
        
      INSERT @RetResult
      SELECT	Sno,[Name],[Grp_Level],IsGrp,hDesc,Grp_Nature,Affect_Gp,
		Amount= (SELECT ISNULL(SUM(Amount),0)
				FROM		@MyTable
					WHERE		Led_Desc LIKE hDesc OR Led_Desc LIKE hdesc + 'G%' OR Led_Desc LIKE hdesc + 'L%') * CASE When Grp_Nature = 2 Then -1 ELSE 1 END
					FROM		@LedList
					WHERE		(@Grouped = 0 OR IsGrp =@Grouped) AND [Grp_Level] = 1 OR [Grp_Level] = CASE When @Grouped = 1 Then 1 ELSE 2 END
					ORDER BY	Grp_Nature,hDesc
      RETURN
  END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance') BEGIN DROP PROCEDURE SP_TrialBalance END
GO
CREATE Procedure SP_TrialBalance (@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
WITH ENCRYPTION
AS 

  SET NoCount On

  DECLARE     @YearFrom   INTEGER
  DECLARE     @GrpDesc  VARCHAR(100)
  DECLARE     @Grp_Level   INTEGER
  DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)
  SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
  SELECT      @GrpDesc = Grp_Desc +'%', @Grp_Level = Grp_Level+1 FROM Ledger_Groups WHERE GrpSno = @GrpSno

  INSERT INTO   @MyTable
  SELECT		LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr
  FROM			Udf_GetLedgerTransaction(@GrpDesc,@FromDt, @ToDt, @YearFrom,@BranchSno,@CompSno)
        
  SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
              (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnCr,
              (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnDr,
              (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnCr,
              (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnDr,
              (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsCr,
              (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsDr
  FROM			  VW_LEDGERS
  WHERE       hDesc LIKE @GrpDesc AND [Grp_Level] = @Grp_Level AND Sno <> 1 AND CompSno=@CompSno
  GROUP BY    Sno,IsGrp, [Name], hdesc, [Grp_Level], Grp_Nature, Affect_Gp
  ORDER BY    IsGrp Desc,hdesc,[Name]
GO

  
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance_LedWise') BEGIN DROP PROCEDURE SP_TrialBalance_LedWise END
GO
CREATE PROCEDURE SP_TrialBalance_LedWise(@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
  WITH ENCRYPTION
  AS
    SET NOCOUNT ON
    DECLARE     @YearFrom		AS INT
    DECLARE     @Grp_Desc		AS VARCHAR(100)
    SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
    SELECT      @Grp_Desc  = Grp_Desc +'%' FROM Ledger_Groups WHERE GrpSno = @GrpSno
    DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)
        
    INSERT INTO @MyTable
    SELECT      LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr FROM [dbo].[Udf_GetLedgerTransaction](@Grp_Desc,@FromDt, @ToDt, @YearFrom, @BranchSno, @CompSno)

    SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
                (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) OpnCr,
                (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) OpnDr,
                (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) TrnCr,
                (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) TrnDr,
                (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) ClsCr,
                (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) ClsDr
    FROM        VW_LEDGERS vl
    WHERE       IsGrp = 0 AND hDesc LIKE @Grp_Desc AND CompSno=@CompSno
    GROUP BY    vl.Sno,vl.isgrp,vl.[Name], vl.hDesc, vl.[Grp_Level], vl.Grp_Nature, vl.Affect_Gp
    ORDER BY    [Name]


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SSP_TrialBalanceDetailed') BEGIN DROP PROCEDURE SSP_TrialBalanceDetailed END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance_Detailed') BEGIN DROP PROCEDURE SP_TrialBalance_Detailed END
GO
CREATE PROCEDURE SP_TrialBalance_Detailed(@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
WITH ENCRYPTION
    AS
      SET NOCOUNT ON
      DECLARE     @YearFrom   INTEGER
      DECLARE     @GrpDesc  VARCHAR(100)
      DECLARE     @Grp_Level   INTEGER
      DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)

      SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
      SELECT      @GrpDesc  = Grp_Desc +'%',@Grp_Level=Grp_Level+1 FROM Ledger_Groups WHERE GrpSno = @GrpSno

      INSERT INTO     @MyTable
      SELECT      LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr FROM [dbo].[Udf_GetLedgerTransaction](@GrpDesc,@FromDt, @ToDt, @YearFrom, @BranchSno, @CompSno)
      SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
                  (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnCr,
                  (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnDr,
                  (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnCr,
                  (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnDr,
                  (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsCr,
                  (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsDr
      FROM        VW_LEDGERS
      WHERE Sno <> 1 AND [Grp_Level] = 1 OR [Grp_Level] = 2 AND CompSno=@CompSno
      GROUP BY    Sno,IsGrp, [Name], hDesc, [Grp_Level], Grp_Nature, Affect_Gp
      ORDER BY    hDesc
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_ProfitAndLoss') BEGIN DROP PROCEDURE SP_ProfitAndLoss END
GO

CREATE PROC SP_ProfitAndLoss(@FromDt AS INT,@ToDt AS INT,@Grouped   AS BIT, @BranchSno AS INTEGER, @CompSno INT)
WITH ENCRYPTION
AS
  SET NOCOUNT ON
  DECLARE @MyTable    TABLE(LedSno INT,Led_Desc VARCHAR(100),Amount MONEY)
  DECLARE @PrvYearTo  INTEGER
  SET @PrvYearTo      = @FromDt-1
  INSERT INTO @MyTable
  SELECT      LedSno, Led_Desc,Amount
  FROM VW_BILLWISEDETAILS
  WHERE       (Grp_Nature = 3 OR Grp_Nature = 4)    AND
                  (Cancel_Status = 1)            AND
                  (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
                  (@BranchSno = 0 OR BranchSno = @BranchSno) AND
                  (CompSno=@CompSno)

  DECLARE     @LedList TABLE( Sno         INT,
                  [Name]      VARCHAR(50),
                  [Grp_Level]     INT,
                  IsGrp       BIT,
                  hDesc      VARCHAR(100),
                  Grp_Nature   TINYINT,
                  Affect_Gp    BIT,
                  CompSno INT)
  INSERT INTO @LedList
  SELECT * FROM  VW_LEDGERS WHERE (CompSno=@CompSno) AND (Grp_Nature =3 OR Grp_Nature = 4) 
        
  SELECT      Sno,[Name],[Grp_Level],IsGrp,hDesc,Grp_Nature,Affect_Gp,
              Amount=(SELECT  ISNULL(SUM(Amount),0)
                      FROM        @MyTable
                      WHERE       Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%')
                  ----Led_Desc LIKE hDesc + '%'
  FROM        @LedList
  WHERE       (@Grouped = 0 OR IsGrp =@Grouped) AND [Grp_Level] = 1 OR [Grp_Level] = CASE When @Grouped = 1 Then 1 ELSE 2 END
  ORDER BY    Affect_Gp Desc,Grp_Nature,hDesc
  GO

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetRecentTransactions') BEGIN DROP FUNCTION Udf_GetRecentTransactions END
GO

CREATE FUNCTION Udf_GetRecentTransactions(@CompSno INT)
    RETURNS TABLE
    WITH ENCRYPTION
    RETURN
SELECT		TOP 10 VTyp.VouTypeSno, VTyp.VouType_Name, Trans.TransSno, Trans.Trans_No, Trans.Trans_Date, Pty.Party_Name, Trans.Nett_Payable, Usr.UserName
FROM		  Transactions Trans
			    INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Trans.VouTypeSno
			    INNER JOIN Party Pty ON Pty.PartySno = Trans.PartySno
			    INNER JOIN Users Usr ON Usr.UserSno = Trans.UserSno
WHERE     Trans.CompSno=@CompSno
ORDER BY	Trans_Date DESC
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetSummedMonthlyLoanAmount') BEGIN DROP FUNCTION Udf_GetSummedMonthlyLoanAmount END
GO
CREATE FUNCTION Udf_GetSummedMonthlyLoanAmount(@CompSno INT,@Period TINYINT)
    RETURNS TABLE
    WITH ENCRYPTION
    RETURN
SELECT		MONTH([dbo].IntToDate(Loan_Date)) as Month, SUM(Principal) as Amount
FROM		  VW_LOANS
WHERE		  CompSno=@CompSno AND (Loan_Date >= [dbo].DateToInt(DATEADD(MONTH, @Period - ((@Period*2)-1) , GETDATE())))
GROUP BY	MONTH([dbo].IntToDate(Loan_Date))

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Repost_Vouchers') BEGIN DROP PROCEDURE Sp_Repost_Vouchers END
GO
CREATE PROCEDURE Sp_Repost_Vouchers
@CompSno INT
WITH ENCRYPTION AS
BEGIN  
--DECLARE @CompSno INT = 1
	BEGIN TRANSACTION
		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 12 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 12 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 13 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 13 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 14 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 14 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 15 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 15 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 17 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 17 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 18 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 18 AND CompSno=@CompSno
                           

		DELETE Det FROM Voucher_Details Det 
				INNER JOIN Vouchers Vou ON Vou.VouSno = Det.VouSno
		WHERE	Vou.VouTypeSno = 19 AND Vou.CompSno=@CompSno
                           
		DELETE FROM Vouchers WHERE VouTypeSno = 19 AND CompSno=@CompSno
    
	
		DECLARE @VouSno             INT = 0
		DECLARE @VouTypeSno         INT
		DECLARE @SeriesSno          INT    
		DECLARE @Vou_No             VARCHAR(20) 
		DECLARE @Vou_Date           INT                  
		DECLARE @Narration          VARCHAR(200) = ''	
		DECLARE @UserSno            INT	
		DECLARE @VouDetailXML		    XML
		
		DECLARE @LoanSno			      INT
		DECLARE @ReceiptSno			    INT
		DECLARE @RedemptionSno		  INT
		DECLARE @PartySno			      INT
		DECLARE @IsOpen				      TINYINT
		DECLARE @Principal			    MONEY
		DECLARE @AdvIntAmt			    MONEY
		DECLARE @DocChargesAmt		  MONEY
		DECLARE @Rec_Principal		  MONEY
		DECLARE @Rec_Interest		    MONEY
		DECLARE @Rec_Add_Less		    MONEY
		DECLARE @Rec_Default_Amt	  MONEY
		DECLARE @Rec_Other_Debits	  MONEY
		DECLARE @Rec_Other_Credits	MONEY
		DECLARE @Error				      VARCHAR(50) = ''
		DECLARE @PaymentModesXML	  XML

		SET @VouTypeSno = 12	
		DECLARE LoansList CURSOR FOR SELECT LoanSno,PartySno,IsOpen,Principal,AdvIntAmt,DocChargesAmt,SeriesSno,Loan_No, Loan_Date, UserSno  FROM VW_LOANS WHERE CompSno=@CompSno			
		OPEN LoansList
		FETCH NEXT FROM LoansList INTO @LoanSno,@PartySno,@IsOpen,@Principal,@AdvIntAmt,@DocChargesAmt,@SeriesSno, @Vou_No, @Vou_Date, @UserSno
		WHILE @@FETCH_STATUS = 0
			BEGIN				
				SET @VouSno = 0
				SET @PaymentModesXML = (SELECT STRING_AGG('<Voucher_Details LedSno="' + CAST(LedSno AS VARCHAR) + '" Debit=""  Credit="'+ CAST(Amount AS VARCHAR) + '"> </Voucher_Details>', ' ') FROM PaymentMode_Details WHERE TransSno=@LoanSno)
				SET @VouDetailXML = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @PartySno, @IsOpen, @Principal, @AdvIntAmt, @DocChargesAmt, @Rec_Principal, @Rec_Interest, @Rec_Add_Less, @Rec_Default_Amt,  @Rec_Other_Debits,
	                                        @Rec_Other_Credits, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML) 
				
				EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Vou_No,  @Vou_Date, @Narration, 0, 1, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
				IF @VouSno = 0 
				BEGIN
					SET @Error = 'Error Posting Voucher for Loan No:' + @Vou_No
					Raiserror (@Error , 16, 1) 
					GOTO CloseNow		
				END
        UPDATE Transactions SET VouSno=@VouSno WHERE TransSno=@LoanSno
					
				FETCH NEXT FROM LoansList INTO @LoanSno,@PartySno,@IsOpen,@Principal,@AdvIntAmt,@DocChargesAmt,@SeriesSno, @Vou_No, @Vou_Date, @UserSno
			END
		CLOSE LoansList
		DEALLOCATE LoansList
		
		SET @VouTypeSno = 13	
		DECLARE  ReceiptsList CURSOR FOR SELECT ReceiptSno,PartySno,IsOpen,Rec_Principal,Rec_Interest,Rec_Add_Less,Rec_Default_Amt,Rec_Add_Less, Rec_Other_Debits, Rec_Other_Credits, SeriesSno,Receipt_No, Receipt_Date, UserSno  FROM VW_RECEIPTS WHERE CompSno=@CompSno			
		OPEN ReceiptsList
		FETCH NEXT FROM ReceiptsList INTO	@ReceiptSno,@PartySno,@IsOpen,@Rec_Principal,@Rec_Interest,@Rec_Add_Less,@Rec_Default_Amt,@Rec_Add_Less, @Rec_Other_Debits, @Rec_Other_Credits, 
											@SeriesSno,@Vou_No, @Vou_Date, @UserSno
		WHILE @@FETCH_STATUS = 0
			BEGIN				
				SET @VouSno = 0
				SET @PaymentModesXML = (SELECT STRING_AGG('<Voucher_Details LedSno="' + CAST(LedSno AS VARCHAR) + '" Debit="'+ CAST(Amount AS VARCHAR) + '"  Credit=""> </Voucher_Details>', ' ') FROM PaymentMode_Details WHERE TransSno=@ReceiptSno)
				SET @VouDetailXML = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @PartySno, @IsOpen, @Principal, @AdvIntAmt, @DocChargesAmt, @Rec_Principal, @Rec_Interest, @Rec_Add_Less, @Rec_Default_Amt,  @Rec_Other_Debits,
	                                        @Rec_Other_Credits, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML) 
				
				EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Vou_No,  @Vou_Date, @Narration, 0, 1, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
				IF @VouSno = 0 
				BEGIN
					SET @Error = 'Error Posting Voucher for Receipt No:' + @Vou_No
					Raiserror (@Error , 16, 1) 
					GOTO CloseNow		
				END
        UPDATE Transactions SET VouSno=@VouSno WHERE TransSno=@ReceiptSno
					
				FETCH NEXT FROM ReceiptsList INTO	@ReceiptSno,@PartySno,@IsOpen,@Rec_Principal,@Rec_Interest,@Rec_Add_Less,@Rec_Default_Amt,@Rec_Add_Less, @Rec_Other_Debits, @Rec_Other_Credits, 
													@SeriesSno,@Vou_No, @Vou_Date, @UserSno
			END
		CLOSE ReceiptsList
		DEALLOCATE ReceiptsList

		SET @VouTypeSno = 14	
		DECLARE  RedemptionsList CURSOR FOR SELECT RedemptionSno,PartySno,Rec_Principal,Rec_Interest,Rec_Add_Less,Rec_Default_Amt,Rec_Add_Less, Rec_Other_Debits, Rec_Other_Credits, SeriesSno,Redemption_No, Redemption_Date, UserSno  FROM VW_REDEMPTIONS WHERE CompSno=@CompSno			
		OPEN RedemptionsList
		FETCH NEXT FROM RedemptionsList INTO	@RedemptionSno,@PartySno,@Rec_Principal,@Rec_Interest,@Rec_Add_Less,@Rec_Default_Amt,@Rec_Add_Less, @Rec_Other_Debits, @Rec_Other_Credits, 
											@SeriesSno,@Vou_No, @Vou_Date, @UserSno
		WHILE @@FETCH_STATUS = 0
			BEGIN				
				SET @VouSno = 0
				SET @PaymentModesXML = (SELECT STRING_AGG('<Voucher_Details LedSno="' + CAST(LedSno AS VARCHAR) + '" Debit="'+ CAST(Amount AS VARCHAR) + '"  Credit=""> </Voucher_Details>', ' ') FROM PaymentMode_Details WHERE TransSno=@RedemptionSno)
				SET @VouDetailXML = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @PartySno, @IsOpen, @Principal, @AdvIntAmt, @DocChargesAmt, @Rec_Principal, @Rec_Interest, @Rec_Add_Less, @Rec_Default_Amt,  @Rec_Other_Debits,
	                                        @Rec_Other_Credits, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML) 
				
				EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Vou_No,  @Vou_Date, @Narration, 0, 1, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
				IF @VouSno = 0 
				BEGIN
					SET @Error = 'Error Posting Voucher for Receipt No:' + @Vou_No
					Raiserror (@Error , 16, 1) 
					GOTO CloseNow		
				END 
					UPDATE Transactions SET VouSno=@VouSno WHERE TransSno=@RedemptionSno
				FETCH NEXT FROM RedemptionsList INTO	@RedemptionSno,@PartySno,@Rec_Principal,@Rec_Interest,@Rec_Add_Less,@Rec_Default_Amt,@Rec_Add_Less, @Rec_Other_Debits, @Rec_Other_Credits, 
														@SeriesSno,@Vou_No, @Vou_Date, @UserSno
			END
		CLOSE RedemptionsList
		DEALLOCATE RedemptionsList

		COMMIT TRANSACTION
		RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Templates') BEGIN DROP PROCEDURE Sp_Templates END
GO
CREATE PROCEDURE Sp_Templates
    @TempSno            INT,
	  @SetupSno           INT,
    @Template_Name      VARCHAR(20),
    @Template_Id        VARCHAR(50),
    @Template_Text      VARCHAR(1000),     
	  @RetSno	            INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF EXISTS(SELECT TempSno FROM Templates WHERE TempSno=@TempSno)
			BEGIN
				UPDATE Templates SET SetupSno=@SetupSno, Template_Name=@Template_Name, Template_Id=@Template_Id, Template_Text=@Template_Text
				WHERE TempSno=@TempSno
				IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN
				INSERT INTO Templates (SetupSno, Template_Name, Template_Id, Template_Text, Create_Date)
        VALUES                 (@SetupSno, @Template_Name, @Template_Id, @Template_Text, [dbo].DateToInt(GETDATE()))

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @TempSno = @@IDENTITY
			END
          
	SET @RetSno = @TempSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Template_Delete') BEGIN DROP PROCEDURE Sp_Template_Delete END
GO

CREATE PROCEDURE Sp_Template_Delete
	@TempSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
      IF EXISTS (SELECT AlertSno FROM Alerts WHERE (Sms_Alert_TempSno=@TempSno) OR (WhatsApp_Alert_TempSno=@TempSno) OR (Email_Alert_TempSno=@TempSno) OR (Voice_Alert_TempSno=@TempSno))
        BEGIN
          Raiserror ('Template exists in Alerts. Cant delete', 16, 1) 
          GOTO CloseNow
        END
			DELETE FROM Templates WHERE TempSno=@TempSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Alerts_Setup') BEGIN DROP PROCEDURE Sp_Alerts_Setup END
GO
CREATE PROCEDURE Sp_Alerts_Setup
	  @SetupSno           INT ,
    @CompSno            INT,
    @Admin_Mobile       VARCHAR(20),
    @Sms_Api            VARCHAR(200),
    @Sms_Sender_Id      VARCHAR(10),
    @Sms_Username       VARCHAR(20),
    @Sms_Password       VARCHAR(20),
    @Sms_Peid           VARCHAR(50),
    @WhatsApp_Instance  VARCHAR(200),
    @Add_91             BIT,
    @Add_91Sms             BIT,
    @AlertXml           XML,
	  @RetSno	            INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF EXISTS(SELECT SetupSno FROM Alerts_Setup WHERE SetupSno=@SetupSno)
			BEGIN
				UPDATE Alerts_Setup SET CompSno=@CompSno,Admin_Mobile=@Admin_Mobile, Sms_Api=@Sms_Api, Sms_Sender_Id=@Sms_Sender_Id, Sms_Username=@Sms_Username, Sms_Password=@Sms_Password,
                                Sms_Peid=@Sms_Peid, WhatsApp_Instance=@WhatsApp_Instance,Add_91=@Add_91,Add_91Sms=@Add_91Sms
				WHERE SetupSno=@SetupSno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Alerts WHERE SetupSno=@SetupSno
        IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN
				INSERT INTO Alerts_Setup  (CompSno, Admin_Mobile, Sms_Api, Sms_Sender_Id, Sms_Username, Sms_Password, Sms_Peid, WhatsApp_Instance,Add_91,Add_91Sms)
        VALUES                    (@CompSno, @Admin_Mobile, @Sms_Api, @Sms_Sender_Id, @Sms_Username, @Sms_Password, @Sms_Peid, @WhatsApp_Instance,@Add_91,@Add_91Sms)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @SetupSno = @@IDENTITY
			END

      IF @AlertXml IS NOT NULL
        BEGIN
            DECLARE @idoc       INT
            DECLARE @Sno        INT                   
            DECLARE @Alert_Type               TINYINT
            DECLARE @Alert_Caption            VARCHAR(100)
            DECLARE @Sms_Alert_TempSno        INT
            DECLARE @WhatsApp_Alert_TempSno   INT
            DECLARE @Email_Alert_TempSno      INT
            DECLARE @Voice_Alert_TempSno      INT
                    
           DECLARE @DetTable1 TABLE
               (
               Sno INT IDENTITY(1,1), Alert_Type TINYINT, Alert_Caption VARCHAR(200), Sms_Alert_TempSno INT, WhatsApp_Alert_TempSno INT, Email_Alert_TempSno INT, Voice_Alert_TempSno INT
               )
           Exec sp_xml_preparedocument @idoc OUTPUT, @AlertXml
        
           INSERT INTO @DetTable1
               (
                Alert_Type, Alert_Caption, Sms_Alert_TempSno, WhatsApp_Alert_TempSno, Email_Alert_TempSno, Voice_Alert_TempSno
               )
           SELECT  * FROM  OpenXml 
               (
                @idoc, '/ROOT/Alert/Alert_Details',2
               )
           WITH 
              (
                Alert_Type TINYINT '@Alert_Type', Alert_Caption VARCHAR(200) '@Alert_Caption', Sms_Alert_TempSno INT '@Sms_Alert_TempSno',
                WhatsApp_Alert_TempSno INT '@WhatsApp_Alert_TempSno', Email_Alert_TempSno INT '@Email_Alert_TempSno', Voice_Alert_TempSno INT '@Voice_Alert_TempSno'                
              )
           SELECT      TOP 1 @Sno=Sno,@Alert_Type=Alert_Type, @Alert_Caption=Alert_Caption, @Sms_Alert_TempSno=Sms_Alert_TempSno, @WhatsApp_Alert_TempSno=WhatsApp_Alert_TempSno, @Email_Alert_TempSno=Email_Alert_TempSno, @Voice_Alert_TempSno=Voice_Alert_TempSno
                       FROM   @DetTable1
          /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
           WHILE @@ROWCOUNT <> 0 
               BEGIN
                   INSERT INTO Alerts(SetupSno, Alert_Type, Alert_Caption, Sms_Alert_TempSno, WhatsApp_Alert_TempSno, Email_Alert_TempSno, Voice_Alert_TempSno) 
                   VALUES (@SetupSno, @Alert_Type, @Alert_Caption, @Sms_Alert_TempSno, @WhatsApp_Alert_TempSno, @Email_Alert_TempSno, @Voice_Alert_TempSno)
                   IF @@Error <> 0 GOTO CloseNow
                   DELETE FROM @DetTable1 WHERE Sno = @Sno
                 
				           SELECT      TOP 1 @Sno=Sno,@Alert_Type=Alert_Type, @Alert_Caption=Alert_Caption, @Sms_Alert_TempSno=Sms_Alert_TempSno, @WhatsApp_Alert_TempSno=WhatsApp_Alert_TempSno, @Email_Alert_TempSno=Email_Alert_TempSno, @Voice_Alert_TempSno=Voice_Alert_TempSno
                   FROM         @DetTable1
               END
           Exec Sp_Xml_Removedocument @idoc
        END

	SET @RetSno = @SetupSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAlertsSetup') BEGIN DROP FUNCTION Udf_getAlertsSetup END
GO

CREATE FUNCTION Udf_getAlertsSetup(@SetupSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN 
        SELECT	AStp.*,
                (SELECT *,Template_Name as Name,Template_Id as Details  FROM Templates WHERE SetupSno=AStp.SetupSno FOR JSON PATH ) as Templates_Json,                
                ( SELECT  Alt.*,  ISNULL(SmsTmp.TempSno,0) as 'Sms_Alert_Template.TempSno',     ISNULL(SmsTmp.Template_Name,'') as 'Sms_Alert_Template.Template_Name',      ISNULL(SmsTmp.Template_Id,'') as 'Sms_Alert_Template.Template_Id',     ISNULL(SmsTmp.Template_Text,'') as 'Sms_Alert_Template.Template_Text',     ISNULL(SmsTmp.Create_Date,0) as 'Sms_Alert_Template.Create_Date',     ISNULL(SmsTmp.Template_Name,'') as 'Sms_Alert_Template.Name',     ISNULL(SmsTmp.Template_Id,'') as 'Sms_Alert_Template.Details',
                                  ISNULL(WaTmp.TempSno,0) as 'WhatsApp_Alert_Template.TempSno', ISNULL(WaTmp.Template_Name,'') as 'WhatsApp_Alert_Template.Template_Name',  ISNULL(WaTmp.Template_Id,'') as 'WhatsApp_Alert_Template.Template_Id', ISNULL(WaTmp.Template_Text,'') as 'WhatsApp_Alert_Template.Template_Text', ISNULL(WaTmp.Create_Date,0) as 'WhatsApp_Alert_Template.Create_Date', ISNULL(WaTmp.Template_Name,'') as 'WhatsApp_Alert_Template.Name', ISNULL(WaTmp.Template_Id,'') as 'WhatsApp_Alert_Template.Details',
                                  ISNULL(EmailTmp.TempSno,0) as 'Email_Alert_Template.TempSno', ISNULL(EmailTmp.Template_Name,'') as 'Email_Alert_Template.Template_Name',  ISNULL(EmailTmp.Template_Id,'') as 'Email_Alert_Template.Template_Id', ISNULL(EmailTmp.Template_Text,'') as 'Email_Alert_Template.Template_Text', ISNULL(EmailTmp.Create_Date,0) as 'Email_Alert_Template.Create_Date', ISNULL(EmailTmp.Template_Name,'') as 'Email_Alert_Template.Name', ISNULL(EmailTmp.Template_Id,'') as 'Email_Alert_Template.Details',
                                  ISNULL(VoiceTmp.TempSno,0) as 'Voice_Alert_Template.TempSno', ISNULL(VoiceTmp.Template_Name,'') as 'Voice_Alert_Template.Template_Name',  ISNULL(VoiceTmp.Template_Id,'') as 'Voice_Alert_Template.Template_Id', ISNULL(VoiceTmp.Template_Text,'') as 'Voice_Alert_Template.Template_Text', ISNULL(VoiceTmp.Create_Date,0) as 'Voice_Alert_Template.Create_Date', ISNULL(VoiceTmp.Template_Name,'') as 'Voice_Alert_Template.Name', ISNULL(VoiceTmp.Template_Id,'') as 'Voice_Alert_Template.Details'
                  FROM    Alerts Alt
                          LEFT OUTER JOIN Templates SmsTmp ON SmsTmp.TempSno = Alt.Sms_Alert_TempSno
                          LEFT OUTER JOIN Templates WaTmp  ON WaTmp.TempSno = Alt.WhatsApp_Alert_TempSno
                          LEFT OUTER JOIN Templates EmailTmp  ON EmailTmp.TempSno = Alt.Email_Alert_TempSno
                          LEFT OUTER JOIN Templates VoiceTmp  ON VoiceTmp.TempSno = Alt.Voice_Alert_TempSno
                  WHERE   Alt.SetupSno=AStp.SetupSno
                  FOR JSON PATH ) as Alerts_Json                
	      FROM	  Alerts_Setup AStp
                                
	      WHERE	  (AStp.SetupSno=@SetupSno OR @SetupSno = 0) AND AStp.CompSno=@CompSno
        
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Alerts_History') BEGIN DROP PROCEDURE Sp_Alerts_History END
GO
CREATE PROCEDURE Sp_Alerts_History
    @HisSno INT,
    @Alert_Date DATETIME,
    @Alert_Destination VARCHAR(50),
    @Alert_Text VARCHAR(1000),
    @Alert_Url VARCHAR(1000),
    @Alert_Type TINYINT,
    @Alert_Mode TINYINT,
    @TrackSno INT,
    @Response VARCHAR(100),  
    @Alert_Status TINYINT, -- 1-Pending, 2-Sent, 3-Failed
    @Retry_Count TINYINT,
	  @RetSno	  INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF EXISTS(SELECT HisSno FROM Alerts_History WHERE HisSno=@HisSno)
			BEGIN
				UPDATE  Alerts_History SET Alert_Date=@Alert_Date, Alert_Destination=@Alert_Destination, Alert_Text=@Alert_Text, Alert_Url=@Alert_Url, Alert_Type=@Alert_Type,Alert_Mode=@Alert_Mode, TrackSno=@TrackSno, Response=@Response, Alert_Status=@Alert_Status, Retry_Count=@Retry_Count 
				WHERE   HisSno=@HisSno
				IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN
				INSERT INTO Alerts_History  (Alert_Date, Alert_Destination, Alert_Text, Alert_Url, Alert_Type,Alert_Mode, TrackSno, Response, Alert_Status, Retry_Count)
        VALUES                      (GETDATE(), @Alert_Destination, @Alert_Text, @Alert_Url, @Alert_Type,@Alert_Mode, @TrackSno, @Response, @Alert_Status, @Retry_Count)

        IF @@ERROR <> 0 GOTO CloseNow								
				SET @HisSno = @@IDENTITY
			END
          
	SET @RetSno = @HisSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_BulkInsert_Alerts_History') BEGIN DROP PROCEDURE Sp_BulkInsert_Alerts_History END
GO
CREATE PROCEDURE Sp_BulkInsert_Alerts_History
    @AlertsXml XML
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
  IF @AlertsXml IS NOT NULL
        BEGIN
            DECLARE @idoc       INT
            DECLARE @Sno        INT
            DECLARE @Alert_Destination        VARCHAR(50)
            DECLARE @Alert_Text               VARCHAR(1000)
            DECLARE @Alert_Url                VARCHAR(1000)
            DECLARE @Alert_Type               TINYINT
            DECLARE @Alert_Mode               TINYINT
            DECLARE @TrackSno                 INT
                    
           DECLARE @DetTable1 TABLE
               (
                Sno INT IDENTITY(1,1), Alert_Destination VARCHAR(50), Alert_Text VARCHAR(1000), Alert_Url VARCHAR(1000), Alert_Type TINYINT, TrackSno INT, Alert_Mode TINYINT
               )
           Exec sp_xml_preparedocument @idoc OUTPUT, @AlertsXml
        
           INSERT INTO @DetTable1
               (
                Alert_Destination, Alert_Text, Alert_Url, Alert_Type , TrackSno, Alert_Mode 
               )
           SELECT  * FROM  OpenXml 
               (
                @idoc, '/ROOT/Alert/Alert_Details',2
               )
           WITH 
              (
                Alert_Destination VARCHAR(50) '@Alert_Destination', Alert_Text VARCHAR(1000) '@Alert_Text', Alert_Url VARCHAR(1000) '@Alert_Url', Alert_Type TINYINT '@Alert_Type', TrackSno INT '@TrackSno', Alert_Mode TINYINT '@Alert_Mode'                
              )
           SELECT      TOP 1 @Sno=Sno,@Alert_Destination=Alert_Destination, @Alert_Text=Alert_Text, @Alert_Url=Alert_Url, @Alert_Type=Alert_Type, @TrackSno=TrackSno, @Alert_Mode=Alert_Mode 
                       FROM   @DetTable1
          /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
           WHILE @@ROWCOUNT <> 0 
               BEGIN
                   INSERT INTO Alerts_History(Alert_Date, Alert_Destination, Alert_Text, Alert_Url, Alert_Type,Alert_Mode, TrackSno, Response, Alert_Status, Retry_Count) 
                   VALUES (GETDATE(), @Alert_Destination, @Alert_Text, @Alert_Url, @Alert_Type, @Alert_Mode, @TrackSno,'',1,0)
                   IF @@Error <> 0 GOTO CloseNow
                   DELETE FROM @DetTable1 WHERE Sno = @Sno
                 
				           SELECT      TOP 1 @Sno=Sno,@Alert_Destination=Alert_Destination, @Alert_Text=Alert_Text, @Alert_Url=Alert_Url, @Alert_Type=Alert_Type, @TrackSno=TrackSno, @Alert_Mode=Alert_Mode 
                   FROM       @DetTable1
               END
           Exec Sp_Xml_Removedocument @idoc
        END

    
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getDayHistory') BEGIN DROP FUNCTION Udf_getDayHistory END
GO

CREATE FUNCTION Udf_getDayHistory(@HistFromDate INT,@HistToDate INT,  @CompSno INT, @BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN 
        SELECT	Ln.VouTypeSno as VouTypeSno, Ln.LoanSno as TransSno, Ln.Loan_No as Trans_No, Ln.Loan_Date as Trans_Date, Ln.Party_Name as Party_Name, Ln.Loan_No as Ref_No, Ln.Principal as Principal, Ln.AdvIntAmt as Interest,
                Ln.UserName as UserName
        
	      FROM	  VW_LOANS Ln                                
	      WHERE	  (Ln.Loan_Date BETWEEN @HistFromDate AND @HistToDate) AND Ln.CompSno=@CompSno AND (Ln.Cancel_Status <> 2) AND (Ln.BranchSno=@BranchSno OR @BranchSno=0)

        UNION ALL

        SELECT	Rec.VouTypeSno as VouTypeSno, Rec.ReceiptSno as TransSno, Rec.Receipt_No as Trans_No, Rec.Receipt_Date as Trans_Date, Rec.Customer_Name as Party_Name, Rec.Loan_No as Ref_No, Rec.Rec_Principal as Principal, Rec.Rec_Interest as Interest,
                Rec.UserName as UserName
        
	      FROM	  VW_RECEIPTS Rec
	      WHERE	  (Rec.Receipt_Date BETWEEN @HistFromDate AND @HistToDate) AND Rec.CompSno=@CompSno AND (Rec.Cancel_Status <> 2) AND (Rec.BranchSno=@BranchSno OR @BranchSno=0)

        UNION ALL

        SELECT	Red.VouTypeSno as VouTypeSno, Red.RedemptionSno as TransSno, Red.Redemption_No as Trans_No, Red.Redemption_Date as Trans_Date, Red.Customer_Name as Party_Name, Red.Loan_No as Ref_No,  Red.Rec_Principal as Principal, Red.Rec_Interest as Interest,
                Red.UserName as UserName
        
	      FROM	  VW_REDEMPTIONS Red 
	      WHERE	  (Red.Redemption_Date BETWEEN @HistFromDate AND @HistToDate) AND Red.CompSno=@CompSno AND (Red.Cancel_Status <> 2) AND (Red.BranchSno=@BranchSno OR @BranchSno=0)
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLoansforRepledge') BEGIN DROP FUNCTION Udf_getLoansforRepledge END
GO

CREATE FUNCTION Udf_getLoansforRepledge(@CompSno INT,@BranchSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
    SELECT  *
    FROM    VW_LOANS
    WHERE   (CompSno=@CompSno) AND (Loan_Repledge_Status=0) AND (Loan_Status IN (1,3)) AND (Approval_Status=2) AND (Cancel_Status=1) AND (BranchSno=@BranchSno OR @BranchSno=0)

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAgeAnalysis') BEGIN DROP FUNCTION Udf_getAgeAnalysis END
GO
CREATE FUNCTION Udf_getAgeAnalysis(@CompSno INT,@BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

SELECT		*

FROM		Udf_getLoans(0,@CompSno,0,2,1,0,@BranchSno) Ln

WHERE		Ln.Loan_Status IN (1,3)

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAlertHistory') BEGIN DROP FUNCTION Udf_getAlertHistory END
GO
CREATE FUNCTION Udf_getAlertHistory(@CompSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

SELECT		Ah.HisSno, CAST(Ah.Alert_Date AS VARCHAR) AS Alert_Date, Ah.Alert_Destination, Ah.Alert_Text, 
          Alert_Type = CASE Alert_Type  WHEN 1 THEN 'New Loan' WHEN 2 THEN 'New Receipt' WHEN 3 THEN 'New Redemption' WHEN 4 THEN 'OTP Validation' WHEN 5 THEN 'Int Reminder' ELSE 'Unknown' END,
          Alert_Mode = CASE Alert_Mode WHEN 1 THEN 'SMS' WHEN 2 THEN 'WhatsApp' WHEN 3 THEN 'Email' WHEN 4 THEN 'Voice Message' ELSE 'Unknown' END,
          Ah.TrackSno, Ah.Response,
          Alert_Status = CASE Alert_Status WHEN 1 THEN 'Pending' WHEN 2 THEN  'Delivered' WHEN 3 THEN 'Failed' END,
          Ah.Retry_Count, Ah.CompSno

FROM		  Alerts_History Ah

WHERE		  CompSno=@CompSno

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Report_Properties' ) BEGIN DROP PROCEDURE Sp_Report_Properties END
GO

CREATE PROCEDURE Sp_Report_Properties
    @ReportSno INT,
    @Report_Name VARCHAR(20),
    @Report_Style VARCHAR(100),
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT ReportSno FROM Report_Properties WHERE ReportSno=@ReportSno)
            BEGIN
                UPDATE Report_Properties SET Report_Name=@Report_Name,Report_Style=@Report_Style,CompSno=@CompSno
                WHERE ReportSno=@ReportSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN
        
         INSERT INTO Report_Properties(Report_Name,Report_Style,CompSno)
         VALUES (@Report_Name,@Report_Style,@CompSno)
         IF @@ERROR <> 0 GOTO CloseNow
         SET @ReportSno = @@IDENTITY

            End

    SET @RetSno = @ReportSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getReport_Properties') BEGIN DROP FUNCTION Udf_getReport_Properties END
GO

CREATE FUNCTION Udf_getReport_Properties(@ReportSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT  Rp.*, Rp.Report_Style as Name, 'Code: '+ Rp.Report_Name as Details
    FROM      Report_Properties Rp
    WHERE     (ReportSno=@ReportSno OR @ReportSno = 0) AND (CompSno =@CompSno)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Report_Properties_Delete') BEGIN DROP PROCEDURE Sp_Report_Properties_Delete END
GO

CREATE PROCEDURE Sp_Report_Properties_Delete
    @ReportSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
            DELETE FROM Report_Properties WHERE ReportSno=@ReportSno
            IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getMarketValueAnalysis') BEGIN DROP FUNCTION Udf_getMarketValueAnalysis END
GO
CREATE FUNCTION Udf_getMarketValueAnalysis(@CompSno INT, @BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT			Ln.*,
				      Market_Rate		as Then_Market_Rate, 
				      Loan_PerGram	as Then_Loan_PerGram,
				      Market_Value	as Then_Market_Value,
				      Current_Market_Rate		= (SELECT Market_Rate	FROM Item_Groups WHERE GrpSno=Ln.GrpSno),
				      Current_Loan_PerGram	= (SELECT Loan_PerGram	FROM Item_Groups WHERE GrpSno=Ln.GrpSno),
				      Current_Market_Value	= (SELECT Loan_PerGram	FROM Item_Groups WHERE GrpSno=Ln.GrpSno)*Ln.TotPureWt,

				      Nett_Payable_AsOn = (SELECT (Interest_Balance + Principal_Balance) FROM Udf_getLoanDetailed(Ln.LoanSno,[dbo].DateToInt(GETDATE()),0)),
				      Diff_Amount = ((SELECT Loan_PerGram	FROM Item_Groups WHERE GrpSno=Ln.GrpSno)*Ln.TotPureWt) - (SELECT (Interest_Balance + Principal_Balance) FROM Udf_getLoanDetailed(Ln.LoanSno,[dbo].DateToInt(GETDATE()),0))
				  

  FROM			  Udf_getLoans(0,@CompSno, 0, 2, 0, 0,@BranchSno) Ln

  WHERE			  Ln.Loan_Status IN (1,3)
  GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_get1percentIntStatement') BEGIN DROP FUNCTION Udf_get1percentIntStatement END
GO
CREATE FUNCTION Udf_get1percentIntStatement(@CompSno INT, @FromDate INT, @ToDate INT, @SubmitInt DECIMAL(5,2),@BranchSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT	Ln.*, Red.Redemption_Date, Duration = CAST(Ln.Ason_Duration_Months AS VARCHAR) + ' M / ' + CAST(Ln.AsOn_Duration_Days AS VARCHAR) + ' D', 
		      IntAmount = CAST (	ISNULL( Ln.Ason_Duration_Months* (Ln.Principal *(@SubmitInt/100) / 12),0)
							  + 
							  ISNULL( Ln.Ason_Duration_Days* (Ln.Principal *(@SubmitInt/100) / 12 / 30),0)
							  AS DECIMAL(12,2))

  FROM	  VW_REDEMPTIONS Red 			
		      INNER JOIN Udf_GetLoans(0,@CompSno,2,0,0,0,@BranchSno) Ln  ON Ln.LoanSno = Red.LoanSno 
  WHERE	  Red.Redemption_Date BETWEEN @FromDate AND @ToDate

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Agent' ) BEGIN DROP PROCEDURE Sp_Agent END
GO

CREATE PROCEDURE Sp_Agent
    @AgentSno INT,
    @Agent_Code VARCHAR(20),
    @Agent_Name VARCHAR(50),
    @Remarks VARCHAR(100),
    @Create_Date INT,
    @CompSno INT,
    @BranchSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT AgentSno FROM Agent WHERE AgentSno=@AgentSno)
            BEGIN
                UPDATE Agent SET Agent_Code=@Agent_Code,Agent_Name=@Agent_Name,Remarks=@Remarks,Create_Date=@Create_Date,CompSno=@CompSno,BranchSno=@BranchSno
                WHERE AgentSno=@AgentSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN
        IF EXISTS(SELECT AgentSno FROM Agent WHERE  Agent_Code=@Agent_Code AND CompSno =@CompSno)
          BEGIN
              Raiserror ('Agent exists with this Code', 16, 1)
              GoTo CloseNow
          End

         INSERT INTO Agent(Agent_Code,Agent_Name,Remarks,Create_Date,CompSno,BranchSno)
         VALUES (@Agent_Code,@Agent_Name,@Remarks,@Create_Date,@CompSno,@BranchSno)
         IF @@ERROR <> 0 GOTO CloseNow
         SET @AgentSno = @@IDENTITY

            End

    SET @RetSno = @AgentSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getAgent') BEGIN DROP FUNCTION Udf_getAgent END
GO

CREATE FUNCTION Udf_getAgent(@AgentSno INT,@CompSno INT, @BranchSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT  Ag.*, Ag.Agent_Name as Name, 'Code: '+ Ag.Agent_Code as Details
    FROM      Agent Ag
    WHERE     (AgentSno=@AgentSno OR @AgentSno = 0) AND (CompSno =@CompSno) AND (BranchSno=@BranchSno OR @BranchSno=0)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Agent_Delete') BEGIN DROP PROCEDURE Sp_Agent_Delete END
GO

CREATE PROCEDURE Sp_Agent_Delete
    @AgentSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION

      IF EXISTS (SELECT AgentSno FROM Transactions WHERE AgentSno=@AgentSno)
				BEGIN
					Raiserror ('Transactions exists with this User', 16, 1) 
					GOTO CloseNow
				END

      DELETE FROM Agent WHERE AgentSno=@AgentSno
      IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Divisions' ) BEGIN DROP PROCEDURE Sp_Divisions END
GO

CREATE PROCEDURE Sp_Divisions
    @DivSno INT,
    @Div_Code VARCHAR(10),
    @Div_Name VARCHAR(50),
    @Remarks VARCHAR(50),
    @Create_Date INT,
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT DivSno FROM Divisions WHERE DivSno=@DivSno)
            BEGIN
                UPDATE Divisions SET Div_Code=@Div_Code,Div_Name=@Div_Name,Remarks=@Remarks,Create_Date=@Create_Date,CompSno=@CompSno
                WHERE DivSno=@DivSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN
        IF EXISTS(SELECT DivSno FROM Divisions WHERE  Div_Code=@Div_Code AND CompSno =@CompSno)
          BEGIN
              Raiserror ('Divisions exists with this Code', 16, 1)
              GoTo CloseNow
          End

         INSERT INTO Divisions(Div_Code,Div_Name,Remarks,Create_Date,CompSno)
         VALUES (@Div_Code,@Div_Name,@Remarks,@Create_Date,@CompSno)
         IF @@ERROR <> 0 GOTO CloseNow
         SET @DivSno = @@IDENTITY

            End

    SET @RetSno = @DivSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getDivisions') BEGIN DROP FUNCTION Udf_getDivisions END
GO

CREATE FUNCTION Udf_getDivisions(@DivSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT  div.*, div.Div_Name as Name, 'Code: '+ div.Div_Code as Details
    FROM      Divisions div
    WHERE     (DivSno=@DivSno OR @DivSno = 0) AND (CompSno =@CompSno)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Divisions_Delete') BEGIN DROP PROCEDURE Sp_Divisions_Delete END
GO

CREATE PROCEDURE Sp_Divisions_Delete
    @DivSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        DELETE FROM Divisions WHERE DivSno=@DivSno
        IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getBusinessRegisterDaily') BEGIN DROP FUNCTION Udf_getBusinessRegisterDaily END
GO

CREATE FUNCTION Udf_getBusinessRegisterDaily(@CompSno INT, @FromDate INT,@ToDate INT, @BranchSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return

WITH DaySequence AS (
    SELECT 
        @FromDate AS DayStart
    UNION ALL
    SELECT 
        [dbo].DateToInt(DATEADD(DAY, 1, [dbo].IntToDate(DayStart)))
    FROM DaySequence
    WHERE DayStart < @ToDate -- End date (adjust as needed)
)
SELECT		DayStart,			
			(SELECT COUNT(LoanSno) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date = DayStart ) as LoansCount,
			ISNULL((SELECT SUM(Principal) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date = DayStart),0) as LoansValue,
			(SELECT COUNT(RedemptionSno) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno  AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date = DayStart) as RedCount,
			ISNULL((SELECT SUM(Rec_Principal) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date = DayStart),0) as RedValue,
			
			ISNULL(	((SELECT SUM(AdvIntAmt) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date = DayStart)
						+
					(SELECT SUM(Rec_Interest) FROM VW_RECEIPTS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Receipt_Date =DayStart )
						+
					(SELECT SUM(Rec_Interest) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date = DayStart)
				),0) as Interest,

      (SELECT SUM(DocChargesAmt) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date = DayStart) as DocCharges
			
			--FORMAT(MonthStart, 'yyyy-MM') AS MonthFormatted
FROM		DaySequence
--OPTION		(MAXRECURSION 100) -- Adjust for longer date ranges

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getBusinessRegisterMonthly') BEGIN DROP FUNCTION Udf_getBusinessRegisterMonthly END
GO

CREATE FUNCTION Udf_getBusinessRegisterMonthly(@CompSno INT, @FromDate INT,@ToDate INT,@BranchSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return

WITH MonthSequence AS (
    SELECT 
        @FromDate AS MonthStart
    UNION ALL
    SELECT 
        [dbo].DateToInt(DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart)))
    FROM MonthSequence
    WHERE MonthStart < @ToDate -- End date (adjust as needed)
)

SELECT		MonthStart,
			[dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart)))) as MonthEnd,
			(SELECT COUNT(LoanSno) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart))))) as LoansCount,
			CAST(ISNULL((SELECT SUM(Principal) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart))))),0) AS INT) as LoansValue,
			(SELECT COUNT(RedemptionSno) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart))))) as RedCount,
			CAST(ISNULL((SELECT SUM(Rec_Principal) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart))))),0) AS INT) as RedValue,
			
			CAST(ISNULL(	((SELECT SUM(AdvIntAmt) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart)))))
						+
					(SELECT SUM(Rec_Interest) FROM VW_RECEIPTS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Receipt_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart)))))
						+
					(SELECT SUM(Rec_Interest) FROM VW_REDEMPTIONS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Redemption_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart)))))
				),0) AS INT) as Interest,

      (SELECT SUM(DocChargesAmt) FROM VW_LOANS WHERE CompSno=@CompSno AND (BranchSno=@BranchSno OR @BranchSno=0) AND Loan_Date BETWEEN MonthStart AND [dbo].DateToInt(DATEADD(DAY, -1, DATEADD(MONTH, 1, [dbo].IntToDate(MonthStart))))) as DocCharges
			
			--FORMAT(MonthStart, 'yyyy-MM') AS MonthFormatted
FROM		MonthSequence
--OPTION		(MAXRECURSION 100) -- Adjust for longer date ranges

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetAddPrincipalInt') BEGIN DROP FUNCTION Udf_GetAddPrincipalInt END
GO

CREATE FUNCTION [dbo].Udf_GetAddPrincipalInt(
	@LoanSno INT,	@FromDate DATE, 	@ToDate DATE,	@Roi DECIMAL(4,2)
)
RETURNS @Result TABLE (IntAccured MONEY )

WITH ENCRYPTION AS

BEGIN

	DECLARE @BranchSno INT
	DECLARE @FDate	INT = [dbo].DateToInt(@FromDate)
	DECLARE @TDate	INT = [dbo].DateToInt(@ToDate)
	DECLARE @IntCalcinDays INT  

	SELECT @BranchSno=BranchSno FROM VW_LOANS WHERE LoanSno=@LoanSno
	SELECT @IntCalcinDays=CASE IntCalcinDays WHEN 0 THEN 360 ELSE 365 END FROM  Transaction_Setup WHERE BranchSno=@BranchSno

	INSERT INTO @Result
	SELECT		--Lp.*, DATEDIFF(DAY, [dbo].IntToDate(Lp.Pmt_Date),@ToDate) as Days, 
				CAST((DATEDIFF(DAY, [dbo].IntToDate(Lp.Pmt_Date),@ToDate) * @Roi/100*Lp.Amount/@IntCalcinDays) AS DECIMAL(18,2)) as IntAccured
			
	FROM		Loan_Payments Lp
	WHERE		Lp.LoanSno=@LoanSno AND Lp.Pmt_Date BETWEEN @FDate AND @TDate

	RETURN
END

GO
