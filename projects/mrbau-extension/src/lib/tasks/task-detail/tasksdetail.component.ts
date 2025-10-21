import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { IFileSelectData, ITaskChangedData, MRBauTask, MRBauTaskCategoryPipe } from '../../declaration/mrbau-task-declarations';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { ErrormsgpaneComponent } from '@mrbau/mrbau-common';
import { TasksDetailNewDocumentComponent } from './task-detail-new-document/tasks-detail-new-document.component';
import { TaskDetailCommonComponent } from './task-detail-common/task-detail-common.component';

export interface TaskBarButton {
 icon : string;
 text:string,
 tooltip:string;
 class: string;
 visible?: () => boolean;
 disabled?: () => boolean;
 onClick?: (event?:any) => void;
}

@Component({
  standalone:true,
  imports:[
    CommonModule,
    ErrormsgpaneComponent,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    TasksDetailNewDocumentComponent,
    TaskDetailCommonComponent,
    MRBauTaskCategoryPipe,
  ],
  selector: 'mrbau-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['../../form/mrbau-form-global.scss', './tasksdetail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksdetailComponent implements OnInit {
  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  @Input()
  set task(val: MRBauTask | null) {
    this._task = val;
  }
  get task(): MRBauTask | null {
    return this._task;
  }
  private _task : MRBauTask | null = null;

  errorMessage : string | null = null;

  constructor() {
  }

  ngOnInit(): void {
  }

  fileSelected(fileSelectData : IFileSelectData)
  {
    this.fileSelectEvent.emit(fileSelectData);
  }

  taskChanged(taskChangedData : ITaskChangedData)
  {
    this.taskChangeEvent.emit(taskChangedData);
  }
}
