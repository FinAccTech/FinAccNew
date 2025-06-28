
	--select * from Db2.[dbo].tblPledgerDet_Data
	--select * from party where compsno=2
	--use FS2025031247
	--truncate table party
	--select * from ledgers
	--delete from ledgers where ledsno > 22
  
	
    
    

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

	/*TO IMPORT FROM Dhanalaxmi Sholavandhan */

	 /*TO IMPORT FROM DESKTOP FINACC --------------------------------- */
	
		/*
		DECLARE PartiesList CURSOR FOR SELECT	Party_Code, Party_Name, Party_Cat, Rel, RelName, Address1, Address2, Address3, Address4, City, State, Pincode, Phone, Mobile, Sex, Aadhar_No, Nominee, Reference
		FROM	[dbo].Query1
	

	
	
		OPEN PartiesList
		FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Party_Cat, @Rel,@RelName,@Address1,@Address2,@Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Sex, @Aadhar_No, @Nominee, @Reference
		WHILE @@FETCH_STATUS = 0
			BEGIN				

				EXEC Sp_Party 0, @Party_Code, @Party_Name, @Print_Name, @Party_Cat, 1, @Rel, @RelName, @Address1, @Address2,@Address3,@Address4,@City,@State, @Pincode, @Phone, @Mobile, '',@Reference,0,@Sex,@Aadhar_No,
				'','',0,0,0,'',0,0,1,0,@Nominee,20250403,1,
        1,1,  --CompSno AND BranchSno
        '<ROOT> </ROOT>',0,@RetPartySno OUTPUT, @RetPartyCode OUTPUT

			FETCH NEXT FROM PartiesList INTO @Party_Code,@Party_Name, @Party_Cat, @Rel,@RelName,@Address1,@Address2,@Address3, @Address4, @City, @State, @Pincode, @Phone, @Mobile, @Sex, @Aadhar_No, @Nominee, @Reference
			END
		*/
/*TO IMPORT FROM DESKTOP FINACC --------------------------------- */

		CLOSE PartiesList

		DEALLOCATE PartiesList
