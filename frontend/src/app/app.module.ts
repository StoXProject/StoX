import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home';
import { RConnectionDlg } from './dlg/RConnectionDlg';
import { CreateProjectDialog } from './createProjectDlg/CreateProjectDialog';
import { OpenProjectDlg } from './openProjectDlg/OpenProjectDlg';
import { ExpressionBuilderDlg } from './expressionBuilder/ExpressionBuilderDlg';
import { QueryBuilderDlg } from './querybuilder/dlg/QueryBuilderDlg';
import { DefinedColumnsTableDlg } from './dlg/definedColumns/DefinedColumnsTableDlg';
import { MessageDlg } from './message/MessageDlg';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ProjectComponent } from './project/project.component';
import { UserLogComponent } from './output/userlog/userlog.component';
import { OutputComponent } from './output/output/output.component';
import {HelpComponent, HelpContentHandler, SanitizeHtmlPipe} from './help/HelpComponent'
import { MapComponent } from './map/map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import {PanelModule} from 'primeng/panel';
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
import { TreeModule } from 'primeng/tree';
import { TooltipDirective } from './directive/TooltipDirective'
import {
  MatTabsModule,
  MatButtonModule,
  MatToolbarModule,
  MatButtonToggleModule,
  MatCommonModule,
} from '@angular/material';


import { StratumNameDlgComponent } from './dlg/stratum-name-dlg/stratum-name-dlg.component';
//import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
//import { InMemoryDataService }  from './in-memory-data.service';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';
import { StratumpsuComponent } from './processdata/stratumpsu/stratumpsu.component';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { QueryBuilderModule } from './querybuilder/angular2-query-builder.module';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';

@NgModule({
  exports: [
    // CDK
    // A11yModule,
    // BidiModule,
    // ObserversModule,
    // OverlayModule,
    // PlatformModule,
    // PortalModule,
    // ScrollDispatchModule,
    // CdkStepperModule,
    // CdkTableModule,
    // CdkTreeModule,
    
    // Material
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    MatAutocompleteModule,
  ],
  declarations: []
})
export class MaterialModule {}

@NgModule({
  imports: [
    MaterialModule,
    BrowserModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    PanelModule,
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
    TreeModule,
    ContextMenuModule,
    KeyboardShortcutsModule.forRoot(),
    RouterModule.forRoot([]),
    MenuModule,//, PanelMenuModule
    MatTabsModule, MatToolbarModule, MatButtonModule,MatButtonToggleModule, MatCommonModule, 
    MatFormFieldModule,
    MatInputModule,MatDialogModule,

    ReactiveFormsModule,
    NoopAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    QueryBuilderModule  
  ],
  entryComponents: [StratumNameDlgComponent],
  declarations: [
    HomeComponent,
    RConnectionDlg,
    CreateProjectDialog,
    OpenProjectDlg,
    ExpressionBuilderDlg,
    QueryBuilderDlg,
    DefinedColumnsTableDlg,
    MessageDlg,
    FileUploadComponent,
    ProjectComponent,
    MapComponent,
    StratumpsuComponent,
    ProcessComponent,
    ParameterComponent,
    ModelComponent,
    RunComponent,
    UserLogComponent,
    OutputComponent,
    HelpComponent, HelpContentHandler, SanitizeHtmlPipe, StratumNameDlgComponent,
    AutocompleteComponent, TooltipDirective
  ],
  bootstrap: [HomeComponent],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' },
  { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppModule { }
