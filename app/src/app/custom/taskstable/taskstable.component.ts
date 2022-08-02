import { Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataTableAdapter, SearchService} from '@alfresco/adf-core';
import { ObjectDataTableAdapter, ObjectDataRow, DataRowEvent, DataRow, PaginatedComponent, PaginationModel}  from '@alfresco/adf-core';
import { IMRBauTasksCategory, IMRBauTaskListEntry, MRBauTask
} from '../mrbau-task-declarations';
import { FormControl} from '@angular/forms';
import { NodePaging, SearchRequest } from '@alfresco/js-api';
import { ITaskChangedData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-taskstable',
  templateUrl: './taskstable.component.html',
  styleUrls: ['./taskstable.component.scss']
})
export class TasksTableComponent implements OnInit, PaginatedComponent {
  @ViewChild('dataTable') adfDataTable : DataTableAdapter;

  @Input() taskCategories : IMRBauTasksCategory[] = null;
  @Output() taskSelectEvent = new EventEmitter<MRBauTask>();

  data: ObjectDataTableAdapter = new ObjectDataTableAdapter([],[]);
  isLoading : boolean = false;
  errorMessage : string = null;
  selectedTab = new FormControl(0);
  selectedTask : MRBauTask = null;

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

  taskUpdateEvent(taskChangedData:ITaskChangedData) {
    if (taskChangedData.queryTasks)
    {
      // unselect task and update table
      this.selectObject(null);
      this.queryNewData();
    }
    else
    {
      // update task info in table
      this.data.getRows().forEach(row => {
        if (row.obj.task == taskChangedData.task)
        {
          row.obj.status = taskChangedData.task.status;
        }
      });
    }
  }

  queryRemainingBadgeCounts()
  {
    for (let i=0; i<this.taskCategories.length-1; i++)
    {
      //if (i != this.selectedTab.value)
      {
        let tab = this.taskCategories[i];
        // deep copy object
        let searchRequest : SearchRequest = JSON.parse(JSON.stringify(tab.searchRequest))
        searchRequest.paging = {
          skipCount: 0,
          maxItems:  999
        }
        // HELPER_FORCE_FULL_TEXT_SEARCH is only needed for AFTS search
        //searchRequest.query.query = searchRequest.query.query+CONST.HELPER_FORCE_FULL_TEXT_SEARCH;
        this.searchService.searchByQueryBody(searchRequest).subscribe(
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
    if (this.taskCategories.length == 0) {
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.selectedTask = null;
    this.data.setRows([]);
    let currentTab = this.taskCategories[this.selectedTab.value];

    let searchRequest = currentTab.searchRequest;
    searchRequest.paging = {
      skipCount: this.pagination.value.skipCount,
      maxItems:  this.pagination.value.maxItems
    }
    this.searchService.searchByQueryBody(searchRequest).subscribe(
      (nodePaging : NodePaging) => {
        // use queryRemainingBadgeCounts
        //currentTab.tabBadge = nodePaging.list.pagination.totalItems;
        this.pagination.next({
          count: nodePaging.list.pagination.count,
          maxItems: nodePaging.list.pagination.maxItems,
          skipCount: nodePaging.list.pagination.skipCount,
          totalItems: nodePaging.list.pagination.totalItems,
        });

        let results: IMRBauTaskListEntry[] = [];

        for (var nodeEntry of nodePaging.list.entries) {
          let task = new MRBauTask();
          task.updateWithNodeData(nodeEntry.entry);
          let e : IMRBauTaskListEntry = {
            task : task,
            desc : task.desc,
            createdUser : nodeEntry.entry.createdByUser.displayName,
            createdDate : nodeEntry.entry.createdAt,
            dueDateValue : nodeEntry.entry.properties["mrbt:dueDateValue"],
            icon : 'material-icons://'+currentTab.tabIcon,
            status: task.status,
          }
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
    let task = obj.getValue("task") as MRBauTask;
    if (task != this.selectedTask)
    {
      this.selectObject(task);
    }
  }

  selectObject(task : MRBauTask | null)
  {
    this.selectedTask = task;
    this.taskSelectEvent.emit(task);
  }

  sortingChanged( event )
  {
    //TODO implement server side sorting
    event;
  }
}
