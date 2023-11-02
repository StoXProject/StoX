import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FilePath } from '../../data/FilePath';
import { PropertyCategory } from '../../data/propertycategory';
import { PropertyItem } from '../../data/propertyitem';

@Injectable()
export class FilePathDlgService {
  public display: boolean = false;

  public paths: FilePath[] = [];
  private pathDataSource = new BehaviorSubject(this.paths);
  pathDataObservable = this.pathDataSource.asObservable();

  public currentPropertyItem: PropertyItem = null;
  public currentPropertyCategory: PropertyCategory = null;

  combinedPaths(): string[] {
    const combined: string[] = [];

    for (let i = 0; i < this.paths.length; i++) {
      combined.push(this.paths[i].path);
    }

    return combined;
  }
  obj2FilePath(o: any): FilePath {
    return <FilePath>{ path: typeof o == 'string' ? o : JSON.stringify(o) };
  }
  async showDialog() {
    // parse currentPropertyItem and populate array paths and broadcast this to component
    console.log('> ' + 'currentPropertyItem.value : ' + this.currentPropertyItem.value);

    const o: any = JSON.parse(this.currentPropertyItem.value);

    // The propertyItem is an array, map each element to FilePath
    // Enhanced: Otherwise map propertyItem to FilePath? The user may enter a path manually without []
    this.paths = Array.isArray(o) ? o.map(s => this.obj2FilePath(s)) : [this.obj2FilePath(o)];
    this.pathDataSource.next(this.paths);
    this.display = true;
  }
}
