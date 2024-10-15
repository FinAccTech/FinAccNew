/*USE MASTER
DROP DATABASE FS2024080701
CREATE DATABASE FS2024080701 */


/*  FUNCTIONS */

/* TABLES, DEFAULT VALUES, SPS AND DISPLAY FUNCTIONS */


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='IntToDate') BEGIN DROP FUNCTION IntToDate END
GO
CREATE FUNCTION IntToDate(@IntDate INT)
RETURNS DATE
AS
BEGIN	
	RETURN  CAST (SUBSTRING(CAST(@IntDate AS VARCHAR),1,4)  + '-' + SUBSTRING(CAST(@IntDate AS VARCHAR),5,2) + '-' +  SUBSTRING(CAST(@IntDate AS VARCHAR),7,2) AS DATE)
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='DateToInt') BEGIN DROP FUNCTION DateToInt END
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

CREATE TABLE Companies 
(
	CompSno INT PRIMARY KEY IDENTITY(1,1),
	ClientSno INT,
	Comp_Code VARCHAR(20),
	Comp_Name VARCHAR(50),
	Fin_From INT,
	Fin_To INT,
	Books_From INT,
	Address1 VARCHAR(50),
	Address2 VARCHAR(50),
	Address3 VARCHAR(50),
	City VARCHAR(50),
	State VARCHAR(50),
	Pincode VARCHAR(10),
	Email VARCHAR(50),
	Phone VARCHAR(20),
	License_No VARCHAR(50),
	Hide_Status TINYINT,
	App_Version INT,
	Db_Version INT,
	Status BIT,	
	CommMasters BIT	
)
GO


CREATE TABLE Voucher_Types
(
  VouTypeSno INT PRIMARY KEY IDENTITY(1,1),
  VouType_Name VARCHAR(20),
)
GO

INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Opening')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Payment')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Journal')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Contra')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Memorandum')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Credit Note')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Debit Note')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Cheque RETURN')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Sales')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Purchase')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Loan Payment')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Loan Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Loan Redemption')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Auction Entry')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Transfer')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('RePledge')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Repledge Payment')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Repledge Closure')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('ReLoan')
GO

CREATE TABLE Transaction_Setup
(
  SetupSno            INT IDENTITY(1,1),
  CompSno             INT,
  BranchSno           INT,
  AreaCode_AutoGen    BIT,
  AreaCode_Prefix     CHAR(4),
  AreaCode_CurrentNo   INT,

  PartyCode_AutoGen   BIT,
  PartyCode_Prefix    CHAR(4),
  PartyCode_CurrentNo  INT,

  SuppCode_AutoGen   BIT,
  SuppCode_Prefix    CHAR(4),
  SuppCode_CurrentNo  INT,

  BwrCode_AutoGen   BIT,
  BwrCode_Prefix    CHAR(4),
  BwrCode_CurrentNo  INT,

  GrpCode_AutoGen     BIT,
  GrpCode_Prefix      CHAR(4),
  GrpCode_CurrentNo    INT,

  ItemCode_AutoGen    BIT,
  ItemCode_Prefix     CHAR(4),
  ItemCode_CurrentNo   INT,

  SchemeCode_AutoGen  BIT,
  SchemeCode_Prefix   CHAR(4),
  SchemeCode_CurrentNo INT,

  LocCode_AutoGen     BIT,
  LocCode_Prefix      CHAR(4),
  LocCode_CurrentNo    INT,

  PurityCode_AutoGen  BIT,
  PurityCode_Prefix   CHAR(4),
  PurityCode_CurrentNo INT,

  BranchCode_AutoGen  BIT,
  BranchCode_Prefix   CHAR(4),
  BranchCode_CurrentNo INT,

  Enable_Opening      BIT,
  Enable_RegLang      BIT,
  Reg_FontName        VARCHAR(20),
  Reg_FontSize        TINYINT,

  Enable_FingerPrint  BIT,
  MakeFp_Mandatory    BIT,

  Allow_NullInterest  BIT,
  Show_CashBalance    BIT,
  Images_Mandatory    BIT,
  Enable_ReturnImage  BIT,
  Allow_DuplicateItems  BIT,
  Disable_AddLess       BIT,
  Entries_LockedUpto    INT,
  Enable_Authentication BIT,
  Enable_OldEntries     BIT,
  IntCalcinDays         BIT
)
GO

