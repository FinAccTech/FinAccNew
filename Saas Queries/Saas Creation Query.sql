/*
	use finaccsaas
	select * from Registered_Clients
*/


INSERT INTO Registered_Clients (Client_Code, Client_Name, Address, State, Mobile, Alternate_Mobile, Email, Contact_Person, Creation_Date, Subscription_Start, Subscription_End, App_Login, App_Pwd, Db_Name, Status, Version_Type, Own_Server)
VALUES 
(
	'FS2025062866', --Client Code
	'Venkatachalapathi Finance',  -- ClientName
	'SIHS Colony Road, Singanallur, Coimbatore', -- Address
	'Tamilnadu', -- State
	'9742763030', -- Mobile
	'9443357392', -- Alternate Mobile
	'venkatgoldfinance@gmail.com', -- Email
	'Kabilan Palanivel', -- Contact Person
	20250628, -- Creation Date
	20250628, -- Subscription Start
	20260627, -- Subscription End
	'', -- App Login
	'', -- App_Pwd
	'FS2025062866', -- DbName
	1, -- Status
	3, -- Version Type
	0 -- Own_Serer
)



