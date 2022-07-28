import { Component, Input, Output, OnInit, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ContentService, NotificationService } from '@alfresco/adf-core';
import {  NodeEntry, } from '@alfresco/js-api';
import { MRBauTask } from '../mrbau-task-declarations';
import { CONST } from '../mrbau-global-declarations';

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
  @Output() fileSelectEvent = new EventEmitter<string>();
  @Output() taskChangeEvent = new EventEmitter<MRBauTask>();

  @Input()
  set task(val: MRBauTask) {
    this._task = val;
    this.nodeId = (this.task) ? this._task.id : null;
    this.selectedFirstAssociatedFile();
  }
  get task(): MRBauTask {
    return this._task;
  }
  private _task : MRBauTask = null;

  nodeId:string = null;
  errorMessage:string = null;

  historyPanelOpened:boolean=false;
  commentPanelOpened:boolean=false;

  constructor(
    private contentService: ContentService,
    private notificationService:NotificationService,
    ) {
  }

  ngOnInit(): void {
  }

  fileSelected(fileUrl : string)
  {
    this.fileSelectEvent.emit(fileUrl);
  }

  taskChanged(task : MRBauTask)
  {
    this.taskChangeEvent.emit(task);
  }

  selectedFirstAssociatedFile()
  {
    if (!this._task)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    if (this._task.associatedDocumentRef.length > 0)
    {
      let id : string = this._task.associatedDocumentRef[0];
      this.onAssociationClickedById(id, true);
    }
  }

  onAssociationClickedById(id : string, suppressNotification?:boolean)
  {
    if (id == null)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.contentService.getNode(id).subscribe(
      (node: NodeEntry) => {
        if (CONST.isPdfDocument(node))
        {
          this.fileSelectEvent.emit(this.contentService.getContentUrl(id));
        }
        else
        {
          this.fileSelectEvent.emit(null);
          if (!suppressNotification)
          {
            this.notificationService.showInfo('Nur PDF-Dokumente werden angezeigt!');
          }
        }
      },
      error => {
        this.errorMessage = error;
      }
    );
  }
}
