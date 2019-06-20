import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ProjectComponent } from './project/project.component';
import { MapComponent } from './map/map.component';
import { FormsModule } from '@angular/forms';
import { ProcessComponent } from './process/process.component';
import { TabViewModule } from 'primeng/primeng';
import { ListboxModule} from 'primeng/listbox';
import { ToolbarModule} from 'primeng/toolbar';
import { AngularSplitModule } from 'angular-split';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { ParameterComponent } from './parameter/parameter.component';
//import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';

import { HttpClientModule }    from '@angular/common/http';

import {AccordionModule} from 'primeng/accordion';
import {CheckboxModule} from 'primeng/checkbox';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/components/table/table';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService }  from './in-memory-data.service';
import { ContextMenuModule } from 'ngx-contextmenu';
import { KeyboardShortcutsModule }     from 'ng-keyboard-shortcuts';
//import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
//import { InMemoryDataService }  from './in-memory-data.service';
@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    TabViewModule,
    NgbModule,
    AngularSplitModule.forRoot(),
    AngularResizedEventModule,
    //AgGridModule.withComponents([]),
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    ),
    AccordionModule, 
    CheckboxModule,
    BrowserAnimationsModule,
    TableModule,
    ListboxModule,
    ToolbarModule,
    ContextMenuModule.forRoot(),
    KeyboardShortcutsModule.forRoot()
  ],
  declarations: [
    HomeComponent,
    FileUploadComponent,
    ProjectComponent,
    MapComponent,
    ProcessComponent,
    ParameterComponent
  ],
  bootstrap: [HomeComponent],
  providers: []
})
export class AppModule { }
