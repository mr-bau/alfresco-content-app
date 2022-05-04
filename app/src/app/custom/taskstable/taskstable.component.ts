import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchService} from '@alfresco/adf-core';
import { ObjectDataTableAdapter, ObjectDataRow, DataRowEvent, DataRow, PaginatedComponent, PaginationModel}  from '@alfresco/adf-core';
import { IMRBauTasksCategory, IMRBauTaskListEntry} from '../mrbau-task-declarations';
import { FormControl} from '@angular/forms';
import { NodePaging } from '@alfresco/js-api';

@Component({
  selector: 'aca-taskstable',
  templateUrl: './taskstable.component.html',
  styleUrls: ['./taskstable.component.scss']
})
export class TasksTableComponent implements OnInit, PaginatedComponent {
  data: ObjectDataTableAdapter = new ObjectDataTableAdapter([],[]);
  @Input() taskCategories : IMRBauTasksCategory[] = null;
  @Output() taskSelectEvent = new EventEmitter<string>();
  isLoading : boolean = false;
  errorMessage : string = null;
  selectedTab = new FormControl(0);
  selectedTaskId : string = null;

  pagination: BehaviorSubject<PaginationModel> = new BehaviorSubject<PaginationModel>({});
  paginationSizes = [5, 10, 25];
  updatePagination(params: PaginationModel) {
    //console.log(params);
    this.pagination.next(params);
    this.queryNewData();
  }

  constructor(private searchService: SearchService) {
  }

  ngOnInit(): void {
    // load data
    this.pagination.value.maxItems = this.paginationSizes[0];
    this.tabSelectionChanged(0);
  }

  queryRemainingBadgeCounts()
  {
    for (let i=0; i<this.taskCategories.length; i++)
    {
      if (i != this.selectedTab.value)
      {
        let tab = this.taskCategories[i];
        tab.searchRequest.paging = {
          skipCount: 0,
          maxItems:  1
        }

        this.searchService.searchByQueryBody(tab.searchRequest).subscribe(
          (nodePaging : NodePaging) => {
            tab.tabBadge = nodePaging.list.pagination.totalItems;
          },
          error => {
            // ignore errors for badge counts
            console.log(error);
          }
        );
      }
    }
  }

  queryNewData()
  {
    this.isLoading = true;
    this.errorMessage = null;
    this.selectedTaskId = null;
    this.data.setRows([]);
    let currentTab = this.taskCategories[this.selectedTab.value];

    let searchRequest = currentTab.searchRequest;
    searchRequest.paging = {
      skipCount: this.pagination.value.skipCount,
      maxItems:  this.pagination.value.maxItems
    }

    this.searchService.searchByQueryBody(searchRequest).subscribe(
      (nodePaging : NodePaging) => {
        currentTab.tabBadge = nodePaging.list.pagination.totalItems;
        this.pagination.next({
          count: nodePaging.list.pagination.count,
          maxItems: nodePaging.list.pagination.maxItems,
          skipCount: nodePaging.list.pagination.skipCount,
          totalItems: nodePaging.list.pagination.totalItems,
        });

        let results: IMRBauTaskListEntry[] = [];
        let i:number = 0;
        for (var entry of nodePaging.list.entries) {
          let e : IMRBauTaskListEntry = {
            id : entry.entry.id,
            desc : entry.entry.name,
            createdUser : entry.entry.createdByUser.displayName,
            assignedUser : entry.entry.createdByUser.displayName,
            createdDate : entry.entry.createdAt,
            dueDate : entry.entry.createdAt,
            status : i++,
            icon : 'material-icons://'+currentTab.tabIcon
          }
          e.dueDate.setDate(e.createdDate.getDate() + 30);
          results.push(
            e
          );
        }
        this.data.setRows(results.map(item => { return new ObjectDataRow(item); }));
        this.isLoading = false;
      },
      error => {
        this.errorMessage = "Error loading data. "+error;
        this.isLoading = false;
      }
    );
    this.queryRemainingBadgeCounts();
  }

  tabSelectionChanged( event)
  {
    // set new tab
    this.selectedTab.setValue(event);
    this.pagination.next({
      skipCount: 0,
      maxItems: this.pagination.value.maxItems,
    });
    // deselect object
    this.selectObject(null);
    // load data
    this.queryNewData();
  }

  rowClicked( event : DataRowEvent)
  {
    let obj = event.value as DataRow;
    let id = obj.getValue("id") as string;
    if (id != this.selectedTaskId)
    {
      this.selectObject(id);
    }
  }

  selectObject(taskId : string | null)
  {
    this.selectedTaskId = taskId;
    this.taskSelectEvent.emit(taskId);
  }

  sortingChanged( event )
  {
    //TODO implement server side sorting
    event;
  }
}
