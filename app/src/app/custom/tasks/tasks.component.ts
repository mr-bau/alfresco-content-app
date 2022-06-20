import { Component, OnInit   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMRBauTasksCategory} from '../mrbau-task-declarations';
//import { MRBauTask } from '../mrbau-task-declarations';
@Component({
  selector: 'aca-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],

})
export class TasksComponent implements OnInit {
  static readonly MAX_ITEMS : number = 5;
  SHOW_TOOLBAR : string = "#toolbar=1";
  document_url: SafeResourceUrl = null;
  private _remember_document_url : SafeResourceUrl = null;
  selectedRowId: string = null;

  taskCategories : IMRBauTasksCategory[] = [{
    tabIcon: 'description',
    tabName: 'Tasks',
    tabBadge: 0,
    searchRequest: {
      // https://docs.alfresco.com/content-services/latest/develop/rest-api-guide/searching/
      // https://api-explorer.alfresco.com/api-explorer/?urls.primaryName=Search%20API#/search/search
      // https://angelborroy.wordpress.com/2018/05/30/alfresco-counting-more-than-1000-elements/
      query: {
        //query: '(cm:name:*oemag* or cm:name:*photo*) and +TYPE:\"cm:content\"',
        query: "cm:name:* and +TYPE:'mrbt:task'",
        language: 'afts'
      },
      //sort: [{type:"FIELD", field:"cm:name",  ascending:true}]
      /*
      paging?: RequestPagination;   // "paging": { "maxItems": "50", "skipCount": "28" }
      limits?: RequestLimits;       // alternative to paging "limits": {  "permissionEvaluationTime": 20000,  "permissionEvaluationCount": 2000 }
      include?: RequestInclude;     // "include": ["aspectNames", "properties", "isLink"]
      includeRequest?: boolean;
      fields?: RequestFields;       // restrict fields JSON body parameter returned "fields": ["id", "name", "search"]
      sort?: RequestSortDefinition; // "sort": [{"type":"FIELD", "field":"cm:description", "ascending":"true"}]
      templates?: RequestTemplates; // "templates": [{"name": "_PERSON","template": "|%firstName OR |%lastName OR |%userName"}, {"name": "mytemplate","template": "%cm:content"}]
      defaults?: RequestDefaults;   // defaults": { "textAttributes": ["cm:content", "cm:name"],"defaultFTSOperator": "AND","defaultFTSFieldOperator": "OR", "namespace": "cm","defaultFieldName": "PATH" }
      localization?: RequestLocalization;
      filterQueries?: RequestFilterQueries; // "filterQueries": [{"query": "TYPE:'cm:folder'"},{"query": "cm:creator:mjackson"}]
      facetQueries?: RequestFacetQueries;   // "facetQueries": [{"query": "created:2016","label": "CreatedThisYear"}]
      scope?: RequestScope;         // "scope": { "locations": ["deleted-nodes"] } either nodes (the default), versions or deleted-nodes
      facetFields?: RequestFacetFields;
      facetIntervals?: RequestFacetIntervals;
      pivots?: RequestPivot[];
      stats?: RequestStats[];
      spellcheck?: RequestSpellcheck;
      highlight?: RequestHighlight;
      ranges?: RequestRange[];*/
    }
  },{
    tabIcon: 'list',
    tabName: 'Belegprüfung',
    // InvoiceAuditStart - InvoiceAuditLast
    tabBadge: 0,
    searchRequest: {
      query: {
        //query: "+ASPECT:'foer:Foerderungsordner' and cm:name:'aws'",
        query: "+ASPECT:'foer:Foerderungsordner'",
        language: 'afts'
      }
    }
  },{
    tabIcon: 'label',
    tabName: 'Allgemein',
    // CommonTaskStart - CommonTaskLast
    tabBadge: 0,
    searchRequest: {
      query: {
        query: 'foer:ProjektNr:*',
        language: 'afts'
      },
      sort: [{type:"FIELD", field:"cm:name",  ascending:true}]
    }
  }];

  constructor(private sanitizer: DomSanitizer) {
  }

  ngOnInit(): void {
  }

  dragStartEvent(){
    // workaround: hide pdf viewer during split pane resize
    this._remember_document_url = this.document_url;
    this.document_url = null;
  }

  dragEndEvent(){
    // workaround: restore pdf viewer after split pane resize
    this.document_url = this._remember_document_url;
    this._remember_document_url = null;
  }

  taskSelected(row : string) {
    this.selectedRowId = row;
  }

  fileSelected(fileUrl : string)
  {
    if (fileUrl == null)
    {
      this.document_url = null;
      return;
    }
    this.document_url = this.sanitizeUrl(fileUrl.concat(this.SHOW_TOOLBAR));
  }

  sanitizeUrl(url:string) : SafeResourceUrl {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
