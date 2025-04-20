ALTER TABLE Transaction_Details add tempGross_Wt decimal(8,3), tempStone_Wt decimal(8,3), tempNett_Wt decimal(8,3)
go

update Transaction_Details set tempGross_Wt=Gross_Wt, tempStone_Wt=Stone_Wt, tempNett_Wt=Nett_Wt

go

alter table Transaction_Details drop column Gross_Wt
go
alter table Transaction_Details drop column Stone_Wt
go
alter table Transaction_Details drop column Nett_Wt
go

ALTER TABLE Transaction_Details add Gross_Wt decimal(8,3), Stone_Wt decimal(8,3), Nett_Wt decimal(8,3)
go

update Transaction_Details set Gross_Wt=tempGross_Wt, Stone_Wt=tempStone_Wt, Nett_Wt=tempNett_Wt
go

alter table Transaction_Details drop column tempGross_Wt
go
alter table Transaction_Details drop column tempStone_Wt
go
alter table Transaction_Details drop column tempNett_Wt
go


