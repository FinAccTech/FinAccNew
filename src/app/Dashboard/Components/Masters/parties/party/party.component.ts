import { _isNumberValue } from '@angular/cdk/coercion';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { ClsAreas, TypeArea } from 'src/app/Dashboard/Classes/ClsAreas';
import { ClsParties, TypeParties } from 'src/app/Dashboard/Classes/ClsParties';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';
import { ImagesComponent } from 'src/app/Dashboard/widgets/images/images.component';
import { OtpwindowComponent } from 'src/app/Dashboard/widgets/otpwindow/otpwindow.component';
import { WebcamComponent } from 'src/app/GlobalWidgets/webcam/webcam.component';
import { AlertsService } from 'src/app/Services/alerts.service';
import { ApiDataService } from 'src/app/Services/api-data.service';
import { AuthService } from 'src/app/Services/auth.service';
import { DataService } from 'src/app/Services/data.service';
import { GlobalsService } from 'src/app/Services/globals.service';
import { ImageUploadtoServerService } from 'src/app/Services/image-uploadto-server.service';
import { ProgressbroadcastService } from 'src/app/Services/progressbroadcast.service';

@Component({
  selector: 'app-party',
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.scss']
})

@AutoUnsubscribe
export class PartyComponent implements OnInit {
    
  Party!:         TypeParties;  
  PartyCaption:   string = "";  
  AreasList!:      TypeArea[];
  SelectedArea!:     TypeArea;
  
  TransImages: FileHandle[] = [];

  // For Validations  
  CodeAutoGen: boolean = false;
  PartyNameValid: boolean = true;
  MobNumberValid: boolean = true;
  AreaNameValid: boolean = true;
  SaveImageasFile: boolean = false;


  constructor(
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<PartyComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: TypeParties,    
    private dataService: DataService,    
    private globals: GlobalsService,
    private progressService: ProgressbroadcastService,
    private auth: AuthService,
    private apidataService: ApiDataService,
    private imgUpload: ImageUploadtoServerService,
    private alertService: AlertsService
  ) 
  {
    this.Party = data;      
    this.Party.ClientSno = this.auth.LoggedClient.ClientSno;
    this.Party.CommMasters = this.auth.SelectedCompany.CommMasters;
    this.SelectedArea = this.data.Area!;    
    // this.dialogRef.updateSize("30vw");        
  }

  ngOnInit(): void {        
    switch ( parseInt (this.Party.Party_Cat!.toString())) {
      case 1:
        this.PartyCaption = "Customers";
        break;
      case 2:
        this.PartyCaption = "Suppliers";
        break;
      case 3:
          this.PartyCaption = "Borrowers";
          break;
    }    
    
    let AutoGenType = 0;

      switch ( +this.Party.Party_Cat!) {
        case this.globals.PartyTypCustomers:                          
        AutoGenType = this.globals.AppSetup()[0].PartyCode_AutoGen;
        break;

        case this.globals.PartyTypSuppliers:
          AutoGenType = this.globals.AppSetup()[0].SuppCode_AutoGen;
        break;
        
        case this.globals.PartyTypBorrowers:
          AutoGenType = this.globals.AppSetup()[0].BwrCode_AutoGen;
        break;        
      }

      if (AutoGenType == 1){
        this.CodeAutoGen = true;        
        if (this.Party.PartySno == 0){         
          let it = new ClsParties(this.dataService)
          it.getPartyCode(this.Party.Party_Cat!).subscribe(data => {
            this.Party.Party_Code = data.apiData;
          })
        }
      }
       
    

    let ar = new ClsAreas(this.dataService);
    ar.getAreas(0).subscribe(data => {      
      this.AreasList = JSON.parse (data.apiData);   
      if (this.Party.PartySno == 0){
        this.SelectedArea = this.AreasList[0];
        this.Party.Area = this.SelectedArea;    
      }      
    });    


    this.SaveImageasFile  = this.globals.AppSetup()[0].ImageUpload_ByFile == 1 ? true : false;

    if (this.Party.PartySno == 0){
      // const fileHandle: FileHandle ={
      //   Image_Name: "noimage.jpg",
      //   Image_File: null!,  
      //   Image_Url: 'assets/images/noimage.jpg',
      //   SrcType:1, 
      //   DelStatus:0
      // };          
      // this.TransImages[0] = (fileHandle);
      
      this.TransImages = [];
    }
    else{
      let pty = new ClsParties(this.dataService);
      pty.getPartyImages(this.Party.PartySno).subscribe(data =>{             
        this.TransImages = JSON.parse (data.apiData);  
        this.Party.fileSource =  JSON.parse (data.apiData);          
      })
    }
  }

