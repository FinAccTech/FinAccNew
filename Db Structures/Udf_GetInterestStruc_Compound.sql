
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetInterestStruc_Compound') BEGIN DROP FUNCTION Udf_GetInterestStruc_Simple END
GO

CREATE FUNCTION [dbo].Udf_GetInterestStruc_Compound(@LoanSno INT,@AsOn DATETIME)
                RETURNS	@Result	TABLE (FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY, TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY, AdjPrincipal MONEY,NewPrincipal MONEY) 
        WITH ENCRYPTION AS
                        BEGIN
                         DECLARE @Loan_Date      DATETIME
                         DECLARE @Roi            FLOAT
                         DECLARE @FromDate       DATETIME
                         DECLARE @ToDate         DATETIME
                         DECLARE @Duration       INT
                         DECLARE @IntAccured     MONEY
                         DECLARE @RecDate        DATETIME
                         DECLARE @IntPaid        MONEY
                         DECLARE @PrinPaid       MONEY
                         DECLARE @NewPrincipal   MONEY
                         DECLARE @PreCloseDays   TINYINT
                         DECLARE @Calc_Basis     BIT
                         DECLARE @GraceDays      TINYINT
                         DECLARE @MinCalcDays    TINYINT
                         DECLARE @AdvIntAmt      MONEY
                         DECLARE @BrkupPd        TINYINT
                         DECLARE @IntCalcinDays  INTEGER

                         DECLARE @BranchSno INT = (SELECT BranchSno FROM VW_LOANS WHERE LoanSno=@LoanSno)

		DECLARE @SchemeSno INT = (SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)
		SELECT @IntCalcinDays=CASE IntCalcinDays WHEN 0 THEN 360 ELSE 365 END FROM  Transaction_Setup WHERE BranchSno=@BranchSno
				
				SELECT		@Calc_Basis=Calc_Basis, @PreCloseDays=PreClosure_Days,@GraceDays=Grace_Days,@MinCalcDays=Min_CalcDays,@BrkupPd=Compound_Period
				FROM		  Schemes 
				WHERE		  SchemeSno=@SchemeSno

        SELECT     @Loan_Date=[dbo].IntToDate(Loan_Date),@NewPrincipal=Principal,@Roi=Roi, 
                  @AdvIntAmt=ISNULL(AdvIntAmt,0)

        From		VW_LOANS
        WHERE       LoanSno=@LoanSno

        /*                
		use FS2024011115
		select * from schemes
                         SELECT      @Loan_Date=Loan_Date,@Calc_Basis=Calc_Basis,@NewPrincipal=Principal,@Roi=IntPer,@BrkupPd = BrkUpDays,
                                     @PreCloseDays=PreClosure_Days,@GraceDays=Grace_Days,@MinCalcDays=MinCalc_Days,@AdvIntAmt=ISNULL(AdvInt_Amount,0)
                         From		VW_LOANS
                         WHERE       LoanSno=@LoanSno
          */
		  
                         IF @AsOn <= DATEADD(MONTH,@BrkupPd,@Loan_Date)
                            BEGIN
                                INSERT INTO @Result SELECT * FROM [dbo].Udf_GetInterestStruc_Simple(@LoanSno,@AsOn,0,0,0)
                                GoTo ENDS_HERE
                            End
            
                         DECLARE @TotIntAccured MONEY
                    
                         SET @FromDate = @Loan_Date
                    
                         WHILE @FromDate < @AsOn
                            BEGIN
                                SET @ToDate = DATEADD(MONTH,@BrkupPd,@FromDate)
                                IF @ToDate >=@AsOn SET @ToDate = @AsOn
                                SET @Duration = DATEDIFF(MONTH,@FromDate,@ToDate)
                                IF @Duration < @BrkupPd
                                    BEGIN
                                        INSERT INTO @Result SELECT * FROM [dbo].GetIntStruc_Simple(@LoanSno,@AsOn,@FromDate,@NewPrincipal,1)
                                    End
                                Else
                                    BEGIN
                                        SET @IntAccured = @NewPrincipal * @Roi/100/@IntCalcinDays*30* @Duration
                                        SET @TotIntAccured = ISNULL(@TotIntAccured,0) + @IntAccured
                                        SELECT @PrinPaid = SUM(Principal_Amt),@IntPaid=ISNULL(SUM(IntAmt),0)+@AdvIntAmt FROM Loan_Receipts
                                        WHERE LoanSno=@LoanSno AND RecDate BETWEEN @FromDate AND @ToDate
                                        SET @PrinPaid = ISNULL(@PrinPaid,0)
                                        SET @NewPrincipal = @NewPrincipal - @PrinPaid + (@IntAccured - ISNULL(@IntPaid,0))
                                        INSERT INTO @Result VALUES(
                                        @FromDate,@ToDate,@Duration,0,@IntAccured,@TotIntAccured,@IntPaid,@PrinPaid,
                                                     0,@NewPrincipal,@Duration,0)
                                        SET @IntAccured = 0
                                        SET @PrinPaid = 0
                                        SET @IntPaid = 0
                                        SET @AdvIntAmt = 0
            
                                    End
                                SET @FromDate = DATEADD(DAY,1,@ToDate)
                            End
            
        ENDS_HERE:
                         Return
                        End
