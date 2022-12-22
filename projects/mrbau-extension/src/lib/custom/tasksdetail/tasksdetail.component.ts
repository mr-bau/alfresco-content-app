import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';
import { IFileSelectData, ITaskChangedData } from '../tasks/tasks.component';

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
  selector: 'aca-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['../form/mrbau-form-global.scss', './tasksdetail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TasksdetailComponent implements OnInit {
  @Output() fileSelectEvent = new EventEmitter<IFileSelectData>();
  @Output() taskChangeEvent = new EventEmitter<ITaskChangedData>();

  @Input()
  set task(val: MRBauTask) {
    this._task = val;
  }
  get task(): MRBauTask {
    return this._task;
  }
  private _task : MRBauTask = null;

  errorMessage:string = null;

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
