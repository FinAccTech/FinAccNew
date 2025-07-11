
	--select * from Db2.[dbo].tblPledgerDet_Data
	--select * from party where compsno=2
	--use FS2025031247
	--truncate table party
	--select * from ledgers
	--delete from ledgers where ledsno > 22
  
	
    /*
		select * from items
		update items set Remarks='', Active_Status=1, Create_Date=20250711, usersno=1, compsno = 1

		insert into items(item_code, item_name, grpsno) select item_code, item_name, grpsno from query
	*/

	DECLARE @Party_Code		VARCHAR(20)
	DECLARE @Party_Name		VARCHAR(100)
	DECLARE @Print_Name		VARCHAR(100)
	DECLARE @Party_Cat		TINYINT
	DECLARE @Rel			TINYINT
	DECLARE @RelName		VARCHAR(50)
	DECLARE @Address1		VARCHAR(100)
	DECLARE @Address2		VARCHAR(100)
	DECLARE @Address3		VARCHAR(100)
	DECLARE @Address4		VARCHAR(100)
	DECLARE @City			VARCHAR(100)
	DECLARE @State			VARCHAR(100)
	DECLARE @Pincode		VARCHAR(20)
	DECLARE @Phone			VARCHAR(20)
	DECLARE @Mobile			VARCHAR(20)
	DECLARE @Sex			TINYINT
	DECLARE @Aadhar_No		VARCHAR(50)
	DECLARE @Nominee		VARCHAR(50)
	DECLARE @Reference		VARCHAR(50)
	DECLARE @Occupation		VARCHAR(50)

	DECLARE @RetPartySno INT = 0	
	DECLARE @RetPartyCode VARCHAR(20) = ''

	/*TO IMPORT FROM Dhanalaxmi Sholavandhan */
		/*	
		DECLARE PartiesList CURSOR FOR SELECT	PledgerID, Pledgername, 
											CASE WHEN FatherName = '' THEN 2 ELSE 0 END, 		
											CASE WHEN FatherName = '' THEN WifeHusband ELSE FatherName END,
											Place, Street, Pincode, Phone, Occupation	
									FROM	Db2.[dbo].tblPledgerDet_Data
		OPEN PartiesList
		FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Rel,@RelName,@Address1,@Address2,@Pincode, @Mobile, @Occupation
		WHILE @@FETCH_STATUS = 0
			BEGIN				

				 EXEC Sp_Party 0, @Party_Code, @Party_Name, @Party_Name, @Party_Cat, 1, @Rel, @RelName, @Address1, @Address2,@Address3,@Address4,@City,@State, @Pincode, @Phone, @Mobile, '',@Reference,0,@Sex,@Aadhar_No,
      '','','','',0,'',
      '','',0,0,0,'',0,0,1,0,0,20250612,1,1,1,'<ROOT> </ROOT>',0,
      '','','','','',@RetPartySno OUTPUT, @RetPartyCode OUTPUT

				FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Rel,@RelName,@Address1,@Address2,@Pincode, @Mobile, @Occupation
			END 
			*/

	/*TO IMPORT FROM Dhanalaxmi Sholavandhan */

	 /*TO IMPORT FROM DESKTOP FINACC --------------------------------- */
	
		
		DECLARE PartiesList CURSOR FOR SELECT	Party_Code, Party_Name, Party_Cat, Rel, RelName, Address1, Address2, Address3, Address4, City, State, Pincode, Phone, Mobile, Sex, Aadhar_No, Nominee, Reference
		FROM	[dbo].Query
	

	
	
		OPEN PartiesList
		FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Party_Cat, @Rel,@RelName,@Address1,@Address2,@Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Sex, @Aadhar_No, @Nominee, @Reference
		WHILE @@FETCH_STATUS = 0
			BEGIN				
					
			EXEC Sp_Party 
				0,						--@PartySno        INT,
				@Party_Code,			--@Party_Code      VARCHAR(20),
				@Party_Name,			--@Party_Name      VARCHAR(200),
				@Print_Name,			--@Print_Name      VARCHAR(200),
				@Party_Cat,				--@Party_Cat       TINYINT,
				1,						--@AreaSno         INT,
				@Rel,					--@Rel             TINYINT,
				@RelName,				--  @RelName         VARCHAR(200),
				@Address1,				--  @Address1        VARCHAR(200),
				@Address2,				--  @Address2        VARCHAR(200),
				@Address3,				--@Address3        VARCHAR(200),
				@Address4,				--@Address4        VARCHAR(200),
				@City,					--  @City            VARCHAR(200),
				@State,					--@State           VARCHAR(200),
				@Pincode,				--  @Pincode         VARCHAR(10),
				@Phone,					--@Phone           VARCHAR(20),
				@Mobile,				-- @Mobile          VARCHAR(20),
				'',						-- @Email           VARCHAR(50),
				@Reference,				--@Reference         VARCHAR(50),
				0,						-- @Dob               INT,
				@Sex,					-- @Sex               TINYINT,
				@Aadhar_No,				-- @Aadhar_No         VARCHAR(20),
				'',						-- @Pancard_No        VARCHAR(20),
				'',						-- @Smartcard_No      VARCHAR(20),
				'',						-- @Voterid_No        VARCHAR(20),
				@Nominee,				-- @Nominee           VARCHAR(50),
				'',						-- @Nominee_Rel       VARCHAR(20),
				'',						-- @Nominee_Aadhar    VARCHAR(20),
				'',						-- @Remarks           VARCHAR(100),
				'',						-- @Occupation        VARCHAR(20),
				0,						-- @Monthly_Income    MONEY,
				0,						-- @Loan_Value_Limit  MONEY,
				0,						-- @Allow_More_Value  BIT,
				'',						-- @Verify_Code       VARCHAR(10),
				0,						-- @Verify_Status     BIT,
				0,						-- @Fp_Status         BIT,
				1,						-- @Active_Status     BIT,
				0,						-- @IsFavorite         BIT,
				0,						-- @BlackListed       BIT,
				20250711,				-- @Create_Date       INT,
				1,						-- @UserSno           INT,
				1,						-- @CompSno           INT,
				1,						-- @BranchSno         INT,
				'<ROOT> </ROOT>',		-- @ImageDetailXML    XML,
				0,						-- @LedSno             INT,
				'',						-- @Bank_AccName      VARCHAR(50),
				'',						-- @Bank_Name         VARCHAR(50),
				'',						-- @Bank_Branch_Name  VARCHAR(50),
				'',						-- @Bank_AccountNo    VARCHAR(50),
				'',						-- @Bank_Ifsc         VARCHAR(20),
				@RetPartySno OUTPUT,	-- @RetSno	            INT OUTPUT,
				@RetPartyCode OUTPUT	-- @Ret_Party_Code   VARCHAR(20) OUTPUT
		

			FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Party_Cat, @Rel,@RelName,@Address1,@Address2,@Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Sex, @Aadhar_No, @Nominee, @Reference
			END
		
/*TO IMPORT FROM DESKTOP FINACC --------------------------------- */

		CLOSE PartiesList

		DEALLOCATE PartiesList
