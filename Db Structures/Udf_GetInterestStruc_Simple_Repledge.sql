
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetInterestStruc_Simple_Repledge') BEGIN DROP FUNCTION Udf_GetInterestStruc_Simple_Repledge END
GO

--select * from [dbo].Udf_GetInterestStruc_Simple_Repledge(1,20240717,0)

				CREATE FUNCTION [dbo].Udf_GetInterestStruc_Simple_Repledge(
                        @RepledgeSno INT ,
						@AsOnDate INT,
						@IsCompound BIT)
            
						RETURNS	@Result	TABLE (FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY,
                                     TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY,
                                     AdjPrincipal MONEY,NewPrincipal MONEY)

				
				

  /*      DECLARE  @Result TABLE(FromDate DATETIME,ToDate DATETIME,Duration INTEGER,DurType BIT,Roi MONEY, IntAccured MONEY,
                                     TotIntAccured MONEY,IntPaid MONEY,PrinPaid MONEY,AddedPrincipal MONEY,
                                    AdjPrincipal MONEY,NewPrincipal MONEY)  */
                WITH ENCRYPTION AS
                
				BEGIN  
				
				 
				
	/*			DECLARE @RepledgeSno INT = 1
				DECLARE @AsOnDate INT = 20241231
				DECLARE @IsCompound BIT = 0 
        */
                 DECLARE @Repledge_Date      DATETIME
				          DECLARE @AsOn DATETIME = [dbo].IntToDate(@AsOnDate)
				          DECLARE @CalcFrom DATETIME 
                 DECLARE @Roi            FLOAT
                 DECLARE @FromDate       DATETIME
                 DECLARE @ToDate         DATETIME
                 DECLARE @Duration       INT
                 DECLARE @IntAccured     MONEY
				          DECLARE @TotIntAccured		MONEY = 0
                 DECLARE @Payment_Date        DATETIME
                 DECLARE @IntPaid        MONEY
                 DECLARE @PrinPaid       MONEY
                 DECLARE @NewPrincipal   MONEY
                 DECLARE @PreCloseDays   TINYINT
                 DECLARE @Calc_Basis     BIT
                 DECLARE @GraceDays      TINYINT
                 DECLARE @MinCalcDays    TINYINT
                 
                 DECLARE @IntCalcinDays		INTEGER
                 DECLARE @IntDurMonths		INT
                 DECLARE @IntDurDays        INT
                 DECLARE @AddedPrincipal MONEY

                 DECLARE @BranchSno INT = (SELECT BranchSno FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno)

                 
			DECLARE @SchemeSno INT = (SELECT SchemeSno FROM VW_REPLEDGES WHERE RepledgeSno=@RepledgeSno)
				SELECT @IntCalcinDays=CASE IntCalcinDays WHEN 0 THEN 360 ELSE 365 END FROM  Transaction_Setup WHERE BranchSno=@BranchSno
				
				SELECT		@Calc_Basis=Calc_Basis, @PreCloseDays=PreClosure_Days,@GraceDays=Grace_Days,@MinCalcDays=Min_CalcDays
				FROM		Schemes 
				WHERE		SchemeSno=@SchemeSno

                 SELECT     @Repledge_Date=[dbo].IntToDate(Repledge_Date),@NewPrincipal=Principal,@Roi=Roi
                            

                 From		     VW_REPLEDGES
                 WHERE       RepledgeSno=@RepledgeSno
                 
                 IF @AsOnDate < @Repledge_Date GOTO ENDS_HERE
                 
                --IF (@CalcFrom = 0) OR (@CalcFrom < @Repledge_Date) SET @CalcFrom = @Repledge_Date
				 SET @CalcFrom = @Repledge_Date
                
                
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
                         SELECT  @IntPaid=ISNULL(SUM(Rp_Interest),0),@PrinPaid=SUM(Rp_Principal) FROM VW_RPPAYMENTS
                         WHERE   RepledgeSno=@RepledgeSno AND RpPayment_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                         IF @IntPaid < @IntAccured SET @IntDurDays = @Duration
                         SET @NewPrincipal = @NewPrincipal - ISNULL(@PrinPaid,0)
                
                --IF @CalcFrom = @Repledge_Date
                  --                  BEGIN
                                        INSERT INTO @Result VALUES(@FromDate,@ToDate,DATEDIFF(DAY,@FromDate,@ToDate),1,@Roi,ISNULL(@IntAccured,0),
                                                                 ISNULL(@IntAccured,0),ISNULL(@IntPaid,0),ISNULL(@PrinPaid,0),0,0,ISNULL(@NewPrincipal,0))
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
                         SELECT      @IntPaid=SUM(Rp_Interest),@PrinPaid=SUM(Rp_Principal)
                         From			   VW_RPPAYMENTS
                         WHERE       RepledgeSno=@RepledgeSno AND RpPayment_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                     
                         SET @Intpaid = ISNULL(@IntPaid,0) 
                         
                         SET @Duration = CASE @Calc_Basis WHEN 0 THEN
                                             DATEDIFF(MONTH,@FromDate,DATEADD(DAY,1,@ToDate))
                                         Else
                                             DATEDIFF(DAY,@FromDate,DATEADD(DAY,1,@ToDate))
                                         End
                        
                         SET @IntAccured = CASE @Calc_Basis WHEN 0 THEN
                                                                 CAST(@Duration * (((@Roi/100)*@NewPrincipal)/@IntCalcinDays*30)AS DECIMAL(18,2))
                                                             Else
                                                                 CAST(@Duration * (((@Roi/100)*@NewPrincipal)/@IntCalcinDays)AS DECIMAL(18,2))
                                                             End
     
        
                         SET @NewPrincipal = @NewPrincipal - ISNULL(@PrinPaid,0)
						            SET @TotIntAccured = @TotIntAccured + @IntAccured

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
                         SET @Duration = DATEDIFF(DAY,@FromDate,@ToDate)
                                 
                         --CHECKING FOR ANY PRINCIPAL OR INTEREST PAID DURING THIS PERIOD------
                         IF (@Duration <= @GraceDays)  OR (@Duration=0)
                             BEGIN
                                 SELECT @IntPaid=ISNULL(SUM(Rp_Interest),0),@PrinPaid=ISNULL(SUM(Rp_Principal),0) FROM VW_RPPAYMENTS
                                 WHERE   RepledgeSno=@RepledgeSno AND RpPayment_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                        
                                 SET @Intpaid = @IntPaid 
                                 
                                 INSERT INTO @Result VALUES(@FromDate,@ToDate,@Duration,1,@Roi,0,0,@IntPaid,@PrinPaid,0,0,@NewPrincipal-@PrinPaid)
                                 GoTo ENDS_HERE
                            End
                        Else
                            BEGIN
                                 SELECT @IntPaid=ISNULL(SUM(Rp_Interest),0),@PrinPaid=ISNULL(SUM(Rp_Principal),0) FROM VW_RPPAYMENTS
                                 WHERE   RepledgeSno=@RepledgeSno AND RpPayment_Date BETWEEN [dbo].DateToInt(@FromDate) AND [dbo].DateToInt(@ToDate)
                        
                                 SET @Intpaid = @IntPaid 
                                 
                            End
                         
                     IF @Calc_Basis = 1
                         BEGIN
                             SET @IntAccured = @Duration * CAST((((@Roi/100)*@NewPrincipal)/@IntCalcinDays) AS DECIMAL(18,2))
                             IF @IntPaid < @IntAccured SET @IntDurDays = @Duration
                         End
                     Else
                         BEGIN
                            SET @IntAccured =
                            CASE
                                    WHEN @MinCalcDays = 0 THEN
                                        @Duration * CAST((((@Roi/100)*@NewPrincipal)/@IntCalcinDays) AS DECIMAL(18,2))
                                    WHEN @Duration >= @MinCalcDays THEN
                                        CAST((((@Roi/100)*@NewPrincipal)/@IntCalcinDays*30) AS DECIMAL(18,2))
                                    Else
                                        @MinCalcDays * (((@Roi/100)*@NewPrincipal)/@IntCalcinDays) 
                                    End
                             IF @IntPaid < @IntAccured
                                BEGIN
                                 SET @IntDurDays = CASE WHEN @MinCalcDays = 0 THEN @Duration WHEN @Duration >= @MinCalcDays THEN 0 ELSE @MinCalcDays End
                                 SET @IntDurMonths = CASE WHEN @MinCalcDays = 0 THEN 0 WHEN @Duration >= @MinCalcDays THEN 1 Else 0 END
                                End
                         End
						 SET @TotIntAccured = @TotIntAccured + @IntAccured
                     INSERT INTO @Result VALUES(@FromDate,@ToDate,@Duration,1,@Roi,@IntAccured,@TotIntAccured,@IntPaid,@PrinPaid,ISNULL(@AddedPrincipal,0),0,@NewPrincipal-@PrinPaid)
        ENDS_HERE:
                   Return 
                End  

				--SELECT * from @result

			
			
