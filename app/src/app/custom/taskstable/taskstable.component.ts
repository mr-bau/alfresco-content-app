import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SearchService} from '@alfresco/adf-core';
import { ObjectDataTableAdapter, DataRowEvent, ObjectDataRow, PaginatedComponent, PaginationModel}  from '@alfresco/adf-core';
import { IMRBauTasksCategory} from '../mrbau-task-declarations';
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
  @Output() taskSelectEvent = new EventEmitter<ObjectDataRow>();
  isLoading : boolean = false;
  errorMessage : string = null;
  selectedTab = new FormControl(0);
  selectedObject : ObjectDataRow = null;

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
    this.selectedObject = null;
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
        let results = [];
        for (var entry of nodePaging.list.entries) {
          results.push({
            id: entry.entry.id,
            name: entry.entry.name,
            createdBy: entry.entry.createdByUser.displayName,
            status: 'green',
            icon: 'material-icons://'+currentTab.tabIcon

          });
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
    let obj = event.value as ObjectDataRow;
    if (this.selectedObject == obj)
    {
      // deselect row
      obj.isSelected = false;
      this.selectObject(null);
    }
    else
    {
      this.selectObject(obj);
    }
  }

  selectObject(obj : ObjectDataRow)
  {
    this.selectedObject = obj;
    this.taskSelectEvent.emit(obj);
  }

  sortingChanged( event )
  {
    //TODO implement server side sorting
    event;
  }
}
