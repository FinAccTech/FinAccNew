import { Component, OnInit, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import { Subscription} from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';

import { CommonModule } from '@angular/common';
import { FileHandle } from '../../Types/file-handle';
import { GlobalsService } from 'src/app/Services/globals.service';
// import { WebcamComponent } from 'ngx-webcam';
import { WebcamComponent } from '../../../GlobalWidgets/webcam/webcam.component';


export interface ImageFile {
  ImageName: string,
  ImageFile: File
}

@AutoUnsubscribe
@Component({
    selector: 'app-images',    
    templateUrl: './images.component.html',
    styleUrls: ['./images.component.scss'],    
})

export class ImagesComponent implements OnInit {

  ImageSource: FileHandle[] = []; 
  imageObject: any [] = [] ;

  uploadProgress:number = 0;
  uploadSub: Subscription = new Subscription;
  TotalFileSize: number = 0;

  SelectedImage: any; 
    
  constructor(
    private sanitizer: DomSanitizer,    
    public dialogRef: MatDialogRef<ImagesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,        
    public dialog: MatDialog,
    private globals: GlobalsService
  ) {}

     
  selectFiles($event: any)
  { 
    let largefileSelected: boolean = false;
    const fileInput = $event.target as HTMLInputElement;
    if (fileInput.files)
    {
      for (var i=0; i < fileInput.files.length; i++)
      {        
        const file = fileInput.files[i];
        if (file.size < 1000000) {                  
          var reader = new FileReader();
          reader.readAsDataURL($event.target.files[i]);
          reader.onload = (event: any) => {
            const fileHandle: FileHandle ={ 
              Image_Name: file.name.substring(0,6) + "_" + this.globals.getRandomCharacters() + ".jpeg",
              Image_File: event.target.result, 
              Image_FilesBlob: file,
              Image_Url: this.sanitizer.bypassSecurityTrustUrl(
                window.URL.createObjectURL(file),              
              ),
              SrcType:0,
              DelStatus:0,            
            };          
            this.ImageSource.push (fileHandle);          
          }
        }
        else{
          this.globals.SnackBar("error", "Files greater than 1MB are not allowed. Larger files are ignored") ;
        }
      }     
    }        
  }

  
  ClearallImages()
  {
    this.ImageSource = [];    
  }

  RemoveImage(i: number){      
    if (this.ImageSource[i].SrcType == 1)
    {
      this.ImageSource[i].DelStatus = 1;
    }
    else
    {
      this.ImageSource.splice(i,1);    
    }    
  }

  LoadImage(i: number){    
    if (this.ImageSource[i].SrcType == 0)
    {
      this.SelectedImage = this.ImageSource[i].Image_File;
    }
    else
    {
      this.SelectedImage = this.ImageSource[i].Image_Url;
    }
   
  }

  ngOnInit(): void {  
    this.ImageSource = this.data.img;          
    if (this.ImageSource){
      this.ImageSource.forEach((image) => {
        let tImg = [];
        let newData = {} as any;

        newData.image = image.Image_Name;
        newData.thumbImage = image.Image_Name;
        newData.title = image.Image_Name;      
      });
    }
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
          result.forEach((img: FileHandle)=>{
            this.ImageSource.push(img);
          })
          //this.ImageSource.push(result[0])
        }        
        
      });      
  } 




  CloseDialog(): void {
    this.dialogRef.close(this.ImageSource);

    // this.http.post('http://184.168.125.210/CheersApp/data/upload.php', this.myForm.value)
    // .subscribe(res => {
    //   console.log(res);
    //   alert('Uploaded Successfully.');
    // })
    // console.log (this.TotalFileSize);

    // const upload$ = this.http.post("http://184.168.125.210/CheersApp/data/upload.php", this.myForm.value, {
    //   reportProgress: true,
    //   observe: 'events'
    //   })
    //   .pipe(
    //       finalize(() => this.reset())
    //   );

    //   this.uploadSub = upload$.subscribe(event => {
    //     if (event.type == HttpEventType.UploadProgress) {
    //       this.uploadProgress = Math.round(100 * (event.loaded / this.TotalFileSize ));
    //       console.log (event.loaded);
    //     }
    //   })
  }

  reset() {
    this.uploadProgress = 0;
    this.uploadSub = new Subscription;
  }  
}
