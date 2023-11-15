import { DragDropModule as MatDragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { APP_BASE_HREF, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularSplitModule } from 'angular-split';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';
import { NgxResizeObserverModule } from 'ngx-resize-observer';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { InMemoryDataService } from 'test/in-memory-data.service';

import { AutocompleteComponent } from './autocomplete/autocomplete.component';
import { DirectiveAccessor } from './autocomplete/directive-accessor';
import { BusydlgComponent } from './busydlg/busydlg.component';
import { CreateProjectDialogService } from './createProjectDlg/create-project-dialog.service';
import { CreateProjectDialog } from './createProjectDlg/CreateProjectDialog';
import { TooltipDirective } from './directive/TooltipDirective';
import { DefinedColumnsService } from './dlg/definedColumns/DefinedColumnsService';
import { DefinedColumnsTableDlg } from './dlg/definedColumns/DefinedColumnsTableDlg';
import { FilePathDlg } from './dlg/filePath/FilePathDlg';
import { FilePathDlgService } from './dlg/filePath/FilePathDlgService';
import { InstallRPackagesDlg } from './dlg/InstallRPackages/InstallRPackagesDlg';
import { InstallRPackagesDlgService } from './dlg/InstallRPackages/InstallRPackagesDlgService';
import { MessageDlgComponent } from './dlg/messageDlg/messageDlg.component';
import { RConnectionDlg } from './dlg/RConnectionDlg';
import { RConnectionDlgService } from './dlg/RConnectionDlgService';
import { SelectedVariablesDlg } from './dlg/selectedVariables/SelectedVariablesDlg';
import { SelectedVariablesService } from './dlg/selectedVariables/SelectedVariablesService';
import { StratumNameDlgComponent } from './dlg/stratum-name-dlg/stratum-name-dlg.component';
import { ExpressionBuilderDlg } from './expressionBuilder/ExpressionBuilderDlg';
import { ExpressionBuilderDlgService } from './expressionBuilder/ExpressionBuilderDlgService';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HelpComponent, HelpContentHandler, SanitizeHtmlPipe } from './help/HelpComponent';
import { HomeComponent } from './home/home';
import { MapComponent } from './map/map.component';
import { MessageDlg } from './message/MessageDlg';
import { MessageService } from './message/MessageService';
import { ModelComponent } from './model/model.component';
import { OpenProjectAsTemplateDlg } from './openProjectAsTemplateDlg/OpenProjectAsTemplateDlg';
import { OpenProjectAsTemplateDlgService } from './openProjectAsTemplateDlg/OpenProjectAsTemplateDlgService';
import { OpenProjectDlg } from './openProjectDlg/OpenProjectDlg';
import { OpenProjectDlgService } from './openProjectDlg/OpenProjectDlgService';
import { OutputComponent } from './output/output/output.component';
import { UserLogComponent } from './output/userlog/userlog.component';
import { ParameterComponent } from './parameter/parameter.component';
import { ProcessComponent } from './process/process.component';
import { EdsutableComponent } from './processdata/edsutable/edsutable.component';
import { StratumpsuComponent } from './processdata/stratumpsu/stratumpsu.component';
import { ProjectComponent } from './project/project.component';
import { QueryBuilderModule } from './querybuilder/angular2-query-builder.module';
import { QueryBuilderDlg } from './querybuilder/dlg/QueryBuilderDlg';
import { QueryBuilderDlgService } from './querybuilder/dlg/QueryBuilderDlgService';
import { ResetProjectDlg } from './resetProject/ResetProjectDlg';
import { ResetProjectDlgService } from './resetProject/ResetProjectDlgService';
import { RunComponent } from './run/run.component';
import { SaveAsProjectDlg } from './saveAsProject/SaveAsProjectDlg';
import { SaveAsProjectDlgService } from './saveAsProject/SaveAsProjectDlgService';
import { AcousticPSUService } from './service/acoustic-psu.service';
import { DataService } from './service/data.service';
import { ProcessDataService } from './service/processdata.service';
import { ProjectService } from './service/project.service';
import { RunService } from './service/run.service';
import { StatusbarComponent } from './statusbar/statusbar.component';

@NgModule({
  exports: [
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
    NgxResizeObserverModule,
    HttpClientModule,

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
    MenuModule,
    MatToolbarModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCommonModule,
    MatDialogModule,
    MatSelectModule,

    ReactiveFormsModule,
    // NoopAnimationsModule, // disabling all animations
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,

    MatCardModule,
    QueryBuilderModule,
    TooltipModule,
  ],
  declarations: [HomeComponent, RConnectionDlg, InstallRPackagesDlg, CreateProjectDialog, OpenProjectAsTemplateDlg, OpenProjectDlg, BusydlgComponent, ExpressionBuilderDlg, QueryBuilderDlg, DefinedColumnsTableDlg, SelectedVariablesDlg, FilePathDlg, SaveAsProjectDlg, ResetProjectDlg, MessageDlg, FileUploadComponent, ProjectComponent, MapComponent, StratumpsuComponent, EdsutableComponent, ProcessComponent, ParameterComponent, StatusbarComponent, ModelComponent, RunComponent, UserLogComponent, OutputComponent, HelpComponent, HelpContentHandler, SanitizeHtmlPipe, StratumNameDlgComponent, MessageDlgComponent, AutocompleteComponent, TooltipDirective, DirectiveAccessor],
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
    OpenProjectAsTemplateDlgService,
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
