import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { FileHandle } from 'src/app/Dashboard/Types/file-handle';

@Component({
  selector: 'app-webcam',
  templateUrl: './webcam.component.html',
  styleUrls: ['./webcam.component.scss']
})

@AutoUnsubscribe
export class WebcamComponent  implements AfterViewInit {

  constructor(private sanitizer: DomSanitizer, public dialogRef: MatDialogRef<WebcamComponent>, @Inject(MAT_DIALOG_DATA) public data: FileHandle,    ){

  }

  TransImages: FileHandle[] = [];
  WIDTH = 640;
  HEIGHT = 480;

  @ViewChild("video")
  public video!: ElementRef;

  @ViewChild("canvas")
  public canvas!: ElementRef;

  capturedImages: string[] = [];
  error: any;
  isCaptured: boolean = false;

  async ngAfterViewInit() {
    await this.setupDevices();
  }

  async setupDevices() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        if (stream) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();
          this.error = null;
        } else {
          this.error = "You have no output video device";
        }
      } catch (e) {
        this.error = e;
      }
    }
  }

  capture() {
    this.drawImageToCanvas(this.video.nativeElement);
    this.capturedImages.push(this.canvas.nativeElement.toDataURL("image/png"));

    const fileHandle: FileHandle ={ 
      Image_Name: "WebCam1",
      Image_File: this.canvas.nativeElement.toDataURL("image/png"), 
      Image_Url: "",
      SrcType:0,
      DelStatus:0,
      //Favorite: false,
    };          
    this.TransImages.push (fileHandle);
  //  this.isCaptured = true;
  }

  removeCurrent() {
    this.isCaptured = false;
  }

  setPhoto(idx: number) {
    this.isCaptured = true;
    var image = new Image();
    image.src = this.capturedImages[idx];
    this.drawImageToCanvas(image);
  }

  drawImageToCanvas(image: any) {
    this.canvas.nativeElement
      .getContext("2d")
      .drawImage(image, 0, 0, this.WIDTH, this.HEIGHT);
  }

  Save(){
    this.CloseDialog();
  }

  CloseDialog()  {
    this.dialogRef.close(this.TransImages); 
  }
}
