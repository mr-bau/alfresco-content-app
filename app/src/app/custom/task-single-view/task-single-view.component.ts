import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { MRBauTask } from '../mrbau-task-declarations';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-task-single-view',
  templateUrl: './task-single-view.component.html',
  styleUrls: ['./task-single-view.component.scss']
})
export class TaskSingleViewComponent implements OnInit {

  nodeId = '';
  fileSelectData : IFileSelectData = null;
  dragging =  false;
  selectedTask: MRBauTask = null;
  loaderVisible : boolean;
  errorMessage :string;

  constructor(
    private route: ActivatedRoute,
    private mrbauCommonService : MrbauCommonService,
  ){
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

  fileSelected(fileSelectData : IFileSelectData) {
    this.fileSelectData = fileSelectData;
  }

  taskChanged(taskChangedData : ITaskChangedData)
  {
    taskChangedData;
  }

}