CREATE TABLE Users
(
	UserSno INT PRIMARY KEY IDENTITY(1,1),
	UserName VARCHAR(20),
	Password VARCHAR(10),
  User_Type TINYINT,
  Active_Status BIT,
  Profile_Image VARCHAR(200),
  Image_Name VARCHAR(50),
  Enable_WorkingHours BIT,
  FromTime VARCHAR(10),
  ToTime VARCHAR(10)
)
GO



INSERT INTO Users (UserName,Password,User_Type, Active_Status)
VALUES ('Admin','sysdba',1,1)

CREATE TABLE Comp_Rights
(
  RightsSno INT PRIMARY KEY IDENTITY(1,1),
  UserSno INT,
  CompSno INT,
  Comp_Right BIT
)
GO

CREATE TABLE User_Rights
(
  RightSno INT PRIMARY KEY IDENTITY(1,1),
  UserSno INT,
  FormSno INT,
  View_Right BIT,
  Edit_Right BIT,
  Print_Right BIT,
  Delete_Right BIT,
  Create_Right BIT,
  Report_Right BIT,
  Date_Access BIT,
  Search_Access BIT,
)
GO


CREATE TABLE Voucher_Series
(
  SeriesSno INT PRIMARY KEY IDENTITY(1,1),
  VouTypeSno INT,
  Series_Name VARCHAR(20),
  BranchSno INT,
  Num_Method TINYINT,
  Allow_Duplicate BIT,
  Start_No INT,
  Current_No INT,
  Prefix CHAR(4),
  Suffix CHAR(3),
  Width TINYINT,
  Prefill VARCHAR(1),
  MapSchemeSno INT,
  Print_Voucher BIT,
  Print_On_Save BIT,
  Show_Preview BIT,
  Print_Style VARCHAR(100),
  IsDefault         BIT,
  IsStd				BIT,
  Active_Status     BIT,
  Create_Date       INT,
  UserSno           INT,
  CompSno           INT  
)
GO


CREATE TABLE Branches
(
  BranchSno INT PRIMARY KEY IDENTITY(1,1),
  Branch_Code       VARCHAR(10),
  Branch_Name       VARCHAR(20),
  Remarks           VARCHAR(50),
  Active_Status     BIT,
  Create_Date       INT,
  UserSno           INT,
  CompSno           INT 
)
GO




CREATE TABLE AREA
(
  AreaSno INT PRIMARY KEY IDENTITY(1,1),
  Area_Code VARCHAR(20),
  Area_Name VARCHAR(50),
  Remarks VARCHAR(100),
  Active_Status     BIT,
  Create_Date INT,
  UserSno INT,
  CompSno INT
)
GO



CREATE TABLE  Image_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno    INT,
  Image_Grp   TINYINT,   /* 1- Party Images 2-Loan Images */
  Image_Name  VARCHAR(50),
  Image_Url   VARCHAR(200)
)
GO


CREATE TABLE Party
(
  PartySno        INT PRIMARY KEY IDENTITY(1,1),
  Party_Code      VARCHAR(20),
  Party_Name      VARCHAR(50),
  Print_Name      VARCHAR(50),
  Party_Cat       TINYINT,
  AreaSno         INT,
  Rel             TINYINT,
  RelName         VARCHAR(50),
  Address1        VARCHAR(50),
  Address2        VARCHAR(50),
  Address3        VARCHAR(50),
  Address4        VARCHAR(50),
  City            VARCHAR (50),
  State           VARCHAR(20),
  Pincode         VARCHAR(10),
  Phone           VARCHAR(20),
  Mobile          VARCHAR(20),
  Email           VARCHAR(50),
  Reference       VARCHAR(50),
  Dob               INT,
  Sex               TINYINT,
  Aadhar_No         VARCHAR(20),
  Remarks           VARCHAR(100),
  Occupation        VARCHAR(20),
  Monthly_Income    MONEY,
  Loan_Value_Limit  MONEY,
  Allow_More_Value  BIT,
  Verify_Code       VARCHAR(10),
  Verify_Status     BIT,
  Fp_Status         BIT,
  Active_Status     BIT,
  IsFavorite        BIT,
  Nominee           VARCHAR(50),
  Create_Date       INT,
  LedSno            INT,
  UserSno           INT,
  CompSno           INT   
)
GO


