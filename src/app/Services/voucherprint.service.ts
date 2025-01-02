import { Injectable } from '@angular/core';
import { TypeLoan } from '../Dashboard/Classes/ClsLoan';
import { GlobalsService } from './globals.service';
import { TypeGridItem } from '../Dashboard/Types/TypeGridItem';
import { DataService } from './data.service';
import { ToWords } from 'to-words';
import { formatDate } from '@angular/common';
import { ClsSchemes } from '../Dashboard/Classes/ClsSchemes';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';
import { AuthService } from './auth.service';
import { MatDialog } from '@angular/material/dialog';
import { SelectprintstyleComponent } from '../Dashboard/widgets/selectprintstyle/selectprintstyle.component';


@Injectable({
  providedIn: 'root'
})
@AutoUnsubscribe
export class VoucherprintService {

  constructor(private globals: GlobalsService,private dataService: DataService, private auth: AuthService, private dialog: MatDialog) {
    // const toWords = new ToWords({
    //     localeCode: 'en-IN',
    //     converterOptions: {
    //       currency: true,
    //       ignoreDecimal: false,
    //       ignoreZeroCurrency: false,
    //       doNotAddOnly: false,
    //       currencyOptions: {
    //         // can be used to override defaults for the selected locale
    //         name: 'Rupee',
    //         plural: 'Rupees',
    //         symbol: '₹',
    //         fractionalUnit: {
    //           name: 'Paisa',
    //           plural: 'Paise',
    //           symbol: '',
    //         },
    //       },
    //     },
    //   });
   }

PrintVoucher(Trans: any, VouType: number, PrintStyle: string){    
 
    let result: string[] = PrintStyle.split(";");

    if (result.length > 1){
     const dialogRef = this.dialog.open(SelectprintstyleComponent, 
        { 
          data: { result },
        });        
        dialogRef.disableClose = true;    
        dialogRef.afterClosed().subscribe(result => {        
          if (result){                        
            if (result && result.length !==0){
                this.StartPrinting(Trans, VouType, result);
            }
          }          
        }); 
    }
    else
    {
        this.StartPrinting(Trans, VouType, PrintStyle);
    }
   }

StartPrinting(Trans: any, VouType: number, PrintStyle: string){
    this.dataService.HttpGetPrintStyle(PrintStyle).subscribe(data=>{        
        let FieldSet = this.GetPrintFields(Trans,VouType);                
        let FldList = JSON.parse(data).FieldSet;        
        let Setup: TypePrintSetup = JSON.parse(data).Setup[0];        
        
        let StrHtml = '<div style="position:relative; width:100%; height:100%"; padding:0; margin:0; box-sizing: border-box;>';    
        StrHtml += this.GetHtmlFromFieldSet(FldList, FieldSet,0,0, false);

        if (Setup.PrintCopy == 1){                                              
            let FldList = JSON.parse(data).FieldSet;            
             StrHtml += this.GetHtmlFromFieldSet(FldList, FieldSet,Setup.CopyLeftMargin,Setup.CopyTopMargin, true);            
        }

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
                        }

                    </style>
                  </head>
                  <body onload="window.print();window.close()">${StrHtml}</body>
                </html>`
          );
          popupWin!.document.close();        
    });
  
}

GetHtmlFromFieldSet(FldList: [], FieldSet: TypePrintFields, LeftMargin: number, TopMargin: number, IsCopy: boolean): string{

    let StrHtml = ``;
    FldList.forEach((fld: any) => {    
        
        if ((IsCopy == true && (!fld.AvoidCopy || fld.AvoidCopy ==0))  || (IsCopy == false && (!fld.AvoidMain || fld.AvoidMain == 0) ))
        {                
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
                console.log(Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]);
                
                    let FormattedValue = (fld.decimal && fld.decimal !==0) ? (+Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]).toFixed(fld.decimal) : Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]; 
                    console.log(FormattedValue);
                    
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
                        <img style="width:100%; height:100%" src=" ` + Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]  + `" />
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

                case "numtoword":
                    const toWords = new ToWords();
                    let words = toWords.convert(Object.entries(FieldSet).find(([key, val]) => key === fld.fldvalue)?.[1]);  
                                            
                    StrHtml += `
                        <div style="position:absolute;text-wrap: wrap;width:`+ fld.width +`px; left:`+ (LeftMargin + +fld.left) + `px; top:`+ (TopMargin + +fld.top) + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                            ` +  words  + `      only
                        </div>                      
                        `;    
                    break;
                        
            }
                break;
    
            case "sub":                
                let sno = 0;
                let fldMaxLength = 0;
                
                if ((fld.fldtype == "field") && (fld.alignment) && (fld.alignment == "right") ){
                    FieldSet.ItemDetails.forEach(item=>{
                        if (Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length > fldMaxLength){
                            fldMaxLength = Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1].length;
                        }
                    });                 
                }
                
                fld.top = +fld.top + TopMargin;
                
                FieldSet.ItemDetails.forEach(item=>{                                                        
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
                            
                            //console.log( fld.fldvalue + StrEmptySpace);
                            console.log(Object.entries(item).find(([key, val]) => key === fld.fldvalue)?.[1]);
                            
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
            
            case "scheme":                
                fld.top = +fld.top + +TopMargin;
                FieldSet.SchemeDetails.forEach(sch=>{                
                    fld.top = +fld.top + fld.fontsize;        
                    //sno++;

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
                            StrHtml += `
                            <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+ +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; text-align:right " >
                                ` + (fld.prefix ? fld.prefix + `&nbsp;` : ``) + Object.entries(sch).find(([key, val]) => key === fld.fldvalue)?.[1]  + (fld.suffix ? `&nbsp;` + fld.suffix   : ``) + `
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
                    }                            
                });
            break;
            
            case "compinfo":
                switch (fld.fldvalue.toLowerCase()) {
                    case "address1":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Address1  + `
                        </div>
                        `;    
                        break;                
                    case "address2":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Address2  + `
                        </div>
                        `;    
                        break;
                    case "address3":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Address3  + `
                        </div>
                        `;    
                        break;

                    case "city":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.City  + `
                        </div>
                        `;    
                        break;

                    case "compname":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Comp_Name  + `
                        </div>
                        `;    
                        break;

                    case "email":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Email  + `
                        </div>
                        `;    
                        break;

                    case "licenseno":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.License_No  + `
                        </div>
                        `;    
                        break;

                    case "phone":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Phone  + `
                        </div>
                        `;    
                        break;

                    case "pincode":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.Pincode  + `
                        </div>
                        `;    
                        break;
                    
                    case "state":
                        StrHtml += `
                        <div style="position:absolute;left:`+ (LeftMargin + +fld.left) + `px; top:`+  +fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                            ` + this.auth.SelectedCompany.State  + `
                        </div>
                        `;    
                        break;
                }
            break;
            }           
        }
      });
    return StrHtml;
}

GetPrintFields(Trans: any, VouType: number){
    let PrintFields = this.IntializePrintFields();
    switch (VouType) {
        case this.globals.VTypLoanPayment:
            PrintFields.LoanSno = Trans.LoanSno;
            PrintFields.Loan_No = Trans.Loan_No;
            PrintFields.Loan_Date = this.globals.IntToDateString (Trans.Loan_Date);
            PrintFields.Ref_Number = Trans.Ref_No;
            PrintFields.Bar_Code = "";
            PrintFields.Scheme_Name = ''+ Trans.Scheme.Scheme_Name;
            PrintFields.Group_Name = ''+ Trans.IGroup.Grp_Name;
            PrintFields.Location_Name = ''+ Trans.Location.Loc_Name;
            PrintFields.Principal = Trans.Principal;
            PrintFields.Roi = Trans.Roi;
            PrintFields.Adv_Int_Amount = Trans.AdvIntAmt;
            PrintFields.Doc_Charges = Trans.DocChargesAmt;
            PrintFields.Nett_Payable = Trans.Nett_Payable;
            PrintFields.Mature_Date = this.globals.IntToDateString (Trans.Mature_Date);
            PrintFields.Tot_Qty = Trans.TotQty;
            PrintFields.Tot_Gross_Wt = Trans.TotGrossWt;
            PrintFields.Tot_Nett_Wt = Trans.TotNettWt;
            PrintFields.Market_Value = Trans.Market_Value;
            PrintFields.Loan_Remarks = Trans.Remarks;
            PrintFields.Loan_PerGram = Trans.IGroup.Loan_PerGram;
            PrintFields.Loan_Image = Trans.Loan_Image;
            PrintFields.ReLoan_Type = Trans.ReLoan_Type;
            
            PrintFields.PartySno = Trans.Customer.PartySno;
            PrintFields.Party_Code = Trans.Customer.Party_Code!;
            PrintFields.Party_Name = Trans.Customer.Party_Name!;
            PrintFields.Party_Rel_Caption = Trans.Customer.Rel == 0 ? 'S/o' : Trans.Customer.Rel == 1 ? 'D/o' : Trans.Customer.Rel == 2 ? 'W/o' : 'C/o' ;
            PrintFields.Party_Rel_Name = Trans.Customer.RelName!;
            PrintFields.Party_Mobile = Trans.Customer.Mobile!;
            PrintFields.Party_Address1 = Trans.Customer.Address1!;
            PrintFields.Party_Address2 = Trans.Customer.Address2!;
            PrintFields.Party_Address3 = Trans.Customer.Address3!;
            PrintFields.Party_Address4 = Trans.Customer.Address4!;
            PrintFields.Party_State = Trans.Customer.State!;
            PrintFields.Party_Pincode = Trans.Customer.Pincode!;
            PrintFields.Party_City = Trans.Customer.City!;
            PrintFields.Party_Area_Name = Trans.Customer.Area?.Area_Name!;
            PrintFields.Party_Phone =  Trans.Customer.Phone!;
            PrintFields.Party_Email = Trans.Customer.Email!;
            PrintFields.Party_Aadhar_No = Trans.Customer.Aadhar_No!;
            PrintFields.Party_Occupation = Trans.Customer.Occupation!;
            PrintFields.Party_Nominee = Trans.Customer.Nominee!;
            PrintFields.Party_Remarks = Trans.Customer.Remarks!;
            PrintFields.Party_Profile_Image = Trans.Customer.ProfileImage;

            if (Trans.Items_Json && Trans.Items_Json !==''){
                let itemList = JSON.parse(Trans.Items_Json);
                itemList.forEach((it:any)=>{
                    PrintFields.ItemDetails.push({"ItemSno": it.ItemSno, "Item_Name": it.Item.Item_Name, "Qty" : it.Qty, "Gross_Wt" : it.Gross_Wt.toFixed(3), "Nett_Wt": it.Nett_Wt.toFixed(3) , "Stone_Wt":  (it.Gross_Wt - it.Nett_Wt).toFixed(3), "Purity_Name": it.Purity.Purity_Name, "Purity": it.Purity.Purity, "Value": it.Item_Value, "Remarks" : it.Remarks});
                    PrintFields.ItemDetails_In_Line += it.Item_Name + ', ';
                    PrintFields.ItemDetails_With_Qty += it.Item_Name + '('+ it.Qty + ')' + ', ';
                })                
            }

            if (Trans.SchemeSlab_Json && Trans.SchemeSlab_Json != ''){
                let schemeList = JSON.parse(Trans.SchemeSlab_Json);
                schemeList.forEach((sch: any)=>{
                    PrintFields.SchemeDetails.push({"SchemeSno":sch.SchemeSno, "FromPeriod": sch.FromPeriod, "ToPeriod": sch.ToPeriod == 0 ? 'above' :sch.ToPeriod , "Roi": sch.Roi});
                })
            }
            
            break;
    
        case this.globals.VTypLoanReceipt:
            PrintFields.Receipt_RecSno = Trans.ReceiptSno;
            PrintFields.Receipt_Rec_No = Trans.Receipt_No;
            PrintFields.Receipt_Rec_Date = this.globals.IntToDateString (Trans.Receipt_Date);
            PrintFields.Receipt_Loan_No         = Trans.Loan.LoanSno;
            PrintFields.Receipt_Loan_No = Trans.Loan_No;
            PrintFields.Receipt_Loan_Date = this.globals.IntToDateString (Trans.Loan.Loan_Date);
            PrintFields.Receipt_Party_Code = Trans.Loan.Customer.Party_Code;
            PrintFields.Receipt_Mobile   = Trans.Loan.Customer.Mobile;
            PrintFields.Party_Rel_Caption = Trans.Loan.Customer.Rel == 0 ? 'S/o' : Trans.Loan.Customer.Rel == 1 ? 'D/o' : Trans.Loan.Customer.Rel == 2 ? 'W/o' : 'C/o' ;
            PrintFields.Party_Rel_Name = Trans.Loan.Customer.RelName!;
            PrintFields.Party_Mobile = Trans.Loan.Customer.Mobile!;
            PrintFields.Receipt_Party_Name = Trans.Loan.Customer.Party_Name;
            PrintFields.Receipt_Party_Address1 = Trans.Loan.Customer.Address1;
            PrintFields.Receipt_Party_Address2 = Trans.Loan.Customer.Address2;
            PrintFields.Receipt_Party_Address3 = Trans.Loan.Customer.Address3;
            PrintFields.Receipt_Party_Address4= Trans.Loan.Customer.Address4;
            PrintFields.Receipt_Party_State= Trans.Loan.Customer.State;
            PrintFields.Receipt_Party_Pincode= Trans.Loan.Customer.Pincode;
            PrintFields.Receipt_Party_City= Trans.Loan.Customer.City;
            PrintFields.Receipt_Party_Area_Name= Trans.Loan.Customer.Area_Name;
            PrintFields.Receipt_Party_Phone= Trans.Loan.Customer.Phone;
            PrintFields.Receipt_Party_Email= Trans.Loan.Customer.Email;
            PrintFields.Receipt_Party_Aadhar_No= Trans.Loan.Customer.Aadhar_No;
            PrintFields.Receipt_Party_Occupation= Trans.Loan.Customer.Occupation;
            PrintFields.Receipt_Party_Nominee= Trans.Loan.Customer.Nominee;
            PrintFields.Receipt_Party_Remarks= Trans.Loan.Customer.Remarks;
            PrintFields.Receipt_Party_Profile_Image= Trans.Loan.Customer.ProfileImage;
            PrintFields.ReLoan_Type = Trans.Loan.ReLoan_Type;

            PrintFields.Receipt_Principal = Trans.Rec_Principal;
            PrintFields.Receipt_Interest = Trans.Rec_Interest;
            PrintFields.Receipt_Other_Credits = Trans.Rec_Other_Credits;
            PrintFields.Receipt_Other_Debits = Trans.Rec_Other_Debits;
            PrintFields.Receipt_Default_Amt = Trans.Rec_Default_Amt;
            PrintFields.Receipt_AddLess = Trans.Rec_Add_Less;
            PrintFields.Receipt_Nett_Payable = Trans.Nett_Payable;
            PrintFields.Receipt_Remarks = Trans.Remarks;
            PrintFields.Receipt_Tot_Qty = Trans.Loan.TotQty ;

            PrintFields.Receipt_Tot_Gross_Wt = Trans.Loan.TotGrossWt;
            PrintFields.Receipt_Tot_Nett_Wt = Trans.Loan.TotNettWt;
            PrintFields.ItemDetails_In_Line = Trans.Item_Details;
            PrintFields.Party_Profile_Image = Trans.Loan.Customer.ProfileImage;
            break;

        case this.globals.VTypLoanRedemption:
            PrintFields.Receipt_RecSno          = Trans.RedemptionSno;
            PrintFields.Receipt_Rec_No          = Trans.Redemption_No;
            PrintFields.Receipt_Rec_Date        = this.globals.IntToDateString (Trans.Redemption_Date);
            PrintFields.Receipt_Loan_No         = Trans.Loan.LoanSno;
            PrintFields.Receipt_Loan_No         = Trans.Loan_No;
            PrintFields.Receipt_Loan_Date       = this.globals.IntToDateString (Trans.Loan.Loan_Date);
            PrintFields.Receipt_Party_Code      = Trans.Loan.Customer.Party_Code;
            PrintFields.Receipt_Mobile          = Trans.Loan.Customer.Mobile;
            PrintFields.Receipt_Party_Name      = Trans.Loan.Customer.Party_Name;
            PrintFields.Party_Rel_Caption       = Trans.Loan.Customer.Rel == 0 ? 'S/o' : Trans.Loan.Customer.Rel == 1 ? 'D/o' : Trans.Loan.Customer.Rel == 2 ? 'W/o' : 'C/o' ;
            PrintFields.Party_Mobile = Trans.Loan.Customer.Mobile!;
            PrintFields.Party_Rel_Name          = Trans.Loan.Customer.RelName!;
            PrintFields.Receipt_Party_Address1  = Trans.Loan.Customer.Address1;
            PrintFields.Receipt_Party_Address2  = Trans.Loan.Customer.Address2;
            PrintFields.Receipt_Party_Address3  = Trans.Loan.Customer.Address3;
            PrintFields.Receipt_Party_Address4  = Trans.Loan.Customer.Address4;
            PrintFields.Receipt_Party_State     = Trans.Loan.Customer.State;
            PrintFields.Receipt_Party_Pincode   = Trans.Loan.Customer.Pincode;
            PrintFields.Receipt_Party_City      = Trans.Loan.Customer.City;
            PrintFields.Receipt_Party_Area_Name = Trans.Loan.Customer.Area_Name;
            PrintFields.Receipt_Party_Phone     = Trans.Loan.Customer.Phone;
            PrintFields.Receipt_Party_Email     = Trans.Loan.Customer.Email;
            PrintFields.Receipt_Party_Aadhar_No = Trans.Loan.Customer.Aadhar_No;
            PrintFields.Receipt_Party_Occupation= Trans.Loan.Customer.Occupation;
            PrintFields.Receipt_Party_Nominee= Trans.Loan.Customer.Nominee;
            PrintFields.Receipt_Party_Remarks   = Trans.Loan.Customer.Remarks;
            PrintFields.Receipt_Party_Profile_Image= Trans.Loan.Customer.ProfileImage;
            PrintFields.Receipt_Principal       = Trans.Rec_Principal;
            PrintFields.Receipt_Interest        = Trans.Rec_Interest;
            PrintFields.Receipt_Other_Credits   = Trans.Rec_Other_Credits;
            PrintFields.Receipt_Other_Debits    = Trans.Rec_Other_Debits;
            PrintFields.Receipt_Default_Amt     = Trans.Rec_Default_Amt;
            PrintFields.Receipt_AddLess         = Trans.Rec_Add_Less;
            PrintFields.Receipt_Nett_Payable    = Trans.Nett_Payable;
            PrintFields.Receipt_Remarks         = Trans.Remarks;            
            PrintFields.Receipt_Tot_Qty         = Trans.Loan.TotQty;            
            PrintFields.Receipt_Tot_Gross_Wt    = Trans.Loan.TotGrossWt;
            PrintFields.Receipt_Tot_Nett_Wt     = Trans.Loan.TotNettWt;
            PrintFields.ItemDetails_In_Line     = Trans.Item_Details;
            PrintFields.ReLoan_Type             = Trans.Loan.ReLoan_Type;
            PrintFields.Party_Profile_Image     = Trans.Loan.Customer.ProfileImage;
            break;            
    }
    return PrintFields;
   }

   IntializePrintFields(){
    let PrintFields: TypePrintFields = {
        LoanSno: 0,
        Loan_No: "",
        Loan_Date: "",
        Ref_Number: "",
        Bar_Code: "",
        Scheme_Name:"",
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
        Loan_PerGram:0,
        Loan_Image: "",
        ReLoan_Type:"",

        PartySno:0,
        Party_Code: "",
        Party_Name: "",
        Party_Rel_Caption: "",
        Party_Rel_Name: "",
        Party_Mobile: "",
        Party_Address1:"",
        Party_Address2:"",
        Party_Address3:"",
        Party_Address4:"",
        Party_State:"",
        Party_Pincode:"",
        Party_City:"",
        Party_Area_Name:"",
        Party_Phone: "",
        Party_Email:"",
        Party_Aadhar_No:"",
        Party_Occupation:"",
        Party_Nominee:"",
        Party_Remarks:"",
        Party_Profile_Image: "",

        Receipt_RecSno: 0,
        Receipt_Rec_No: "",
        Receipt_Rec_Date: "",
        Receipt_LoanSno: 0,
        Receipt_Loan_No: "",
        Receipt_Loan_Date: "",
        Receipt_Party_Name:"",
        Receipt_Party_Rel_Caption: "",
        Receipt_Party_Rel_Name:  "",
        Receipt_Party_Mobile:  "",
        Receipt_Party_Address1: "",
        Receipt_Party_Address2: "",
        Receipt_Party_Address3: "",
        Receipt_Party_Address4: "",
        Receipt_Party_State: "",
        Receipt_Party_Pincode: "",
        Receipt_Party_City: "",
        Receipt_Party_Area_Name: "",
        Receipt_Party_Phone:  "",
        Receipt_Party_Email: "",
        Receipt_Party_Aadhar_No: "",
        Receipt_Party_Occupation: "",
        Receipt_Party_Nominee: "",
        Receipt_Party_Remarks: "",
        Receipt_Party_Profile_Image:  "",
        Receipt_Party_Code:"",        
        Receipt_Mobile:"",
        Receipt_Principal: 0,
        Receipt_Interest: 0,
        Receipt_Other_Credits: 0,
        Receipt_Other_Debits: 0,
        Receipt_Default_Amt: 0,
        Receipt_AddLess: 0,
        Receipt_Nett_Payable: 0,
        Receipt_Remarks: 0,

        Receipt_Tot_Qty: 0,
        Receipt_Tot_Gross_Wt: 0,
        Receipt_Tot_Nett_Wt: 0,

        ItemDetails_In_Line: "",
        ItemDetails_With_Qty: "",
        ItemDetails: [],
        SchemeDetails: [],
    }
    return PrintFields
   }
}

interface TypePrintFields {
    LoanSno: number;
    Loan_No: string;
    Loan_Date: string;
    Ref_Number: string;
    Bar_Code: string;
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
    ReLoan_Type: string;

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
    Party_Aadhar_No:string;
    Party_Occupation:string;
    Party_Nominee:string;
    Party_Remarks:string;
    Party_Profile_Image: string;

    Receipt_RecSno: number;
    Receipt_Rec_No: string;
    Receipt_Rec_Date: string;
    Receipt_LoanSno: number;
    Receipt_Loan_No: string;
    Receipt_Loan_Date: string;
    Receipt_Party_Code:string;
    Receipt_Party_Name:string;
    Receipt_Party_Rel_Caption: string;
    Receipt_Party_Rel_Name: string;
    Receipt_Party_Mobile: string;
    Receipt_Party_Address1:string;
    Receipt_Party_Address2:string;
    Receipt_Party_Address3:string;
    Receipt_Party_Address4:string;
    Receipt_Party_State:string;
    Receipt_Party_Pincode:string;
    Receipt_Party_City:string;
    Receipt_Party_Area_Name:string;
    Receipt_Party_Phone: string;
    Receipt_Party_Email:string;
    Receipt_Party_Aadhar_No:string;
    Receipt_Party_Occupation:string;
    Receipt_Party_Nominee:string;
    Receipt_Party_Remarks:string;
    Receipt_Party_Profile_Image: string;
    Receipt_Mobile:string;
    Receipt_Principal: number;
    Receipt_Interest: number;
    Receipt_Other_Credits: number;
    Receipt_Other_Debits: number;
    Receipt_Default_Amt: number;
    Receipt_AddLess: number;
    Receipt_Nett_Payable: number;
    Receipt_Remarks: number

    Receipt_Tot_Qty: number;
    Receipt_Tot_Gross_Wt: number;
    Receipt_Tot_Nett_Wt: number;
    ItemDetails_In_Line: string;
    ItemDetails_With_Qty: string;
    ItemDetails: TypeItemFields[];
    SchemeDetails: any[];    
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

interface TypePrintSetup{
    LeftMargin: number;
    TopMargin: number;
    PageWidth:number;
    PageHeight: number;
    PrintCopy: number;
    CopyLeftMargin: number;
    CopyTopMargin: number;    
}