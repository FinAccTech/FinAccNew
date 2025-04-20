/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(

	'FS2025041453', --Client Code
	'Udayam Nidhiyagam',  -- ClientName
	'Cauvery Nagar south, Pudukottai Road, Thanjavur', -- Address
	'Tamilnadu', -- State
	'9043257800', -- Mobile
	'', -- Alternate Mobile
	'', -- Email
	'Naveen', -- Contact Person
	20250414, -- Creation Date
	20250414, -- Subscription Start
	20260413, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025041453', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)
