
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetInterestStruc_Velsamy') BEGIN DROP FUNCTION Udf_GetInterestStruc_Velsamy END
GO


--select * from [dbo].Udf_GetInterestStruc_Simple(1,20240717,0)

				CREATE FUNCTION [dbo].Udf_GetInterestStruc_Velsamy(
                        @LoanSno INT ,
						@AsOnDate INT,
						@IsCompound BIT)

						RETURNS	@Result	TABLE (FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY,
                                     TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY,
                                     AdjPrincipal MONEY,NewPrincipal MONEY)

				
				

  /*      DECLARE  @Result TABLE(FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY,
                                     TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY,
                                    AdjPrincipal MONEY,NewPrincipal MONEY)   */
                WITH ENCRYPTION AS 
                
				BEGIN  
				
				 
				
		/*		DECLARE @LoanSno INT = 3
				DECLARE @AsOnDate INT = 20240719
				DECLARE @IsCompound BIT = 0   */

                 DECLARE @Loan_Date      DATETIME
				 DECLARE @AsOn DATETIME = [dbo].IntToDate(@AsOnDate)
				 DECLARE @CalcFrom DATETIME 
                 DECLARE @Roi            FLOAT
                 DECLARE @FromDate       DATETIME
                 DECLARE @ToDate         DATETIME
                 DECLARE @Duration       INT
                 DECLARE @IntAccured     MONEY
				        DECLARE @TotIntAccured		MONEY = 0
                 DECLARE @Receipt_Date        DATETIME
                 DECLARE @IntPaid        MONEY
                 DECLARE @PrinPaid       MONEY
                 DECLARE @NewPrincipal   MONEY
                 DECLARE @PreCloseDays   TINYINT
                 DECLARE @Calc_Basis     BIT
                 DECLARE @GraceDays      TINYINT
                 DECLARE @MinCalcDays    TINYINT
                 DECLARE @AdvIntAmt      MONEY
                 DECLARE @IntCalcinDays		INTEGER
                 DECLARE @IntDurMonths		INT
                 DECLARE @IntDurDays        INT
                 DECLARE @AddedPrincipal MONEY
        
        IF @Ason < @Loan_Date GOTO ENDS_HERE

                 
			DECLARE @SchemeSno INT = (SELECT SchemeSno FROM VW_LOANS WHERE LoanSno=@LoanSno)
				SELECT @IntCalcinDays=CASE IntCalcinDays WHEN 0 THEN 360 ELSE 365 END FROM  Transaction_Setup
        
        
				
				SELECT		@Calc_Basis=Calc_Basis, @PreCloseDays=PreClosure_Days,@GraceDays=Grace_Days,@MinCalcDays=Min_CalcDays
				FROM		Schemes 
				WHERE		SchemeSno=@SchemeSno

                 SELECT     @Loan_Date=[dbo].IntToDate(Loan_Date),@NewPrincipal=Principal,@Roi=Roi, 
                            @AdvIntAmt=ISNULL(AdvIntAmt,0)

                 From		VW_LOANS
                 WHERE       LoanSno=@LoanSno
                 
                 IF @IsCompound=1 SET @AdvIntAmt=0
                 
                --IF (@CalcFrom = 0) OR (@CalcFrom < @Loan_Date) SET @CalcFrom = @Loan_Date
				 SET @CalcFrom = @Loan_Date
                
                
                SET @FromDate = @CalcFrom
                 -----TO CHECK FOR PRE-CLOSURE AND UPDATE RESULT-----------
                 IF @AsOn <= DATEADD(MONTH,1,@CalcFrom)
                     BEGIN
                         SET @FromDate=@CalcFrom
                         SET @ToDate = @AsOn
        
                         IF DATEDIFF(DAY,@FromDate,@ToDate) > @PreCloseDays
                                    BEGIN
                                        SET @Duration = DATEDIFF(DAY,@FromDate,@ToDate)
                                    End
                                Else
                                    BEGIN
                                        SET @Duration = @PreCloseDays
                                    END
        
                         IF @Duration=0 SET @Duration=DATEDIFF(DAY,@FromDate,@ToDate)
                         IF @Duration=0 SET @Duration=1
                         SET @IntAccured = CAST((@Duration * @Roi/100*@NewPrincipal/@IntCalcinDays) AS DECIMAL(18,2))
                         --CHECKING FOR ANY PRINCIPAL OR INTEREST PAID DURING THIS PERIOD------
                         SELECT  @IntPaid=ISNULL(SUM(Rec_Interest),0),@PrinPaid=SUM(Rec_Principal) FROM VW_RECEIPTS
                         WHERE   LoanSno=@LoanSno AND Receipt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                         IF @IntPaid < @IntAccured SET @IntDurDays = @Duration
                         SET @NewPrincipal = @NewPrincipal - ISNULL(@PrinPaid,0)
                
                --IF @CalcFrom = @Loan_Date
                  --                  BEGIN
                                        INSERT INTO @Result VALUES(@FromDate,@ToDate,DATEDIFF(DAY,@FromDate,@ToDate),1,@Roi,ISNULL(@IntAccured,0),
                                                                 ISNULL(@IntAccured,0),ISNULL(@IntPaid,0)+@AdvIntAmt,ISNULL(@PrinPaid,0),0,0,ISNULL(@NewPrincipal,0))
                    --                End
                      /*          Else
                                    BEGIN
                                        INSERT INTO @Result VALUES(@FromDate,@ToDate,DATEDIFF(DAY,@FromDate,@ToDate),1,ISNULL(@IntAccured,0),
                                                                 0,ISNULL(@IntPaid,0),ISNULL(@PrinPaid,0),0,ISNULL(@NewPrincipal,0),@IntDurMonths,@IntDurDays)
                                    End */
                        
                         GoTo ENDS_HERE
                     End
                        
                 -- TO UPDATE RESULT FOR BETWEEN PERIOD
                 WHILE @FromDate < @AsOn
                     BEGIN
                         SET @ToDate =
                                 CASE @Calc_Basis WHEN 0 THEN
                                     DATEADD(MONTH,1,@FromDate) - 1
                                 Else
                                     DATEADD(DAY,30,@FromDate) - 1
                                 End
                         
                         IF @ToDate > @AsOn GOTO REMAIN_PER_CALCULATION
                         
                         --CHECKING FOR ANY PRINCIPAL OR INTEREST PAID DURING THIS PERIOD------
                         SELECT      @IntPaid=SUM(Rec_Interest),@PrinPaid=SUM(Rec_Principal)
                         From			VW_RECEIPTS
                         WHERE       LoanSno=@LoanSno AND Receipt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                     
                         SET @Intpaid = ISNULL(@IntPaid,0) + @AdvIntAmt
                         SET @AdvIntAmt = 0
                         SET @Duration = CASE @Calc_Basis WHEN 0 THEN
                                             DATEDIFF(MONTH,@FromDate,DATEADD(DAY,1,@ToDate))
                                         Else
                                             DATEDIFF(DAY,@FromDate,DATEADD(DAY,1,@ToDate))
                                         End
        
        -------------- FOR ADD PRINCIPAL --- UPDATED ON 05/12/20 ---------------------A1
                                 SELECT @AddedPrincipal=SUM(Amount) FROM Loan_Payments WHERE (LoanSno=@LoanSno) AND (Pmt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate))
                                 SET @NewPrincipal = @NewPrincipal + ISNULL(@AddedPrincipal,0)
                                ------------------------------------------------------------------------------A1
                        
                         SET @IntAccured = CASE @Calc_Basis WHEN 0 THEN
                                                                 CAST(@Duration * (((@Roi/100)*@NewPrincipal)/@IntCalcinDays*30)AS DECIMAL(18,2))
                                                             Else
                                                                 CAST(@Duration * (((@Roi/100)*@NewPrincipal)/@IntCalcinDays)AS DECIMAL(18,2))
                                                             End
     
        
                         SET @NewPrincipal = @NewPrincipal - ISNULL(@PrinPaid,0)
						             SET @TotIntAccured = (@TotIntAccured + @IntAccured) - (@IntPaid)

                         INSERT INTO @Result VALUES(@FromDate,@ToDate,@Duration,@Calc_Basis,@Roi,
                                                     ISNULL(@IntAccured,0),ISNULL(@TotIntAccured,0),
                                                     ISNULL(@IntPaid,0),ISNULL(@PrinPaid,0),ISNULL(@AddedPrincipal,0),0,ISNULL(@NewPrincipal,0))
                         SET @IntPaid = 0
                         SET @PrinPaid = 0
                         SET @FromDate = DATEADD(DAY,1,@ToDate)
        NEXT_PERIOD:
                     End
                        
                 ------CALCULATING THE REMAIN PERIOD------------
        REMAIN_PER_CALCULATION:                      
                         SET @ToDate = @AsOn
                         IF @FromDate > @ToDate GOTO ENDS_HERE

                         SET @IntPaid = 0
                         SET @Duration = DATEDIFF(DAY,@FromDate,@ToDate)

                         DECLARE @QuarterInterest MONEY = ((((@Roi/100)*@NewPrincipal)/@IntCalcinDays) * 30)/4

                          IF @Duration <= 3
                            BEGIN
                              SET @IntAccured = @Duration * ((@Roi/100)*@NewPrincipal)/@IntCalcinDays
                            END
                          ELSE IF @Duration >= 4 AND @Duration <=7
                            BEGIN
                              SET @IntAccured = @QuarterInterest
                            END
                          ELSE IF @Duration > 7 AND @Duration < 16
                            BEGIN
                              SET @IntAccured = @QuarterInterest *2
                            END
                          ELSE IF @Duration > 15 AND @Duration < 22
                            BEGIN
                              SET @IntAccured = @QuarterInterest *3
                            END
                          ELSE
                            BEGIN
                              SET @IntAccured = @QuarterInterest *4
                            END

							--CHECKING FOR ANY PRINCIPAL OR INTEREST PAID DURING THIS PERIOD------
                         SELECT      @IntPaid=ISNULL(SUM(Rec_Interest),0),@PrinPaid=ISNULL(SUM(Rec_Principal),0)
                         From			VW_RECEIPTS
                         WHERE       LoanSno=@LoanSno AND Receipt_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)

						    
                SET @TotIntAccured = (@TotIntAccured + @IntAccured) - (@IntPaid)
              INSERT INTO @Result VALUES(@FromDate,@ToDate,@Duration,1,@Roi,@IntAccured,@TotIntAccured,@IntPaid,@PrinPaid,ISNULL(@AddedPrincipal,0),0,@NewPrincipal-@PrinPaid)
        ENDS_HERE:
                   Return 
                End   

				--SELECT * from @result

			
			
