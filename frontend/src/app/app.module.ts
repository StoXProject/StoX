import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home';
import { RConnectionDlg } from './dlg/RConnectionDlg';
import { CreateProjectDialog } from './createProjectDlg/CreateProjectDialog';
import { OpenProjectDlg } from './openProjectDlg/OpenProjectDlg';
import { MessageDlg } from './message/MessageDlg';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ProjectComponent } from './project/project.component';
import { UserLogComponent } from './output/userlog/userlog.component';
import { OutputComponent } from './output/output/output.component';
import {HelpComponent, HTMLContentHandler, SanitizeHtmlPipe} from './help/HelpComponent'
import { MapComponent } from './map/map.component';
import { FormsModule } from '@angular/forms';
import { ProcessComponent } from './process/process.component';
import { TabViewModule } from 'primeng/primeng';
import { ListboxModule } from 'primeng/listbox';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { AngularSplitModule } from 'angular-split';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ParameterComponent } from './parameter/parameter.component';
//import { AgGridModule } from 'ag-grid-angular';
import { AngularResizedEventModule } from 'angular-resize-event';

import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/primeng';
//import {RouterModule } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { PanelMenuModule } from 'primeng/primeng';
import { InputTextModule } from 'primeng/inputtext';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/components/table/table';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './in-memory-data.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { CommonModule, APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ModelComponent } from './model/model.component';
import { RunComponent } from './run/run.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
//import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
//import { InMemoryDataService }  from './in-memory-data.service';
@NgModule({
  imports: [
    BrowserModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    TabViewModule,
    NgbModule,
    AngularSplitModule.forRoot(),
    AngularResizedEventModule,
    //AgGridModule.withComponents([]),
    HttpClientModule,
    /*HttpClientInMemoryWebApiModule.forRoot(
      InMemoryDataService, { dataEncapsulation: false }
    ),*/
    AccordionModule,
    CheckboxModule,
    BrowserAnimationsModule,
    TableModule,
    ListboxModule,
    TabMenuModule,
    ToolbarModule,
    ContextMenuModule,
    KeyboardShortcutsModule.forRoot(),
    RouterModule.forRoot([]),
    MenuModule,//, PanelMenuModule
    MatTabsModule, MatToolbarModule, MatButtonModule,MatButtonToggleModule

  ],
  declarations: [
    HomeComponent,
    RConnectionDlg,
    CreateProjectDialog,
    OpenProjectDlg,
    MessageDlg,
    FileUploadComponent,
    ProjectComponent,
    MapComponent,
    ProcessComponent,
    ParameterComponent,
    ModelComponent,
    RunComponent,
    UserLogComponent,
    OutputComponent,
    HelpComponent, HTMLContentHandler, SanitizeHtmlPipe
  ],
  bootstrap: [HomeComponent],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' },
  { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppModule { }
