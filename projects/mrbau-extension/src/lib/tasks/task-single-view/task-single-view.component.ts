import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MrbauCommonService } from '../../services/mrbau-common.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent } from '@mrbau/mrbau-common';
import { PdfpreviewComponent } from '../../pdf/pdfpreview/pdfpreview.component';
import { SplitpaneTwoColComponent } from '../../splitpane/splitpane-two-col/splitpane-two-col.component';
import { TasksdetailComponent } from '../task-detail/tasksdetail.component';
import { IFileSelectData, MRBauTask, ITaskChangedData } from '../../declaration/mrbau-task-declarations';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../guards/pending-changes.interface';
import { PdfpreviewwrapperComponent } from '../../pdf/pdfpreviewwrapper/pdfpreviewwrapper.component';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    ErrormsgpaneComponent, LoaderoverlayComponent, ShowNavbarOverlayComponent,
    MatButtonModule,
    MatIconModule,
    PdfpreviewComponent,
    SplitpaneTwoColComponent,
    TasksdetailComponent,
  ],
  selector: 'mrbau-task-single-view',
  templateUrl: './task-single-view.component.html',
  styleUrls: ['./task-single-view.component.scss']
})
export class TaskSingleViewComponent implements OnInit, CanComponentDeactivate {
  @ViewChild('PDF_PREVIEW_WRAPPER') pdfpreviewwrapperComponent! : PdfpreviewwrapperComponent;
  nodeId = '';
  fileSelectData : IFileSelectData | null = null;
  dragging =  false;
  selectedTask: MRBauTask | null = null;
  loaderVisible : boolean = false;
  errorMessage :string | null = null;

  constructor(
    private route: ActivatedRoute,
    private mrbauCommonService : MrbauCommonService,
  ){
  }

   canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    if (this.pdfpreviewwrapperComponent) {
      return this.pdfpreviewwrapperComponent.canDeactivate();
    }
    return true;
  }

  ngOnInit(): void {
    this.route.params.subscribe(({ nodeId }: Params) => {
      this.nodeId = nodeId;
      this.queryTask();
    });
  }

  queryTask()
  {
    this.errorMessage=null;
    this.mrbauCommonService.getNode(this.nodeId).toPromise()
    .then(result => {
      //console.log(result);
      if (result == null) {
        return;
      }
      let task = new MRBauTask();
      task.updateWithNodeData(result.entry);
      this.taskSelected(task);
    })
    .catch(error => { this.errorMessage = error });
  }

  dragStartEvent(){
    // workaround: hide pdf viewer during split pane resize
    this.dragging = true;
  }

  dragEndEvent(){
    // workaround: restore pdf viewer after split pane resize
    this.dragging = false;
  }

  taskSelected(task : MRBauTask) {
    this.selectedTask = task;
    this.selectedFirstAssociatedFile();
  }

  private selectedFirstAssociatedFile()
  {
    if (!this.selectedTask || this.selectedTask.associatedDocumentRef.length == 0)
    {
      this.fileSelected(null);
      return;
    }
    this.fileSelected({nodeId : this.selectedTask.associatedDocumentRef[0], suppressNotification : true})
  }

  fileSelected(fileSelectData : IFileSelectData | null) {
    this.fileSelectData = fileSelectData;
  }

  taskChanged(taskChangedData : ITaskChangedData)
  {
    taskChangedData;
    if (taskChangedData?.queryTasks) {
      this.queryTask();
    }
  }

}
