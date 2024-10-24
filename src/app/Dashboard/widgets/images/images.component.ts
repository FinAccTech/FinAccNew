 import { Component, OnInit, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { Subscription} from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { FileHandle } from '../../Types/file-handle';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { WebcamComponent } from '../../../GlobalWidgets/webcam/webcam.component';
import { GlobalsService } from 'src/app/Services/globals.service';

export interface ImageFile {
  ImageName: string,
  ImageFile: File
}

@AutoUnsubscribe
@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})


export class ImagesComponent implements OnInit {

  TransImages: FileHandle[] = []; 
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
    if ($event.target.files)
    {
      for (var i=0; i < $event.target.files.length; i++)
      {        
        const file = $event?.target.files[i];
        if (file.type.slice(0,5) !== 'image') {
          this.globals.SnackBar("error","Only Image Files are allowed");
          return;
        }

        var reader = new FileReader();
        reader.readAsDataURL($event.target.files[i]);
        reader.onload = (event: any) => {
          const fileHandle: FileHandle ={ 
            Image_Name: file.name,
            Image_File: event.target.result, 
            Image_Url: this.sanitizer.bypassSecurityTrustUrl(
              window.URL.createObjectURL(file),              
            ),
            SrcType:0,
            DelStatus:0,
            // Favorite: false,
          };          
          
          this.TransImages.push (fileHandle);
          //this.TransImages[0].Favorite = true;
        }
      }     
    }        
  }

  // SetFavorite(img:any){
  //   for (var i=0; i < this.TransImages.length;i++){
  //     if (this.TransImages[i] == img )
  //     {
  //       this.TransImages[i].Favorite = true;
  //     }
  //     else{
  //       this.TransImages[i].Favorite = false;
  //     }
      
  //   }
  // }

  UnSetFavorite(img:any){

  }

  ClearallImages()
  {
    this.TransImages = [];    
  }

  RemoveImage(i: number){      
    if (this.TransImages[i].SrcType == 1)
    {
      this.TransImages[i].DelStatus = 1;
    }
    else
    {
      this.TransImages.splice(i,1);    
    }    
  }

  LoadImage(i: number){    
    if (this.TransImages[i].SrcType == 0)
    {
      this.SelectedImage = this.TransImages[i].Image_File;
    }
    else
    {
      this.SelectedImage = this.TransImages[i].Image_Url;
    }
   
  }

  ngOnInit(): void {
  //  this.ClearallImages();    
    this.TransImages = this.data.img;            
    this.TransImages.forEach((image) => {
      let tImg = [];
      let newData = {} as any;

      newData.image = image.Image_Name;
      newData.thumbImage = image.Image_Name;
      newData.title = image.Image_Name;      
    });
  }

  CloseDialog(): void {
    this.dialogRef.close(this.TransImages);

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
          
          result.map((img: any) =>{
            this.TransImages.push(img);
          });          
          
        }        
      });      
  } 
  reset() {
    this.uploadProgress = 0;
    this.uploadSub = new Subscription;
  }  
}
