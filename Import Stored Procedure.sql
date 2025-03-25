 /*   Sp_ImportLoan 'ln2012', 20020321,	12,		1,	'CUST100',	'srini',	0,	'rathinasamy',	'elur pirivu',	'',	'',	'',	'coimbatore',	'tn',	'641032',	'northe cbne',	'9894027999',	'2610144',	'srini@gmail.com',	'2516 7263 4545 4878',	1,	5,	20,	18,	15,
	    21000,	18000,	24,	1,	200,	50,	17500,	20260320,	'no remarks',	'<ROOT> <Transaction> </Transaction> </ROOT>',	'<Voucher_Details LedSno="2" Debit="0" Credit="21000"> </Voucher_Details>',	1,	1,	1
*/

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Sp_ImportLoan') BEGIN DROP PROCEDURE Sp_ImportLoan END
GO

CREATE PROCEDURE Sp_ImportLoan
	@Loan_No				VARCHAR(20),
	@Loan_Date				INT,
	@SeriesSno				INT,
	@SchemeSno				INT,
	@Customer_Code			VARCHAR(20),
	@Customer_Name			VARCHAR(200),
	@Rel					TINYINT,
	@RelName				VARCHAR(200),
	@Address1				VARCHAR(500),
	@Address2				VARCHAR(500),
	@Address3				VARCHAR(500),
	@Address4				VARCHAR(500),
	@City					VARCHAR(200),
	@State					VARCHAR(200),
	@Pincode				VARCHAR(10),
	@Area					VARCHAR(200),
	@Mobile					VARCHAR(20),
	@Phone					VARCHAR(30),
	@Email					VARCHAR(50),
	@Aadhar_No				VARCHAR(20),
	@IGroup					VARCHAR(20),	
	@TotQty					TINYINT,
	@TotGrossWt				DECIMAL(8,3),
	@TotNettWt				DECIMAL(8,3),
	@TotPureWt				DECIMAL(8,3),
	@Market_Value			MONEY,
	@Principal				MONEY,
	@Roi					DECIMAL(4,2),
	@AdvIntDur				TINYINT,
	@AdvIntAmt				MONEY,
	@DocChargesAmt			MONEY,
	@Nett_Payable			MONEY,
	@Mature_Date			INT,
	@Remarks				VARCHAR(100),
	@ItemDetails			VARCHAR(200),
	@PaymentModesXML		XML,
	@CompSno				INT,
	@BranchSno				INT,
	@CheckPartyParam		TINYINT -- 1- By Code, 2- By Mobile

WITH ENCRYPTION AS

BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

	DECLARE @AreaSno INT   --CREATING AREA IF DOES NOT EXIST (CHECKING BY AREA NAME)
	SELECT @AreaSno=AreaSno FROM Area WHERE Area_Name=@Area AND CompSno=@CompSno
	IF ISNULL(@AreaSno,0)=0
		BEGIN
			EXEC Sp_Area 0,	'',@Area,'', 1, 0, 1,  @CompSno, @BranchSno, @AreaSno OUTPUT
		END
	
	DECLARE @PartySno INT  -- CREATING CUSTOMER IF DOES NOT EXIST
	DECLARE @RetPartyCode VARCHAR(20) = ''
	IF @CheckPartyParam = 1
		BEGIN
			SELECT @PartySno = PartySno FROM Party WHERE Party_Code=@Customer_Code AND CompSno=@CompSno			
			SELECT @Customer_Code
		END
	ELSE IF @CheckPartyParam = 2
		BEGIN
			SELECT @PartySno = PartySno FROM Party WHERE Mobile=@Mobile AND CompSno=@CompSno
		END
		
	IF ISNULL(@PartySno,0) = 0
		BEGIN
			EXEC Sp_Party	0, @Customer_Code, @Customer_Name, @Customer_Name, 1, @AreaSno, @Rel,  @RelName, @Address1, @Address2, @Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Email, '', 0, 1, @Aadhar_No,'', '',
							0, 0, 0, '', 0, 0, 1, 0, '', 0, 1 , @CompSno, @BranchSno, '<ROOT> <Images> </Images> </ROOT>', 0, @PartySno OUTPUT, @RetPartyCode OUTPUT
							
		END

	DECLARE @GrpSno INT = 0
	SELECT @GrpSno=GrpSno FROM Item_Groups WHERE Grp_Name=@IGroup
	
	IF ISNULL(@GrpSno,0)=0 GOTO CloseNow
	
	DECLARE @LoanSno INT = 0
	DECLARE @RetLoan_No VARCHAR(20) = ''

	EXEC Sp_Transactions	0,	12, @SeriesSno, @Loan_No,
							/*FOR REPLEDGE */
							'', 0,	
							@Loan_Date,	@PartySno, @SchemeSno, @GrpSno,	@TotQty, @TotGrossWt, @TotNettWt, @TotPureWt, @Market_Value, 0, 0, @Principal, @Roi, @AdvIntDur, @AdvIntAmt, 0, @DocChargesAmt, 
							/* FOR EMI */
							0, 0, 0, 0, 0,	
							/* FOR RECEIPT */
							0,0,0,0,0,0,0,0,0,0,0,
							/*FOR REDEMPTION */
							0,@Nett_Payable, @Mature_Date,0,1,1, 
							@Remarks,
							0, 1, @CompSno, @BranchSno,
							@ItemDetailXML,
							'<ROOT> <Images> </Images> </ROOT>',
							'<ROOT> </ROOT>',
							@PaymentModesXML,
							@LoanSno OUTPUT,
							@RetLoan_No OUTPUT

	COMMIT TRANSACTION
	RETURN @LoanSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0

END