  SaveParty(){        
    if (this.ValidateInputs() == false) {return};    
    
    var StrImageXml: string = "";

    StrImageXml = "<ROOT>"
    StrImageXml += "<Images>"
    
    for (var i=0; i < this.TransImages.length; i++)
    {
      if (this.TransImages[i].DelStatus == 0)
      {
        StrImageXml += "<Image_Details ";
        StrImageXml += " Image_Name='" + this.TransImages[i].Image_Name + "' ";                 
        StrImageXml += " Image_Url='" + this.auth.getPartyImagesServerPath() + "' ";             
        StrImageXml += " >";
        StrImageXml += "</Image_Details>";
      }       
    }   

    StrImageXml += "</Images>" 
    StrImageXml += "</ROOT>"
    
    let pty = new ClsParties(this.dataService);
    pty.Party = this.Party;    
    pty.Party.BranchSno = this.auth.SelectedBranchSno();
    pty.Party.ImageDetailXML = StrImageXml;

    if (this.SaveImageasFile == false) { 
        pty.Party.fileSource = this.TransImages;
    }
    
    this.progressService.sendUpdate("start","Saving Party");
    
    pty.saveParty().subscribe(data => {      
      
      this.progressService.sendUpdate("stop","");

        if (data.queryStatus == 0) {
          this.globals.ShowAlert(this.globals.DialogTypeError,data.apiData);
          return;
        }
        else{          
          pty.Party.PartySno = data.RetSno;
          pty.Party.Name = pty.Party.Party_Name;
          pty.Party.Details = 'Code: ' + pty.Party.Party_Code;

          if (this.SaveImageasFile == true) {     
            // let ImageFiles: File[] = [];
            // this.TransImages.forEach(img=>{
            //   ImageFiles.push(img.Image_FilesBlob);
            // })
            this.imgUpload.UploadImages(this.TransImages, "Parties", pty.Party.Party_Code!);
          }

          this.globals.SnackBar("info", this.Party.PartySno == 0 ? "Party Created successfully" : "Party updated successfully");          

          const OtpVerification = this.globals.AppSetup()[0].Enable_OtpVerification;
          if (OtpVerification == 1)
          {
            const VerifyCode = this.globals.GenerateFourDigitRandom();
            this.alertService.CreateOTPVerificationAlert(this.globals.AlertTypeOtpValidation, pty.Party, VerifyCode);
            const dialogRef = this.dialog.open(OtpwindowComponent, 
            {              
              data: VerifyCode,
            });      
            dialogRef.disableClose = true; 
            dialogRef.afterClosed().subscribe(result => {        
              
              if (result) 
              { 
                if (+result == +VerifyCode){
                  pty.UpdateVerifyStatus(pty.Party.PartySno).subscribe(data=>{
                    if (data.queryStatus == 0){
                      this.globals.ShowAlert(3,data.apiData);                      
                    }
                    else{
                        this.globals.SnackBar("info", "Customer Verified Successfully");
                    }                    
                  })                  
                } 
              }        
            });    
          }
          //this.apidataService.fetchData("2");
          this.CloseDialog(pty.Party);
        }
    },  
    error => {
      this.progressService.sendUpdate("stop","");
      this.globals.ShowAlert(this.globals.DialogTypeError, error);
    }
    )
  }

  VerifyNow(){
    
    const OtpVerification = this.globals.AppSetup()[0].Enable_OtpVerification;    
        
    if (this.Party.Verify_Status || OtpVerification === 0) {
      return;
    }

    const VerifyCode = this.globals.GenerateFourDigitRandom();
    this.alertService.CreateOTPVerificationAlert(this.globals.AlertTypeOtpValidation, this.Party, VerifyCode);
    const dialogRef = this.dialog.open(OtpwindowComponent, 
    {              
      data: VerifyCode,
    });      
    dialogRef.disableClose = true; 
    dialogRef.afterClosed().subscribe(result => {        
      
      if (result) 
      { 
        if (+result == +VerifyCode){
          let pty = new ClsParties(this.dataService);
          pty.UpdateVerifyStatus(this.Party.PartySno).subscribe(data=>{
            if (data.queryStatus == 0){
              this.globals.ShowAlert(3,data.apiData);                      
            }
            else{
              this.Party.Verify_Status =1;
                this.globals.SnackBar("info", "Customer Verified Successfully");
            }                    
          })                  
        } 
      }        
    });   

  }

