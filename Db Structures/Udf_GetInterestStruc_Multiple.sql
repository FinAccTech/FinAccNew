--select * from vw_loans
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetInterestStruc_Multiple') BEGIN DROP FUNCTION Udf_GetInterestStruc_Multiple END
GO

CREATE FUNCTION Udf_GetInterestStruc_Multiple(@LoanSno INT,@AsOnDate INT)
        --RETURNS @Result TABLE(Sno INT IDENTITY(1,1),FromDate DATE, ToDate DATE, Duration SMALLINT,Roi FLOAT,IntAccured MONEY,PrinPaid MONEY, IntPaid MONEY, AdjPrincipal MONEY, PrinBal MONEY)
        RETURNS	@Result	TABLE (FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY, TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY, AdjPrincipal MONEY,NewPrincipal MONEY)
                                                    
          WITH ENCRYPTION AS
                BEGIN 
/*  
        DECLARE @Result	TABLE (FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY, TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY, AdjPrincipal MONEY,NewPrincipal MONEY)
        DECLARE @LoanSno      INT = 178
        DECLARE @AsOnDate         INT= 20250210
  */
        DECLARE @AsOn DATETIME = [dbo].IntToDate(@AsOnDate)
        DECLARE @Loan_Date      DATE
--        DECLARE @IntPaid_Upto   DATE
        DECLARE @SchemeSno     INT
        DECLARE @Principal      MONEY
        
        
        
        DECLARE @FromDate       DATE = @Loan_Date
        DECLARE @ToDate         DATE = @FromDate
        DECLARE @Receipt_Date        DATE
        DECLARE @PreClosureDays SMALLINT = 0
        DECLARE @TotDuration SMALLINT = 0
        DECLARE @Roi FLOAT = 0
        DECLARE @IntAccured MONEY = 0
        DECLARE @TotIntAccured MONEY = 0
        DECLARE @AddedPrincipal MONEY = 0
        DECLARE @PrinPaid MONEY = 0
        DECLARE @IntPaid MONEY = 0
        DECLARE @PrinBal MONEY = @Principal
        DECLARE @AdjPrincipal MONEY
        DECLARE @IntBal MONEY = 0
        DECLARE @AdvIntAmt MONEY = 0

        SELECT  @Loan_Date = [dbo].IntToDate(Loan_Date),@SchemeSno=SchemeSno,@Principal=Principal, @AdvIntAmt=AdvIntAmt
        From	  VW_LOANS
        WHERE   LoanSno=@LoanSno

        SELECT  @PreClosureDays=Preclosure_Days
        FROM    Schemes 
        WHERE   SchemeSno=@SchemeSno

        --DECLARE @Result TABLE(Sno INT IDENTITY(1,1),FromDate DATE, ToDate DATE, Duration SMALLINT,Roi FLOAT,IntAccured MONEY,PrinPaid MONEY, IntPaid MONEY, AdjPrincipal MONEY, PrinBal MONEY)
        SET @FromDate = @Loan_Date

        IF EXISTS(SELECT ReceiptSno FROM VW_RECEIPTS WHERE LoanSno=@LoanSno)
            BEGIN
                DECLARE Rec_Cursor CURSOR FOR SELECT [dbo].IntToDate(Receipt_Date),Rec_Principal,Rec_Interest FROM VW_RECEIPTS WHERE LoanSno=@LoanSno  ORDER BY Receipt_Date        
                OPEN Rec_Cursor
                FETCH NEXT FROM Rec_Cursor INTO @Receipt_Date,@PrinPaid,@IntPaid
        
                SET @PrinBal = @Principal
                
                WHILE @@FETCH_STATUS = 0
                    BEGIN
                        SET @ToDate = @Receipt_Date
        
                        --STEP 1 : GET DURATION
                        SET @TotDuration = DATEDIFF(DAY,@FromDate, @ToDate)
        
                        --STEP 2: GET ROI AS PER DURATION
						
                        SELECT      @Roi=Roi
                        From		    Scheme_Details
                        WHERE       SchemeSno=@SchemeSno
                                    AND (@TotDuration >= FromPeriod) AND (@TotDuration <=ToPeriod or ToPeriod=0)
        
                        --STEP 3: CALCULATE INTEREST
                        SET @IntAccured = @TotDuration * ((@Roi/100)*@PrinBal / 12 /30)
                        SET @TotIntAccured = @TotIntAccured + @IntAccured

                        --STEP 4: CHECK FOR IF ANY ADDITIONAL PRINCIPAL PAID IN BETWEEN
                        SELECT @AddedPrincipal=SUM(Amount) FROM Loan_Payments WHERE (LoanSno=@LoanSno) AND (Pmt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate))
                        SET @PrinBal = @PrinBal + ISNULL(@AddedPrincipal,0)
                        SET @AddedPrincipal = 0

                        SET @IntPaid = @IntPaid + @AdvIntAmt
                        SET @AdvIntAmt = 0

                        IF @IntPaid >= @IntAccured
                        BEGIN
                            --SET @FromDate = @ToDate
                            SET @AdjPrincipal = @IntPaid - @IntAccured
                            SET @PrinBal = @PrinBal - @AdjPrincipal
                        End
                       
        
                        SET @PrinBal = @PrinBal - @PrinPaid
        
                        --SET @IntBal = @IntBal + (@IntAccured - @IntPaid)                                            
                        INSERT INTO @Result(FromDate,ToDate,Duration,DurType,Roi,IntAccured,TotIntAccured,IntPaid,PrinPaid,AddedPrincipal,AdjPrincipal,NewPrincipal)
                        VALUES             (@FromDate,@ToDate,@TotDuration,1, @Roi,@IntAccured,@TotIntAccured, @IntPaid,@PrinPaid,  @AddedPrincipal, ISNULL(@AdjPrincipal,0), @PrinBal)
        
                        SET @FromDate = DATEADD(DAY,1,@ToDate)
        
                        FETCH NEXT FROM Rec_Cursor INTO @Receipt_Date,@PrinPaid,@IntPaid
                    End
        
                Close Rec_Cursor
                DEALLOCATE Rec_Cursor
        
                --REMAINING DAYS AFTER RECEIPTS
                IF @AsOn >= @ToDate
                    BEGIN
                        SET @FromDate = DATEADD(DAY,1, @ToDate)
                        SET @ToDate = @AsOn
                        
                        SET @TotDuration = DATEDIFF(DAY,@FromDate, @ToDate)
                        SET @PrinPaid = 0
                        SET @IntPaid = 0
                        SET @AdjPrincipal = 0
                
                        SELECT      @Roi=Roi
                        From        Scheme_Details
                        WHERE       SchemeSno=@SchemeSno
                                    AND (@TotDuration >= FromPeriod) AND (@TotDuration <=ToPeriod or ToPeriod=0)


                        SET @IntAccured = @TotDuration * ((@Roi/100)*@PrinBal / 12 /30)
                        SET @TotIntAccured = @TotIntAccured + @IntAccured

                          SELECT @AddedPrincipal=SUM(Amount) FROM Loan_Payments WHERE (LoanSno=@LoanSno) AND (Pmt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate))
                          SET @PrinBal = @PrinBal + ISNULL(@AddedPrincipal,0)
                          SET @AddedPrincipal = 0

        
                        INSERT INTO @Result(FromDate,ToDate,Duration,DurType,Roi,IntAccured,TotIntAccured, IntPaid, PrinPaid, AddedPrincipal, AdjPrincipal,NewPrincipal)
                        VALUES             (@FromDate,@ToDate,@TotDuration,1, @Roi,@IntAccured,@TotIntAccured, @IntPaid,@PrinPaid,  @AddedPrincipal, ISNULL(@AdjPrincipal,0), @PrinBal)
                    End
        
            End
        ELSE
            BEGIN
                
                SET @TotDuration = DATEDIFF(DAY,@FromDate, @AsOn)
                SET @PrinBal = @Principal
                SELECT      @Roi=Roi
                From        Scheme_Details
                WHERE       SchemeSno=@SchemeSno
                            AND (@TotDuration >= FromPeriod) AND (@TotDuration <=ToPeriod or ToPeriod=0)
                
                IF @TotDuration < @PreClosureDays BEGIN SET @TotDuration = @PreClosureDays END
                SET @IntAccured = @TotDuration * ((@Roi/100)*@Principal / 12 /30)

                SELECT @AddedPrincipal=SUM(Amount) FROM Loan_Payments WHERE (LoanSno=@LoanSno) AND (Pmt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate))
                SET @PrinBal = @PrinBal + ISNULL(@AddedPrincipal,0)
                SET @AddedPrincipal = 0

                SET @IntPaid = @AdvIntAmt
                INSERT INTO @Result(FromDate,ToDate,Duration,DurType,Roi,IntAccured,TotIntAccured, IntPaid, PrinPaid, AddedPrincipal, AdjPrincipal,NewPrincipal)
                VALUES             (@FromDate,@AsOn,@TotDuration,1, @Roi,@IntAccured,@TotIntAccured, @IntPaid,@PrinPaid,  @AddedPrincipal,ISNULL(@AdjPrincipal,0), @PrinBal)
            END
          Return
         End   

        /*select * from @Result */

        

