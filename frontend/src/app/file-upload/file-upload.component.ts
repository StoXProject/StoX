import { Component, OnInit } from '@angular/core';
import { AppComponentBase } from '../AppComponentBase';
import { Injector, ElementRef } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})

export class FileUploadComponent extends AppComponentBase {

  uploadUrl: string;

  uploadedFiles: any[] = [];

  constructor(injector: Injector) {
    super(injector);
    this.uploadUrl = 'http://localhost:22742/TestAppFileUpload/UploadFile';
  }

  myUploader(event): void {
    console.log('My File upload', event);
    if (event.files.length == 0) {
      console.log('No file selected.');
      return;
    }
    var fileToUpload = event.files[0];
    let input = new FormData();
    input.append("file", fileToUpload);
    /*   this.http
         .post(this.uploadUrl, input)
         .subscribe(res => {
           console.log(res);
         });*/
  }

  // upload completed event

  onUpload(event): void {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  onBeforeSend(event): void {
    //event.xhr.setRequestHeader('Authorization', 'Bearer ' + abp.auth.getToken());
  }
}