/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(

	'FS2025042755', --Client Code
	'SUDHESI GOLD FINANCE',  -- ClientName
	'Valasai street, Thangachimadam, Ramanathapuram', -- Address
	'Tamilnadu', -- State
	'9790669338', -- Mobile
	'04573223622', -- Alternate Mobile
	'emkumar10@gmail.com', -- Email
	'Manoj Kumar', -- Contact Person
	20250427, -- Creation Date
	20250427, -- Subscription Start
	20260426, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025042755', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)
