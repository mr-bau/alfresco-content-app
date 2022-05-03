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
    console.log(params);
    this.pagination.next(params);
    this.queryNewData();
  }

  constructor(private searchService: SearchService) {
  }

  ngOnInit(): void {
    // load data
    this.tabSelectionChanged(0);
  }

  queryRemainingBadgeCounts()
  {
    for (let i=0; i<this.taskCategories.length; i++)
    {
      if (i != this.selectedTab.value)
      {
        let tab = this.taskCategories[i];
        let options = Object.assign({}, tab.searchOptions);
        options.maxItems = 1;
        this.searchService.getNodeQueryResults(tab.searchQuery, options).subscribe(
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
    let options = Object.assign({}, currentTab.searchOptions);
    options.skipCount = this.pagination.value.skipCount;
    options.maxItems = this.pagination.value.maxItems;

    this.searchService.getNodeQueryResults(currentTab.searchQuery, options).subscribe(
      (nodePaging : NodePaging) => {
        console.log("Query Result "+nodePaging.list.entries.length+ " skipCount "+currentTab.searchOptions.skipCount+" maxItems "+currentTab.searchOptions.maxItems+ " has more "+nodePaging.list.pagination.hasMoreItems);
        currentTab.tabBadge = nodePaging.list.pagination.totalItems;

        this.pagination.next({
          count: nodePaging.list.pagination.count,
          maxItems: nodePaging.list.pagination.maxItems,
          skipCount: nodePaging.list.pagination.skipCount,
          totalItems: nodePaging.list.pagination.totalItems,
        });

        console.log(nodePaging);
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
    // reset pagination according to tab settings
    this.pagination.next({
      skipCount: 0,
      maxItems: this.taskCategories[this.selectedTab.value].searchOptions.maxItems,
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
