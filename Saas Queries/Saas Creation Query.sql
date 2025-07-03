/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(
	'FS2025070368', --Client Code
	'Vasanth Kumbakonam',  -- ClientName
	'Kumbakonam,', -- Address
	'Tamilnadu', -- State
	'9840559733', -- Mobile
	'', -- Alternate Mobile
	'', -- Email
	'Vasanth', -- Contact Person
	20250703, -- Creation Date
	20250703, -- Subscription Start
	20260702, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025070368', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)