CREATE TABLE Schemes
(
  SchemeSno INT PRIMARY KEY IDENTITY(1,1),
  Scheme_Code VARCHAR(10),
  Scheme_Name VARCHAR(20),
  Roi DECIMAL(4,2),
  OrgRoi DECIMAL(4,2),
  IsStdRoi BIT,
  Calc_Basis TINYINT,
  Calc_Method TINYINT,
  Custom_Style TINYINT,
  Enable_AmtSlab BIT,
  Enable_FeeSlab BIT,
  Preclosure_Days TINYINT,
  Min_CalcDays TINYINT,
  Grace_Days TINYINT,
  SeriesSno INT,
  LpYear TINYINT,
  LpMonth TINYINT,
  LpDays TINYINT,
  AdvanceMonth TINYINT,
  ProcessingFeePer FLOAT,
  Min_MarketValue MONEY,
  Max_MarketValue MONEY,
  Min_LoanValue MONEY,
  Max_LoanValue MONEY,
  Active_Status     BIT,
  Create_Date INT,
  Remarks VARCHAR(50),
  UserSno INT,
  CompSno INT
)
GO


CREATE TABLE Scheme_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  SchemeSno   INT,
  FromPeriod  SMALLINT,
  ToPeriod    SMALLINT,
  Roi         DECIMAL(4,2),
  OrgRoi      DECIMAL(4,2)
)
GO

CREATE TABLE Amt_Slab_Details
(
  DetSno      INT PRIMARY KEY IDENTITY(1,1),
  SchemeSno   INT,
  FromAmount  MONEY,
  ToAmount    MONEY,
  Roi         DECIMAL(4,2)  
)
GO

CREATE TABLE Fee_Slab_Details
(
  DetSno      INT PRIMARY KEY IDENTITY(1,1),
  SchemeSno   INT,
  FromAmount  MONEY,
  ToAmount    MONEY,
  FeePer      DECIMAL(4,2)  
)

GO


CREATE TABLE Item_Groups
(
  GrpSno INT PRIMARY KEY IDENTITY(1,1),
  Grp_Code VARCHAR(10),
  Grp_Name VARCHAR(20),
  Market_Rate MONEY,
  Loan_PerGram MONEY,
  Restrict_Type TINYINT,
  Remarks VARCHAR(50),
  Active_Status     BIT,
  Create_Date INT,
  UserSno INT,
  CompSno INT
)
GO


CREATE TABLE Locations
(
  LocationSno INT PRIMARY KEY IDENTITY(1,1),
  Loc_Code VARCHAR(10),
  Loc_Name VARCHAR(20),
  Loc_Type TINYINT,
  Remarks VARCHAR(50),
  Active_Status     BIT,
  Create_Date INT,
  UserSno INT,
  CompSno INT
)
GO


CREATE TABLE Items
(
  ItemSno INT PRIMARY KEY IDENTITY(1,1),
  Item_Code VARCHAR(10),
  Item_Name VARCHAR(200),
  GrpSno INT,
  Remarks VARCHAR(50),
  Active_Status     BIT,
  Create_Date INT,
  UserSno INT,
  CompSno INT
)
GO

CREATE TABLE Purity
(
  PuritySno INT PRIMARY KEY IDENTITY(1,1),
  Purity_Code VARCHAR(10),
  Purity_Name VARCHAR(20),
  Purity DECIMAL(4,2),
  GrpSno INT,
  Remarks VARCHAR(50),
  Active_Status     BIT,
  Create_Date INT,
  UserSno INT,
  CompSno INT
)
GO


CREATE TABLE Transactions
(
	TransSno				INT PRIMARY KEY IDENTITY(1,1),
	VouTypeSno		  INT,
	SeriesSno				INT,
	Trans_No				VARCHAR(20),

  /*FOR REPLEDGE */
  Ref_No          VARCHAR(20),
  BorrowerSno     INT,

	Trans_Date			INT,
	PartySno				INT,
	SchemeSno				INT,
	GrpSno					INT,
  TotQty          TINYINT,
	TotGrossWt			DECIMAL(7,3),
	TotNettWt				DECIMAL(7,3),
	Market_Value		MONEY,
	Principal				MONEY,
	Roi						  DECIMAL(4,2),
	AdvIntDur				TINYINT,
	AdvIntAmt				MONEY,
	DocChargesPer		DECIMAL(2,1),
	DocChargesAmt		MONEY,
	
	/* FOR RECEIPT */
	RefSno				      INT,
	Rec_Principal			  MONEY,
	Rec_IntMonths			  MONEY,
	Rec_IntDays				  MONEY,
	Rec_Interest			  MONEY,
	Rec_Other_Credits		MONEY,
	Rec_Other_Debits		MONEY,
	Rec_Default_Amt			MONEY,
	Rec_Add_Less			  MONEY,

  /*FOR REDEMPTION */
  Red_Method          TINYINT,
  
	Nett_Payable			  MONEY,
	Mature_Date				  INT,
	PayModeSno				  INT,
	LocationSno				  INT,
	Remarks					    VARCHAR(100),

  VouSno              INT,	
	UserSno					    INT,
	CompSno					    INT,
  BranchSno           INT
)
GO

