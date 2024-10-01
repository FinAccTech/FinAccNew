
IF EXISTS(SELECT name FROM SYS.OBJECTS WHERE NAME='GetVoucherXML') BEGIN DROP FUNCTION GetVoucherXML END
GO
--SELECT * FROM VOUCHER_TYPES

--sp_recompile @objname =  N'GetVoucherXML'
--UPDATE STATISTICS Ledgers
--UPDATE STATISTICS party

-- Select CAST([dbo].GetVoucherXML(1,15,50,2,10000,500,100,25000,500,200,1000,4540,4550,'<Voucher_Details LedSno="2" Debit="5000" Credit="0"> </Voucher_Details> ') AS XML)

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
   /*
  DECLARE @CompSno				    INT = 1
	DECLARE @VouTypeSno				  INT = 12
	DECLARE @PartySno				    INT = 50
	DECLARE @IsOpen					    TINYINT = 1
	DECLARE @Principal				  MONEY = 10000
	DECLARE @AdvIntAmount			  MONEY = 500
	DECLARE @DocChargesAmt		  MONEY = 100
	DECLARE @Rec_Principal		  MONEY = 0
	DECLARE @Rec_Interest			  MONEY = 0
	DECLARE @Rec_AddLess			  MONEY = 0
	DECLARE @Rec_DefaultAmt		  MONEY  = 0
	DECLARE @Rec_Other_Debits	  MONEY = 0
	DECLARE @Rec_Other_Credits  MONEY = 0
	DECLARE @PayModeXml				  XML = '<Voucher_Details LedSno="2" Debit="5000" Credit="0"> </Voucher_Details>'  */

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
			
			IF @VouTypeSno = 12 
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
        
			ELSE IF @VouTypeSno = 13 
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
			  ELSE IF @VouTypeSno = 14
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
	
	SET @RetXml = @RetXml + '</Voucher>'
	SET @RetXml = @RetXml + '</ROOT>'

 -- SELECT @RetXml

  
	RETURN @RetXml
  END

