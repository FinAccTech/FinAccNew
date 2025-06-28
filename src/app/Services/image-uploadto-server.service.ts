import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProgressbroadcastService } from './progressbroadcast.service';
import { FileHandle } from '../Dashboard/Types/file-handle';


@Injectable({
  providedIn: 'root'
})
export class ImageUploadtoServerService {

  constructor(private http: HttpClient, private progressService: ProgressbroadcastService) {}

  uploadUrl: string = "https://www.finaccsaas.com/data/UploadImages.php";
  PennyuploadUrl: string = "https://www.pennygold.in/data/Images/44/1/UploadImages.php";

  UploadImages(ImageFiles: FileHandle[], ImageType: string, FolderName: string): void {
    this.progressService.sendUpdate("start","Saving Images");    

    if (ImageFiles.length === 0) return;

    const ImagePath: string = this.PennyuploadUrl;

    const formData = new FormData();
    ImageFiles.forEach((file, index) => {      
      formData.append('files[]', file.Image_FilesBlob, file.Image_Name );
    });

    
    formData.append('ImageType', ImageType);
    formData.append('FolderName', FolderName);

    this.http.post(ImagePath, formData).subscribe(data=>{
      console.log(data);
      
      this.progressService.sendUpdate("stop","Saving Images");
    })
  }

}
