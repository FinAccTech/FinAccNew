import { Component } from '@angular/core';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { DataService } from 'src/app/Services/data.service';

@Component({
  selector: 'app-printsetup',
  templateUrl: './printsetup.component.html',
  styleUrls: ['./printsetup.component.scss']
})

@AutoUnsubscribe
export class PrintsetupComponent {

  constructor(private dataService: DataService) {}

  StyleName: string = "";
  tempJson:string = "";
  UploadError: string = "";
  SelectedStyle: string = "";

  FilesList: any[] = [];
  jsoncontent: string = `[
    {
        "fldtype": "text",
        "fldvalue": "GOLD",
        "left": 100,
        "top": 200,
        "fontname": "Arial",
        "fontsize": 12,
        "fontbold": true,
        "alignment": "left", 
        "height" :100,
        "width": 500      
    },
    {
        "fldtype": "text",
        "fldvalue": "GOLD",
        "left": 100,
        "top": 200,
        "fontname": "Arial",
        "fontsize": 12,
        "fontbold": true,
        "alignment": "left",
        "height" :100,
        "width": 500
    }
]`;

  
   data: string = "";

   ngOnInit(){   
    this.LoadStylesfromServer();
   }

   LoadStylesfromServer(){
    this.dataService.HttpgetFileList(this.StyleName, this.jsoncontent).subscribe(data=>{
      this.FilesList = data;
    })
   }       

   LoadPreview(){
    let FldList = JSON.parse(this.jsoncontent);
    let StrHtml = '<div style="position:relative; width:100%; height:100%"; padding:0; margin:0; box-sizing: border-box;>';

    FldList.forEach((fld: any) => {      
      switch (fld.fldcat) {
        case "main":
          switch (fld.fldtype) {
            case "text":
                StrHtml += `
                  <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                      ` + fld.fldvalue  + `
                  </div>
                  `;    
              break;
    
            case "field":
                StrHtml += `
                  <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                      ` + fld.fldvalue  + `
                  </div>
                  `;    
              break;
    
            case "box":
              StrHtml += `
                <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                </div>
                `;    
              break;
    
            case "hline":
              StrHtml += `
                <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                </div>
                `;    
              break;

            case "vline":
            StrHtml += `
              <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
              </div>
              `;    
            break;

            case "image":
              StrHtml += `
              <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px;">
                  <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
              </div>
              `;    
            break;
          }
          break;

        case "sub":
          switch (fld.fldtype) {
            case "text":
                StrHtml += `
                  <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `;  " >
                      ` + fld.fldvalue  + `
                  </div>
                  `;    
              break;
    
            case "field":
                StrHtml += `
                  <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; font-family:` + fld.fontname + `; font-size:`+ fld.fontsize + `px; font-weight:`+ fld.fontweight + `; color:`+ fld.forecolor + `; " >
                      ` + fld.fldvalue  + `
                  </div>
                  `;    
              break;
    
            case "box":
              StrHtml += `
                <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border:1px solid "`+ fld.forecolor +`; >                
                </div>
                `;    
              break;
              
            case "hline":
                StrHtml += `
                  <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-top:1px solid "`+ fld.forecolor +`; >                
                  </div>
                  `;    
                break;

            case "vline":
            StrHtml += `
              <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; border-left:1px solid "`+ fld.forecolor +`; >                
              </div>
              `;    
            break;

            case "image":
              StrHtml += `
              <div style="position:absolute;left:`+ fld.left + `px; top:`+ fld.top + `px; width:` + fld.width + `px; height:`+ fld.height + `px; >
                  <img style="width:100%; height:100%" src=" ` + fld.fldvalue + `" />
              </div>
              `;    
            break;
          }
          break;
      }
      
    });

    StrHtml += '</div>';
    
    let popupWin;
    
    popupWin = window.open();
    popupWin!.document.open();
    popupWin!.document.write(`
       <html>
              <head>
              </head>
              <body onload="window.print();window.close()">${StrHtml}</body>
            </html>`
      );
      popupWin!.document.close();
    
   }

   InsertField(){
    let str = `
      {
        "fldtype": "text",
        "fldcat": "main",
        "fldvalue": "GOLD",
        "left": 100,
        "top": 200,
        "fontname": "Arial",
        "fontweight": 400,
        "fontsize": 12        
    }
    `;
    this.patchValue(str);
   }

   InsertBox(){
    let str = `
      {
          "fldtype": "box",
          "fldcat": "main",
          "left": 100,
          "top": 200,
          "forecolor":"#ddd",
          "height" :100,
          "width": 500
      }`;
      this.patchValue(str);
   }

   InsertImage(){
    let str = `
      {
          "fldtype": "image",
          "fldcat": "main",
          "left": 100,
          "top": 200,          
          "height" :100,
          "width": 500,
          "fldvalue": ""
      }`;
      this.patchValue(str);
   }

   CopyText(inputElement: any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }
  
  CreateNewStyle()
  {
    this.dataService.HttpSavePrintStyle(this.StyleName, this.jsoncontent,"new").subscribe(data=>{
      alert (data);    
      this.LoadStylesfromServer();
    })
  }


  SavetoServer()
  {
    this.dataService.HttpSavePrintStyle(this.StyleName, this.jsoncontent,"append").subscribe(data=>{
      alert (data);    
      this.LoadStylesfromServer();
    })
  }

  LoadPrintStyle(stylename:string){
    this.dataService.HttpGetPrintStyle(stylename).subscribe(data=>{
      this.jsoncontent = data;
      this.StyleName = stylename;
      this.SelectedStyle = stylename;
    })
  }

   getCursor() {
    let cursor = document.getElementById('jsoncontent') as HTMLTextAreaElement;
    let start = cursor.selectionStart;
    let end = cursor.selectionEnd;
    return [start, end];
  }

  patchValue(patchvalue: string) {
    let element = document.getElementById('jsoncontent') as HTMLTextAreaElement;
    let elevalue = element.value;
    let patchelement = document.getElementById('jsoncontent') as HTMLInputElement;    
    let cursor = this.getCursor();
    let patchedValue = elevalue.substr(0, cursor[0]) + patchvalue+ elevalue.substr(cursor[1]);
    patchelement.value = patchedValue;
  }

}