CREATE TABLE Transaction_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno        INT,
  ItemSno         INT,
  Qty             TINYINT,
  Gross_Wt        DECIMAL(5,2),
  Stone_Wt        DECIMAL(5,2),
  Nett_Wt         DECIMAL(5,2),
  PuritySno       INT,
  Item_Value      MONEY,
  Remarks         VARCHAR(30)
)
GO

CREATE TABLE PaymentMode_Details
(
  PmSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno INT,
  LedSno INT,
  Amount MONEY
)
GO

CREATE TABLE Status_Updation
(
	StatusSno INT PRIMARY KEY IDENTITY(1,1),
	Updation_Date INT,
	Updation_Type TINYINT,  -- 1-Approval Status, 2-Cancel Status
  Document_Type TINYINT, -- 1-Loan, 2-Voucher .....
	TransSno INT,
	UserSno INT,
	Remarks VARCHAR(50)
)
GO


CREATE TABLE Loan_Payments
(
  PmtSno INT PRIMARY KEY IDENTITY(1,1),
  Pmt_Date INT,
  LoanSno INT,
  Amount MONEY,
  Remarks VARCHAR(100)
)
GO

CREATE TABLE ReLoan
(
	Sno INT PRIMARY KEY IDENTITY(1,1),
	ReLoanSno		INT,
	OldLoanSno		INT,
	RedemptionSno	INT,
	NewLoanSno		INT
)
GO

CREATE TABLE Repledge_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno INT,
  LoanSno INT
)
GO

/* ACCOUNTS */

CREATE TABLE Ledger_Groups
(
  GrpSno INT PRIMARY KEY IDENTITY(1,1),
  Grp_Code VARCHAR(20),
  Grp_Name VARCHAR(50),
  Grp_Under INT,
  Grp_Level INT,
  Grp_Desc VARCHAR(200),
  Grp_Nature TINYINT,
  Affect_Gp BIT,
  Remarks VARCHAR(100),
  IsStd BIT,
  Created_Date INT
)

GO

CREATE TABLE Companies_Ledger_Groups
(
  GrpSno INT PRIMARY KEY IDENTITY(1,1),
  Grp_Code VARCHAR(20),
  Grp_Name VARCHAR(50),
  Grp_Under INT,
  Grp_Level INT,
  Grp_Desc VARCHAR(200),
  Grp_Nature TINYINT,
  Affect_Gp BIT,
  Remarks VARCHAR(100),
  IsStd BIT,
  Created_Date INT,
  CompSno INT
)

