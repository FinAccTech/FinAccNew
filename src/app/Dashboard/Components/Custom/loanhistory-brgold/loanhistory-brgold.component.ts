import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsReports } from 'src/app/Dashboard/Classes/ClsReports';
import { TypeFieldInfo } from 'src/app/Dashboard/Types/TypeFieldInfo';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';

interface TypeHistoryList{
  Loan_No: string;  Comp_Name: string;  Party_Code: string;  Party_Name: string;  Mobile: string;  Aadhar_No: string;  SmartCard_No: string;  Dob: string;  Age: string;  Address1 : string;
  Address2 : string;  Address3 : string;  Address4: string;  City: string;  Pincode: string;  Nominee: string;  Nominee_Rel: string;  Nominee_Aadhar: string;  Scheme_Name: string;
  Loan_Date: string;  Principal: number;  Loan_Status: string;  Principal_Balance: number;  Interest_Balance: number;  Nett_Balance: number;  Closing_Date: string;
}

@Component({
  selector: 'app-loanhistory-brgold',  
  templateUrl: './loanhistory-brgold.component.html',
  styleUrl: './loanhistory-brgold.component.scss'
})

@AutoUnsubscribe
export class LoanhistoryBrgoldComponent {
  
constructor(private dataService: DataService, private globals: GlobalsService, private dialog: MatDialog, private auth: AuthService ){}
  
  @ViewChild('TABLE')  table!: ElementRef;
 
  HistoryList: TypeHistoryList[] = [];  
  FieldNames: TypeFieldInfo[] = [
    {Field_Name:"#", Data_Type:"string" }, 
    {Field_Name:"Loan_No", Data_Type:"string" }, 
    {Field_Name:"Comp_Name", Data_Type:"string" }, 
    {Field_Name:"Party_Code", Data_Type:"string" }, 
    {Field_Name:"Party_Name", Data_Type:"string"}, 
    {Field_Name:"Mobile", Data_Type:"string"}, 
    {Field_Name:"Aadhar_No", Data_Type:"string" },     
    {Field_Name:"SmartCard_No", Data_Type:"string" }, 
    {Field_Name:"Dob", Data_Type:"string" }, 
    {Field_Name:"Age", Data_Type:"string" }, 
    {Field_Name:"Address1", Data_Type:"string" }, 
    {Field_Name:"Address2", Data_Type:"string" }, 
    {Field_Name:"Address3", Data_Type:"string" }, 
    {Field_Name:"Address4", Data_Type:"string" }, 
    {Field_Name:"City", Data_Type:"string" }, 
    {Field_Name:"Nominee", Data_Type:"string" }, 
    {Field_Name:"Nominee_Rel", Data_Type:"string" }, 
    {Field_Name:"Nominee_Aadhar", Data_Type:"string" }, 
    {Field_Name:"Scheme_Name", Data_Type:"string" }, 
    {Field_Name:"Loan_Date", Data_Type:"string" }, 
    {Field_Name:"Principal", Data_Type:"number" }, 
    {Field_Name:"Loan_Status", Data_Type:"string" }, 
    {Field_Name:"Principal_Balance", Data_Type:"number" }, 
    {Field_Name:"Interest_Balance", Data_Type:"number" }, 
    {Field_Name:"Nett_Balance", Data_Type:"number" }, 
    {Field_Name:"Closing_Date", Data_Type:"string" }, 
  ]

  RemoveSignal: number = 0;

  // dataSource!: MatTableDataSource<TypeItemGroup>;  
  // columnsToDisplay: string[] = [ '#', 'Grp_Code', 'Grp_Name','Market_Rate', 'Loan_PerGram', 'Active_Status','crud'];
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;  

  ngOnInit(){
    this.LoadGroupList();    
  }

  LoadGroupList(){    
    let rep = new ClsReports(this.dataService);     
    
    rep.getLoanHistoryCustomBr().subscribe ( data => {       
      if (data.queryStatus == 0){
        this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);      
      }
      else{              
        this.HistoryList = JSON.parse(data.apiData);
        if (!this.HistoryList){
          this.HistoryList = [];
        }
        // this.LoadDataIntoMatTable();
      }
    },
    error => {
      this.globals.ShowAlert(this.globals.DialogTypeError, error);      
    });
  }

  
  

}
