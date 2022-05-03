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
  set selectedRowId(val: string) {
    this._selectedRowId = val;
    this.queryNewData();
  }

  private _selectedRowId : string;
  errorMessage: string = null;
  isLoading: boolean = false;


  constructor(private contentService: ContentService) {
  }

  ngOnInit(): void {
  }

  queryNewData()
  {
    if (this.selectedRowId == null)
    {
      this.fileSelectEvent.emit(null);
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;

    this.contentService.getNode(this.selectedRowId).subscribe(
      (node: NodeEntry) => {
        if (CONST.isPdfDocument(node))
        {
          this.fileSelectEvent.emit(this.contentService.getContentUrl(this.selectedRowId));
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

  get selectedRowId(): string {
    return this._selectedRowId;
  }

  getId() : string {
    if (this._selectedRowId == null)
    {
      return null;
    }
    else
    {
      return this.selectedRowId;
    }
  }

}
