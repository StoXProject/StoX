import { Injectable } from '@angular/core';
import { PropertyItem } from '../../data/propertyitem';
import { PropertyCategory } from '../../data/propertycategory';
import { BehaviorSubject } from 'rxjs';
import { FilePath } from '../../data/FilePath';

@Injectable({
    providedIn: 'root'
  })
  export class FilePathDlgService { 
    public display: boolean = false;

    public paths: FilePath [] = [];
    // private pathDataSource = new BehaviorSubject(this.paths);
    // pathDataObservable = this.pathDataSource.asObservable();    

    public currentPropertyItem: PropertyItem = null;
    public currentPropertyCategory: PropertyCategory = null;

    combinedPaths(): string[] {
      let combined: string[] = [];
      for(let i=0; i<this.paths.length; i++) {
        combined.push(this.paths[i].path);
      }
        
      return combined;
    }

    async showDialog() {
        // parse currentPropertyItem and populate array paths and broadcast this to component

        console.log("currentPropertyItem.value : " + this.currentPropertyItem.value);

        this.display = true;
    }
  }