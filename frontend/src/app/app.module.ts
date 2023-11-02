import { ResetProjectDlg } from './resetProject/ResetProjectDlg';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HomeComponent } from './home/home';
import { RConnectionDlg } from './dlg/RConnectionDlg';
import { InstallRPackagesDlg } from './dlg/InstallRPackages/InstallRPackagesDlg';
import { CreateProjectDialog } from './createProjectDlg/CreateProjectDialog';
import { OpenProjectDlg } from './openProjectDlg/OpenProjectDlg';
import { ExpressionBuilderDlg } from './expressionBuilder/ExpressionBuilderDlg';
import { QueryBuilderDlg } from './querybuilder/dlg/QueryBuilderDlg';
import { DefinedColumnsTableDlg } from './dlg/definedColumns/DefinedColumnsTableDlg';
import { SelectedVariablesDlg } from './dlg/selectedVariables/SelectedVariablesDlg';
import { FilePathDlg } from './dlg/filePath/FilePathDlg';
import { SaveAsProjectDlg } from './saveAsProject/SaveAsProjectDlg';
import { MessageDlg } from './message/MessageDlg';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ProjectComponent } from './project/project.component';
import { UserLogComponent } from './output/userlog/userlog.component';
import { OutputComponent } from './output/output/output.component';
import { HelpComponent, HelpContentHandler, SanitizeHtmlPipe } from './help/HelpComponent';
import { MapComponent } from './map/map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProcessComponent } from './process/process.component';
import { TabViewModule } from 'primeng/tabview';
import { ListboxModule } from 'primeng/listbox';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToolbarModule } from 'primeng/toolbar';
import { DragDropModule } from 'primeng/dragdrop';
import { AngularSplitModule } from 'angular-split';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ParameterComponent } from './parameter/parameter.component';
// TODO https://jira.imr.no/browse/STOX-690
// import { AngularResizeEventModule } from 'angular-resize-event';

import { HttpClientModule } from '@angular/common/http';

import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
// import {RouterModule } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { InputTextModule } from 'primeng/inputtext';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableModule } from 'primeng/table';
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService } from './in-memory-data.service';
import { ContextMenuModule } from 'primeng/contextmenu';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { ModelComponent } from './model/model.component';
import { RunComponent } from './run/run.component';
import { TreeModule } from 'primeng/tree';
import { TooltipDirective } from './directive/TooltipDirective';

// import { MatTabsModule } from '@angular/material/tabs';
// import { MatButtonModule } from '@angular/material/button';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { StratumNameDlgComponent } from './dlg/stratum-name-dlg/stratum-name-dlg.component';
import { MessageDlgComponent } from './dlg/messageDlg/messageDlg.component';
// import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// import { InMemoryDataService }  from './in-memory-data.service';
import { MatCommonModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { TooltipModule } from 'primeng/tooltip';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DragDropModule as MatDragDropModule } from '@angular/cdk/drag-drop';

/*import {
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
} from '@angular/material';*/
import { StratumpsuComponent } from './processdata/stratumpsu/stratumpsu.component';

// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { QueryBuilderModule } from './querybuilder/angular2-query-builder.module';
import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { EdsutableComponent } from './processdata/edsutable/edsutable.component';
import { DirectiveAccessor } from './autocomplete/directive-accessor';
import { StatusbarComponent } from './statusbar/statusbar.component';
import { BusydlgComponent } from './busydlg/busydlg.component';
import { CreateProjectDialogService } from './createProjectDlg/create-project-dialog.service';
import { RConnectionDlgService } from './dlg/RConnectionDlgService';
import { DefinedColumnsService } from './dlg/definedColumns/DefinedColumnsService';
import { FilePathDlgService } from './dlg/filePath/FilePathDlgService';
import { InstallRPackagesDlgService } from './dlg/InstallRPackages/InstallRPackagesDlgService';
import { SelectedVariablesService } from './dlg/selectedVariables/SelectedVariablesService';
import { ExpressionBuilderDlgService } from './expressionBuilder/ExpressionBuilderDlgService';
import { MessageService } from './message/MessageService';
import { OpenProjectDlgService } from './openProjectDlg/OpenProjectDlgService';
import { QueryBuilderDlgService } from './querybuilder/dlg/QueryBuilderDlgService';
import { ResetProjectDlgService } from './resetProject/ResetProjectDlgService';
import { SaveAsProjectDlgService } from './saveAsProject/SaveAsProjectDlgService';
import { AcousticPSUService } from './service/acoustic-psu.service';
import { DataService } from './service/data.service';
import { ProcessDataService } from './service/processdata.service';
import { ProjectService } from './service/project.service';
import { RunService } from './service/run.service';
import { InMemoryDataService } from 'test/in-memory-data.service';

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
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatListModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    /* MatDatepickerModule,*/
    /* MatDividerModule,
    MatExpansionModule,*/
    /*MatGridListModule,*/
    /*MatInputModule,
    MatListModule,
    MatMenuModule,*/
    /* MatProgressBarModule,
    MatProgressSpinnerModule,*/
    /*MatRippleModule,*/
    /*MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,*/
    //    MatTooltipModule,
    //    MatTreeModule,
  ],
  declarations: [],
})
export class MaterialModule {}

@NgModule({
  exports: [DirectiveAccessor],
  imports: [
    ScrollingModule,
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
    // TODO https://jira.imr.no/browse/STOX-690
    //AngularResizeEventModule,
    HttpClientModule,
    // AgGridModule.withComponents([]),
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
    DragDropModule,
    MatDragDropModule,
    TreeModule,
    ContextMenuModule,
    KeyboardShortcutsModule.forRoot(),
    RouterModule.forRoot([]),
    MenuModule, // , PanelMenuModule
    /*MatTabsModule,*/ MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCommonModule,
    /*MatFormFieldModule,
    MatInputModule,*/ MatDialogModule,
    MatSelectModule,

    ReactiveFormsModule,
    // NoopAnimationsModule, // disabling all animations
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    /*MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatIconModule,*/
    MatCardModule,
    QueryBuilderModule,
    TooltipModule,
  ],
  declarations: [HomeComponent, RConnectionDlg, InstallRPackagesDlg, CreateProjectDialog, OpenProjectDlg, BusydlgComponent, ExpressionBuilderDlg, QueryBuilderDlg, DefinedColumnsTableDlg, SelectedVariablesDlg, FilePathDlg, SaveAsProjectDlg, ResetProjectDlg, MessageDlg, FileUploadComponent, ProjectComponent, MapComponent, StratumpsuComponent, EdsutableComponent, ProcessComponent, ParameterComponent, StatusbarComponent, ModelComponent, RunComponent, UserLogComponent, OutputComponent, HelpComponent, HelpContentHandler, SanitizeHtmlPipe, StratumNameDlgComponent, MessageDlgComponent, AutocompleteComponent, TooltipDirective, DirectiveAccessor],
  bootstrap: [HomeComponent],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    CreateProjectDialogService,
    RConnectionDlgService,
    DefinedColumnsService,
    FilePathDlgService,
    InstallRPackagesDlgService,
    SelectedVariablesService,
    ExpressionBuilderDlgService,
    MessageService, // NOT PRIMENG MESSAGE SERVICE
    OpenProjectDlgService,
    QueryBuilderDlgService,
    ResetProjectDlgService,
    SaveAsProjectDlgService,
    AcousticPSUService,
    DataService,
    ProcessDataService,
    ProjectService,
    RunService,
    InMemoryDataService,
  ],
})
export class AppModule {}