GO

	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Primary','Primary',1,0,'G001G',0,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CapitalAccount','Capital Account',1,1,'G001GG002G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loans(Liability)','Loans(Liability)',1,1,'G001GG003G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CurrentLiabilities','Current Liabilities',1,1,'G001GG004G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('FixedAssets','Fixed Assets',1,1,'G001GG005G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Investments','Investments',1,1,'G001GG006G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CurrentAssets','Current Assets',1,1,'G001GG007G',2,0,'',1, [dbo].DateToInt(GETDATE())    )
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Branch/Divisions','Branch / Divisions',1,1,'G001GG008G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Misc.Expenses(Asset)','Misc.Expenses(Asset)',1,1,'G001GG009G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SuspenseA/c','Suspense A/c',1,1,'G001GG010G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Reserves&Surplus','Reserves & Surplus',2,2,'G001GG002GG011G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('BankODA/c','Bank OD A/c',3,2,'G001GG003GG012G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SecuredLoans','Secured Loans',3,2,'G001GG003GG013G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('UnSecuredLoans','UnSecured Loans',3,2,'G001GG003GG014G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Duties&Taxes','Duties & Taxes',4,2,'G001GG004GG015G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Provisions','Provisions',4,2,'G001GG004GG016G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SundryCreditors','Sundry Creditors',4,2,'G001GG004GG017G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('StockinHand','Stock in Hand',7,2,'G001GG007GG018G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Deposits(Asset)','Deposits (Asset)',7,2,'G001GG007GG019G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loans&Adv(Asset)','Loans&Adv(Asset)',7,2,'G001GG007GG020G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SundryDebtors','Sundry Debtors',7,2,'G001GG007GG021G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CashInHand','Cash In Hand',7,2,'G001GG007GG022G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('BankAccounts','Bank Accounts',7,2,'G001GG007GG023G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SalesAccounts','Sales Accounts',1,1,'G001GG024G',4,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('PurchaseAccounts','Purchase Accounts',1,1,'G001GG025G',3,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('DirectIncomes','Direct Incomes',1,1,'G001GG026G',4,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('DirectExpenses','Direct Expenses',1,1,'G001GG027G',3,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('IndirectIncomes','Indirect Incomes',1,1,'G001GG028G',4,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('IndirectExpenses','Indirect Expenses',1,1,'G001GG029G',3,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Agent/Broker','Agent/Broker',1,1,'G001GG030G',1,0,'',1, [dbo].DateToInt(GETDATE()))
  INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loan Party(s)','Loan Party(s)',7,2,'G001GG007GG031G',2,0,'',1, [dbo].DateToInt(GETDATE()))
  INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('RePledge Party(s)','RePledge Party(s)',4,2,'G001GG004GG033G',2,0,'',1, [dbo].DateToInt(GETDATE()))

  GO

  
CREATE TABLE Ledgers
(
  LedSno INT PRIMARY KEY IDENTITY(1,1),
  Led_Code VARCHAR(20),
  Led_Name VARCHAR(50), 
  GrpSno INT,
  OpenSno INT,
  Led_Desc VARCHAR(200),
  IsStd BIT,
  Std_No INT,
  Created_Date INT,
  CompSno INT,
  UserSno INT
)  -- Ledger Master defaults  will be inserted when company is created using sp_insertdefaults procedure


CREATE TABLE Vouchers
(
  VouSno INT PRIMARY KEY IDENTITY(1,1),
  VouTypeSno INT,
  SeriesSno INT,
  Vou_No VARCHAR(20),
  Vou_Date INT,  
  Narration VARCHAR(100),
  TrackSno INT,
  IsAuto BIT,
  GenType TINYINT,
  UserSno INT,
  CompSno INT
)

GO

CREATE TABLE Voucher_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  VouSno INT,
  LedSno INT,
  Debit MONEY,
  Credit MONEY  
)
GO

CREATE TABLE Alerts_Setup
(
  SetupSno INT PRIMARY KEY IDENTITY(1,1),
  CompSno           INT,
  Admin_Mobile      VARCHAR(20),
  Sms_Api           VARCHAR(200),
  Sms_Sender_Id     VARCHAR(10),
  Sms_Username      VARCHAR(20),
  Sms_Password      VARCHAR(20),
  Sms_Peid          VARCHAR(50),
  WhatsApp_Instance VARCHAR(100)
)
GO

CREATE TABLE Templates
(
    TempSno INT PRIMARY KEY IDENTITY(1,1),
    SetupSno INT,
    Template_Name VARCHAR(20),
    Template_Id VARCHAR(50),
    Template_Text VARCHAR(1000),
    Create_Date INT
)
GO

CREATE TABLE Alerts
(
  AlertSno INT PRIMARY KEY IDENTITY(1,1),
  SetupSno INT,
  Alert_Type TINYINT,
  Alert_Caption VARCHAR(100),  
  Sms_Alert_TempSno       INT,
  WhatsApp_Alert_TempSno  INT,
  Email_Alert_TempSno     INT,
  Voice_Alert_TempSno     INT
)
GO

CREATE TABLE Alerts_History
(
  HisSno INT PRIMARY KEY IDENTITY(1,1),
  Alert_Date DATETIME,
  Alert_Destination VARCHAR(50),
  Alert_Text VARCHAR(1000),
  Alert_Url VARCHAR(1000),
  Alert_Type TINYINT,
  Alert_Mode TINYINT, --Sms / WhatsApp/ Email / Voice
  TrackSno INT,
  Response VARCHAR(100),  
  Alert_Status TINYINT, -- 1-Pending, 2-Sent, 3-Failed
  Retry_Count TINYINT
)
GO

