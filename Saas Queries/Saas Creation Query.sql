/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(
	'FS2025062465', --Client Code
	'Jayam gold bankers',  -- ClientName
	'No 5 , sethurathinapuram , manapparai', -- Address
	'Tamilnadu', -- State
	'9360258177', -- Mobile
	'9597465222', -- Alternate Mobile
	'jayasurya22.sgp@gmail.com', -- Email
	'Jaya surya', -- Contact Person
	20250624, -- Creation Date
	20250624, -- Subscription Start
	20260623, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025062465', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)



