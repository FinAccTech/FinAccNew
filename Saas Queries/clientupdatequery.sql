ALTER PROCEDURE Sp_GetClientStatus
WITH ENCRYPTION AS

BEGIN
	  DECLARE @ClientSno INT
	  DECLARE @Client_Code VARCHAR(20)
	  DECLARE @Client_Name VARCHAR(50)
	  DECLARE @Db_Name VARCHAR(20)
	  DECLARE ClientList CURSOR FOR SELECT ClientSno, Client_Code, Client_Name, Db_Name FROM Registered_Clients WHERE Own_Server=0
	  OPEN ClientList
	  DECLARE @TblResult TABLE (ClientSno INT, Client_Code VARCHAR(20), Client_Name VARCHAR(50), Trans_Date INT, Lapse_Days INT)
	  SET NOCOUNT ON
	  FETCH NEXT FROM ClientList INTO @ClientSno, @Client_Code, @Client_Name, @Db_Name

	  IF OBJECT_ID('tempdb..#QryResult') IS NOT NULL DROP TABLE #QryResult;
	  CREATE TABLE #QryResult (
		  Trans_Date INT
	  );

	  WHILE @@FETCH_STATUS=0
		  BEGIN				
			  DECLARE @SQL NVARCHAR(MAX);
			  DECLARE @Result INT;

			  SET @SQL = 'INSERT INTO #QryResult  SELECT ISNULL(MAX(Trans_Date),0) FROM ['+ @Db_Name + '].[dbo].TRANSACTIONS';
			  --SELECT @SQL
			  --goto endnow
			  EXEC sp_executesql @SQL
			  --SELECT  @sql, Trans_Date FROM #QryResult
			  --SELECT * FROM #QryResult
			
			  INSERT INTO @TblResult(ClientSno, Client_Code, Client_Name, Trans_Date, Lapse_Days) VALUES (@ClientSno, @Client_Code, @Client_name, (SELECT Trans_Date FROM #QryResult),
          DATEDIFF(DAY, CASE WHEN (SELECT Trans_Date FROM #QryResult)=0 THEN GETDATE() ELSE [dbo].IntToDate((SELECT Trans_Date FROM #QryResult)) END , GETDATE())
        )
			  TRUNCATE TABLE #QryResult
        FETCH NEXT FROM ClientList INTO @ClientSno, @Client_Code, @Client_Name, @Db_Name
		  END
		  endnow:
	  CLOSE ClientList
	  DEALLOCATE ClientList

	  SELECT * FROM @TblResult ORDER BY Lapse_Days DESC

  END


  --select * from client_calls
