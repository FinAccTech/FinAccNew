/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(
	'FS2025071170', --Client Code
	'Rajesh Thanga Maligai',  -- ClientName
	'Sriperumpudur', -- Address
	'Tamilnadu', -- State
	'9500811217', -- Mobile
	'9500811217', -- Alternate Mobile
	'', -- Email
	'Rajesh', -- Contact Person
	20250711, -- Creation Date
	20250711, -- Subscription Start
	20260710, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025071170', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)



