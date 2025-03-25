
--select * from vw_loans where loansno = 228


DECLARE @LoanSno INT = 228

DECLARE @Loan_Date DATE
DECLARE @AsOn DATE = [dbo].IntToDate(20250310)
DECLARE @SchemeSno INT
DECLARE @Due_Start_Date DATE
DECLARE @DueAmt MONEY = 0


SELECT	@Loan_Date=[dbo].IntToDate(Loan_Date), @SchemeSno=SchemeSno, @Due_Start_Date= [dbo].IntToDate(Due_Start_Date), @DueAmt = Emi_Due_Amt
FROM	VW_LOANS 
WHERE	LoanSno=@LoanSno

DECLARE @TotDues TINYINT
DECLARE @Payment_Frequency TINYINT

SELECT @TotDues=EmiDues, @Payment_Frequency=Payment_Frequency FROM Schemes WHERE SchemeSno=@SchemeSno
--select * from vw_loans
--select * from schemes

DECLARE @Result TABLE(DueNo TINYINT, DueDate DATE, DueAmt MONEY, PaidDate DATE, PaidAmt INT, Delay_Days SMALLINT, OtherCredits MONEY)

DECLARE @DueDate DATE
SET @DueDate = @Due_Start_Date
DECLARE @Due_No TINYINT = 1
WHILE @DueDate < @AsOn
	BEGIN
		INSERT INTO @Result VALUES (@Due_No, @DueDate, @DueAmt, NULL, 0,0,0)
		SET @DueDate = CASE @Payment_Frequency
							WHEN 0 THEN DATEADD (DAY,1,   @DueDate) 
							WHEN 1 THEN DATEADD (DAY,7,   @DueDate) 
							WHEN 2 THEN DATEADD (DAY,15,  @DueDate) 
							WHEN 3 THEN DATEADD (MONTH,1, @DueDate) 
						END
    SET @Due_No = @Due_No + 1
	END

  DECLARE @Receipt_Date       DATE
  DECLARE @Rec_Principal      MONEY
  DECLARE @Rec_Interest       MONEY
  DECLARE @Rec_Other_Credits   MONEY
  DECLARE @Rec_DuesCount      TINYINT
  DECLARE @Rec_DueAmount      MONEY

  
  DECLARE Rec_Cursor CURSOR FOR SELECT [dbo].IntToDate(Receipt_Date), Rec_Principal, Rec_Interest, Rec_Other_Credits, Rec_DuesCount, Rec_DueAmount  FROM VW_RECEIPTS WHERE LoanSno=@LoanSno  ORDER BY Receipt_Date        
  OPEN Rec_Cursor

  FETCH NEXT FROM Rec_Cursor INTO @Receipt_Date, @Rec_Principal, @Rec_Interest, @Rec_Other_Credits, @Rec_DuesCount, @Rec_DueAmount
        

  SET @Due_No = 1
  WHILE @@FETCH_STATUS = 0
    BEGIN
      DECLARE @i TINYINT = 0
      WHILE @i < @Rec_DuesCount
        BEGIN
          UPDATE @Result SET PaidDate=@Receipt_Date, PaidAmt=@DueAmt, Delay_Days=DATEDIFF(DAY, (SELECT DueDate FROM @Result WHERE DueNo=@Due_No),@Receipt_Date), OtherCredits=@Rec_Other_Credits WHERE DueNo=@Due_No
          SET @Due_No = @Due_No + 1    
          SET @i = @i +1
        END

        IF @Rec_DuesCount = 0 AND @Rec_Other_Credits <> 0
          BEGIN
            UPDATE @Result SET PaidDate=@Receipt_Date, PaidAmt=0, Delay_Days=0, OtherCredits=@Rec_Other_Credits WHERE DueNo=@Due_No
            SET @Due_No = @Due_No + 1    
          END
      
      FETCH NEXT FROM Rec_Cursor INTO @Receipt_Date, @Rec_Principal, @Rec_Interest, @Rec_Other_Credits, @Rec_DuesCount, @Rec_DueAmount
    End
        
  Close Rec_Cursor
  DEALLOCATE Rec_Cursor
--	SELECT * FROM VW_RECEIPTS WHERE LoanSno=228

SELECT * FROM @Result
