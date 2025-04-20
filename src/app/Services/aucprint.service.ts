import { Injectable } from '@angular/core';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { TypeParties } from '../Dashboard/Classes/ClsParties';
import { TypeLoan } from '../Dashboard/Classes/ClsLoan';
import { DataService } from './data.service';
import { GlobalsService } from './globals.service';
import { AuthService } from './auth.service';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
 
@AutoUnsubscribe
export class AucprintService {

    constructor(private dataService: DataService, private globals: GlobalsService, private auth: AuthService){}

    StartPrintingAuctionNotices(AuctionList: TypeAuctionNoticeInfo[], PrintStyle: string){
                
        this.dataService.HttpGetPrintStyle(PrintStyle).subscribe(data=>{        
            // console.log(data);
            let Setup: TypePrintSetup = JSON.parse(data).Setup[0];     
            let FldList = JSON.parse(data).FieldSet;        
            let StrHtml = '<div style="position:relative; width:100%; height:100%"; padding:0; margin:0; box-sizing: border-box;>';    
            let topmargin = 0;
            AuctionList.forEach(ln=>{
                let FieldSet = this.GetPrintFields(ln);     
                StrHtml += this.GetHtmlFromAucLoan(FldList, FieldSet,0,topmargin);
                StrHtml += ' <div class="pagebreak"> </div>';
                topmargin += Setup.PageHeight;
            })
            
            StrHtml += '</div>';    

            let popupWin;    
        popupWin = window.open();
        popupWin!.document.open();
        popupWin!.document.write(`
           <html> 
                  <head>
                    <style> 
                    
                        @media print {
                            .pagebreak { page-break-before: always; } /* page-break-after works, as well */
                            
                            @page {
                                size: A4 portrait;
                                margin: 5mm; /* Adjust margins if needed */                          
                            }
                        }

                    </style>
                  </head>
                  <body onload="window.print();window.close()">${StrHtml}</body>
                </html>`
          );
          popupWin!.document.close();      
            
        });
    }


    
    GetHtmlFromAucLoan(FldList: [], AucLoan: TypePrintFields, LeftMargin: number, TopMargin: number): string{

        let StrHtml = ``;
        FldList.forEach((fld: any) => {                
            
                switch (fld.fldcat) {
                case "main":
                    switch (fld.fldtype) {
                    case "text":
                        StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; 
                            font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                                ` + fld.fldvalue  + `
                            </div>
                            `;    
                        break;
            
                    case "field":                                    
                    
                        let FormattedValue = (fld.decimal && fld.decimal !==0) ? (+Object.entries(AucLoan).find(([key, val]) => key === fld.fldvalue)?.[1]).toFixed(fld.decimal) : Object.entries(AucLoan).find(([key, val]) => key === fld.fldvalue)?.[1]; 
                        
                        if  (fld.slice) {
                            if (fld.slice > 0){
                                FormattedValue = FormattedValue.slice(0,fld.slice)
                            }
                            else if (fld.slice < 0){
                                FormattedValue = FormattedValue.slice( FormattedValue.length-Math.abs(fld.slice),FormattedValue.length)
                            }
                        }
                        
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin+ +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;" >
                            ` + (fld.prefix ? fld.prefix + `&nbsp;` : ``) + 
                            FormattedValue
                            + (fld.suffix ? `&nbsp;` + fld.suffix   : ``) + `
                        </div>
                        `;    

                        break;
            
                    case "date":
                    StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                            ` + this.globals.IntToDateString (this.globals.DateToInt (new Date())) + `
                        </div>
                        `;    
                    break;

                    case "time":
                        StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                                ` + formatDate(new Date(), 'hh:mm:ss a', 'en-IND' ) + `
                            </div>
                            `;    
                        break;

                    case "box":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                        </div>
                        `;    
                        break;
            
                    case "hline":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                        </div>
                        `;    
                        break;
        
                    case "vline":
                    StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
                        </div>
                        `;    
                    break;
        
                    case "image":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px;">
                            <img style="width:100%; height:100%" src=" ` + Object.entries(AucLoan).find(([key, val]) => key === fld.fldvalue)?.[1]  + `" />
                        </div>
                        `;    
                    break;
                    
                    case "pathimage":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; width:` + fld.width + `px; height:`+ fld.height + `px;"; >
                            <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
                        </div>
                        `;    
                    break;

                    // case "numtoword":
                    //     const toWords = new ToWords();
                    //     let words = toWords.convert(Object.entries(AucLoan).find(([key, val]) => key === fld.fldvalue)?.[1]);  
                                                
                    //     StrHtml += `
                    //         <div style="position:absolute;text-wrap: wrap;width:`+ fld.width +`px; left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                    //             ` +  words  + `      only
                    //         </div>                      
                    //         `;    
                    //     break;
                            
                }
                    break;
        
                case "sub":                
                    let sno = 0;
                    let fldMaxLength = 0;
                    
                    if ((fld.fldtype == "field") && (fld.alignment) && (fld.alignment == "right") ){
                        AucLoan.LoansList.forEach(item=>{
                            if (Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length > fldMaxLength){
                                fldMaxLength = Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length;
                            }
                        });                 
                    }
                    
                    fld.top = +fld.top + TopMargin;
                    
                    AucLoan.ItemsList.forEach(item=>{                                                        
                        fld.top = +fld.top + fld.fontsize;                                                
                        sno++;
                        
                        switch (fld.fldtype) {    
                            
                            case "Sno":
                                StrHtml += `
                                <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                    ` + sno  + `
                                </div>
                                `;    
                            break;

                            case "text":
                                StrHtml += `
                                <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                    ` + fld.fldvalue  + `
                                </div>
                                `;    
                            break;
                    
                            case "field":
                                let Emptyspace  = 0;
                                let StrEmptySpace: string = '';
                                if ((fld.alignment) && (fld.alignment == "right")){
                                    Emptyspace = fldMaxLength - Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length;                                
                                                                    
                                    for (let i=0; i<=Emptyspace*2; i++){
                                        StrEmptySpace += '&nbsp;';
                                    }
                                }                            
                                
                                let FormattedValue = (fld.decimal && fld.decimal!==0) ? (+Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1]).toFixed(fld.decimal) : Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1];
                                StrHtml += `
                                <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; text-align:right " >
                                    ` + StrEmptySpace + 
                                    FormattedValue  + `
                                </div>
                                `;    
                            break;
                    
                            case "box":
                            StrHtml += `
                                <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                                </div>
                                `;    
                            break;
                            
                            case "hline":
                                StrHtml += `
                                <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                                </div>
                                `;    
                                break;
                
                            case "vline":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
                            </div>
                            `;    
                            break;
                
                            case "image":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; ">
                                <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
                            </div>
                            `;    
                            break;
                        }            
                        
                    });
                    break;
                
                case "compinfo":                    
                    switch (fld.fldvalue.toLowerCase()) {
                        case "address1":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +(TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Address1  + `
                            </div>
                            `;    
                            break;                
                        case "address2":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Address2  + `
                            </div>
                            `;    
                            break;
                        case "address3":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Address3  + `
                            </div>
                            `;    
                            break;

                        case "city":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.City  + `
                            </div>
                            `;    
                            break;

                        case "compname":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Comp_Name  + `
                            </div>
                            `;    
                            break;

                        case "email":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Email  + `
                            </div>
                            `;    
                            break;

                        case "licenseno":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.License_No  + `
                            </div>
                            `;    
                            break;

                        case "phone":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Phone  + `
                            </div>
                            `;    
                            break;

                        case "pincode":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.Pincode  + `
                            </div>
                            `;    
                            break;
                        
                        case "state":
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                                ` + this.auth.SelectedCompany.State  + `
                            </div>
                            `;    
                            break;
                    }
                break;
                }           
            
            });
        return StrHtml;
    }

    GetPrintFields(AucLoan: TypeAuctionNoticeInfo){
        let PrintFields = this.IntializePrintFields();
        PrintFields.LoanSno  = AucLoan.Loan.LoanSno;
        PrintFields.Loan_No = AucLoan.Loan.Loan_No;
        PrintFields.Loan_Date = this.globals.IntToDateString (AucLoan.Loan.Loan_Date);
        PrintFields.Ref_Number = AucLoan.Loan.Ref_No;
        PrintFields.Bar_Code = AucLoan.Loan.LoanSno;
        PrintFields.Scheme_Name = AucLoan.Loan.Scheme.Scheme_Name!;
        PrintFields.Group_Name = AucLoan.Loan.IGroup.Grp_Name!;
        PrintFields.Location_Name = AucLoan.Loan.Location.Loc_Name!;
        PrintFields.Principal = AucLoan.Loan.Principal;
        PrintFields.Roi = AucLoan.Loan.Roi;
        PrintFields.Adv_Int_Amount = AucLoan.Loan.AdvIntAmt;
        PrintFields.Doc_Charges = AucLoan.Loan.DocChargesAmt;
        PrintFields.Nett_Payable = AucLoan.Loan.Nett_Payable;
        PrintFields.Mature_Date = this.globals.IntToDateString(AucLoan.Loan.Mature_Date);
        PrintFields.Tot_Qty = AucLoan.Loan.TotQty;
        PrintFields.Tot_Gross_Wt = AucLoan.Loan.TotGrossWt;
        PrintFields.Tot_Nett_Wt = AucLoan.Loan.TotNettWt;
        PrintFields.Market_Value = AucLoan.Loan.Market_Value;
        PrintFields.Loan_Remarks = AucLoan.Loan.Remarks;
        PrintFields.LoansList = AucLoan.LoansList;        

        if (AucLoan.Loan.Items_Json && AucLoan.Loan.Items_Json !==''){
            let itemList = JSON.parse(AucLoan.Loan.Items_Json);
            itemList.forEach((it:any)=>{
                PrintFields.ItemsList.push({"ItemSno": it.ItemSno, "Item_Name": it.Item.Item_Name, "Qty" : it.Qty, "Gross_Wt" : it.Gross_Wt.toFixed(3), "Nett_Wt": it.Nett_Wt.toFixed(3) , "Stone_Wt":  (it.Gross_Wt - it.Nett_Wt).toFixed(3), "Purity_Name": it.Purity.Purity_Name, "Purity": it.Purity.Purity, "Value": it.Item_Value, "Remarks" : it.Remarks});
                PrintFields.ItemDetails_In_Line += it.Item.Item_Name + ', ';
                PrintFields.ItemDetails_With_Qty += it.Item.Item_Name + '('+ it.Qty + ')' + ', ';
            })                
        }

        PrintFields.PartySno = AucLoan.Customer.PartySno;
        PrintFields.Party_Code = AucLoan.Customer.Party_Code!;
        PrintFields.Party_Name = AucLoan.Customer.Party_Name!;
        PrintFields.Party_Rel_Caption = AucLoan.Customer.Rel == 0 ? 'S/o' : AucLoan.Customer.Rel == 1 ? 'D/o' : AucLoan.Customer.Rel == 2 ? 'W/o' : 'C/o';
        PrintFields.Party_Rel_Name = AucLoan.Customer.RelName!;
        PrintFields.Party_Mobile = AucLoan.Customer.Mobile!;
        PrintFields.Party_Address1 = AucLoan.Customer.Address1!;
        PrintFields.Party_Address2 = AucLoan.Customer.Address2!;
        PrintFields.Party_Address3 = AucLoan.Customer.Address3!;
        PrintFields.Party_Address4 = AucLoan.Customer.Address4!;
        PrintFields.Party_State = AucLoan.Customer.State!;
        PrintFields.Party_Pincode = AucLoan.Customer.Pincode!;
        PrintFields.Party_City = AucLoan.Customer.City!;
        PrintFields.Party_Area_Name = AucLoan.Customer.Area?.Area_Name!;
        PrintFields.Party_Phone = AucLoan.Customer.Phone!;
        PrintFields.Party_Email = AucLoan.Customer.Email!;
        PrintFields.Party_Dob = AucLoan.Customer.Dob!.toString();
        PrintFields.Party_Aadhar_No = AucLoan.Customer.Aadhar_No!;
        PrintFields.Party_Nominee = AucLoan.Customer.Nominee!;
        PrintFields.Party_Remarks = AucLoan.Customer.Remarks!;
        PrintFields.Party_Profile_Image = AucLoan.Customer.ProfileImage!;
        return PrintFields;
    }    

    IntializePrintFields(){
        let PrintFields: TypePrintFields = {
            PartySno: 0,
            Party_Code: "",
            Party_Name: "",
            Party_Rel_Caption: "",
            Party_Rel_Name: "",
            Party_Mobile: "",
            Party_Address1: "",
            Party_Address2: "",
            Party_Address3: "",
            Party_Address4: "",
            Party_State: "",
            Party_Pincode: "",
            Party_City: "",
            Party_Area_Name: "",
            Party_Phone: "",
            Party_Email: "",
            Party_Dob: "",
            Party_Aadhar_No: "",
            Party_Nominee: "",
            Party_Remarks: "",
            Party_Profile_Image: "",

            LoanSno: 0,
            Loan_No: "",
            Loan_Date: "",
            Ref_Number: "",
            Bar_Code: 0,
            Scheme_Name: "",
            Group_Name: "",
            Location_Name: "",
            Principal: 0,
            Roi: 0,
            Adv_Int_Amount: 0,
            Doc_Charges: 0,
            Nett_Payable: 0,
            Mature_Date: "",
            Tot_Qty: 0,
            Tot_Gross_Wt: 0,
            Tot_Nett_Wt: 0,
            Market_Value: 0,
            Loan_Remarks: "",
            LoansList: [],
            Loan_PerGram: 0,
            Loan_Image: '',
            ItemsList: [],
            ItemDetails_In_Line: "",
            ItemDetails_With_Qty: "",            
        }
        return PrintFields
    }
}

interface TypePrintFields {
    PartySno: number;
    Party_Code: string;
    Party_Name: string;
    Party_Rel_Caption: string;
    Party_Rel_Name: string;
    Party_Mobile: string;
    Party_Address1:string;
    Party_Address2:string;
    Party_Address3:string;
    Party_Address4:string;
    Party_State:string;
    Party_Pincode:string;
    Party_City:string;
    Party_Area_Name:string;
    Party_Phone: string;
    Party_Email:string;
    Party_Dob: string;
    Party_Aadhar_No:string;    
    Party_Nominee:string;
    Party_Remarks:string;
    Party_Profile_Image: string;
   
    LoanSno: number;
    Loan_No: string;
    Loan_Date: string;
    Ref_Number: string;
    Bar_Code: number;
    Scheme_Name:string;
    Group_Name: string;
    Location_Name: string;
    Principal: number;
    Roi: number;
    Adv_Int_Amount: number;
    Doc_Charges: number;
    Nett_Payable: number;
    Mature_Date: string;
    Tot_Qty: number;
    Tot_Gross_Wt: number;
    Tot_Nett_Wt: number;
    Market_Value: number;
    Loan_Remarks: string;
    Loan_PerGram: number;
    Loan_Image: string;

    LoansList: TypeLoan[];

    ItemsList: TypeItemFields[];
    ItemDetails_In_Line: string;
    ItemDetails_With_Qty: string;
    
}


export interface TypeAuctionNoticeInfo{
    Customer: TypeParties;
    Loan: TypeLoan;
    LoansList: TypeLoan[];
    Auction_DueDate: string;
}

interface TypePrintSetup{
    LeftMargin: number;
    TopMargin: number;
    PageWidth:number;
    PageHeight: number;
    PrintCopy: number;
    CopyLeftMargin: number;
    CopyTopMargin: number;    
}

interface TypeItemFields {
    ItemSno: number;
    Item_Name: string;
    Qty: number;
    Gross_Wt: string;
    Nett_Wt: string;
    Stone_Wt: string;
    Purity_Name: string;
    Purity: number;
    Value: string;
    Remarks: string;
}