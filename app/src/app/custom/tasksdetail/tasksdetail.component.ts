import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { ContentService} from '@alfresco/adf-core';
import { NodeEntry } from '@alfresco/js-api';
import { CONST } from '../mrbau-global-declarations';

@Component({
  selector: 'aca-tasksdetail',
  templateUrl: './tasksdetail.component.html',
  styleUrls: ['./tasksdetail.component.scss']
})
export class TasksdetailComponent implements OnInit {
  @Output() fileSelectEvent = new EventEmitter<string>();
  @Input()
  set taskId(val: string) {
    this._taskId = val;
    this.queryNewData();
  }

  private _taskId : string;
  errorMessage: string = null;
  isLoading: boolean = false;


  constructor(private contentService: ContentService) {
  }

  ngOnInit(): void {
  }

  queryNewData()
  {
    if (this.taskId == null)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getNode(this.taskId).subscribe(
      (node: NodeEntry) => {
        if (CONST.isPdfDocument(node))
        {
          this.fileSelectEvent.emit(this.contentService.getContentUrl(this.taskId));
        }
        else
        {
          this.fileSelectEvent.emit(null);
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  get taskId(): string {
    return this._taskId;
  }
}