  DeleteParty(){
    if (this.Party.PartySno == 0){
      this.globals.SnackBar("error", "No Party selected to delete");
      return;
    }
    this.globals.QuestionAlert("Are you sure you wanto to delete this Party?").subscribe(Response => {      
      if (Response == 1){
        let ar = new ClsParties(this.dataService);
        ar.Party = this.Party;
        ar.deleteParty().subscribe(data => {
          if (data.queryStatus == 0)
          {
            this.globals.ShowAlert(this.globals.DialogTypeError, data.apiData);
            return;
          }
          else{
            this.globals.SnackBar("info", "Party deleted successfully");
            this.CloseDialog(ar.Party);
          }
        })        
      }
    })
  }

  CloseDialog(pty: TypeParties)  {
    this.dialogRef.close(pty);
  }

  DateToInt($event: any): number{        
    return this.globals.DateToInt( new Date ($event.target.value));
  }
  

  ValidateInputs(): boolean{            
    if (!this.Party.Party_Name!.length )  { this.PartyNameValid = false;  return false; }  else  {this.PartyNameValid = true; }      

    if (this.globals.AppSetup()[0].MobileNumberMandatory == 1){
      if (this.Party.Mobile!.length < 10)  { this.MobNumberValid = false;  return false; }  else  {this.MobNumberValid = true; }     
    }    

    if (!this.Party.Area || this.Party.Area.AreaSno ==0 ) {
      this.AreaNameValid    = false; 
      return false;
    }
    else{
      this.AreaNameValid = true;
    }
    return true;
  }
  
  getNewArea($event: TypeArea){
    if ($event){      
      this.AreasList.push($event)    
      this.getArea($event);
    }     
  }

  getArea($event: TypeArea){
    this.SelectedArea = $event;
    this.Party.Area = this.SelectedArea;    
  }

  OpenWebCam(){        
    const dialogRef = this.dialog.open(WebcamComponent, 
      {
        // width:"45vw",
        // height:"100vh",
        // position:{"right":"0","top":"0" },
        data: "",
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
            this.TransImages = result;
        }        
      });      
  } 

  OpenImagesCreation(){
    var img = this.TransImages; 

    const dialogRef = this.dialog.open(ImagesComponent, 
      {         
        width:'50vw',
        data: {img},
      });
      
      dialogRef.disableClose = true;

      dialogRef.afterClosed().subscribe(result => {        
        if (result){
          this.TransImages = result;
        }

        
        // this.urls = [];
        // this.urls.push  (result);     
        // console.log (this.urls);
        //this.imagesCount = result.length;   
      }); 
  }

  SetFavorite() {
    this.Party.IsFavorite = !this.Party.IsFavorite;  
  }

  BlackList(){
    this.globals.QuestionAlert("Are you sure you wanto to Blacklist this Party?").subscribe(Response => {      
      if (Response == 1){
        this.Party.BlackListed = true;
        this.SaveParty();        
      }
    })
  }

  selectFile($event: any)
  {     
    const fileInput = $event.target as HTMLInputElement;
    if (fileInput.files)
    {
      // for (var i=0; i < $event.target.files.length; i++)
      // {
        const file = fileInput.files[0];        
        if (file.type.slice(0,5) !== 'image') {
          this.globals.SnackBar("error","Only Image Files are allowed");
          return;
        }
        
        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[0]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={
            Image_Name: file.name.substring(0,6) + "_" + this.globals.getRandomCharacters() + ".jpeg",
            Image_File: event.target.result, 
            Image_FilesBlob: file,
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0
          };          
          this.TransImages[0] = (fileHandle);
          //console.log (this.TransImages);          
        }
      // }        
    }        
  }

  RemoveProfileImage(){  
    this.TransImages[0].Image_File = null!;
    this.TransImages[0].Image_Url = ""; 
    this.TransImages[0].SrcType = 2;
  }
  
}
