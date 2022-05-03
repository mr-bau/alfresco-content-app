import { Component, OnInit   } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IMRBauTasksCategory} from '../mrbau-task-declarations';
@Component({
  selector: 'aca-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],

})
export class TasksComponent implements OnInit {
  SHOW_TOOLBAR : string = "#toolbar=1";
  document_url: SafeResourceUrl = null;
  private _remember_document_url : SafeResourceUrl = null;
  selectedRowId: string = null;

  taskCategories : IMRBauTasksCategory[] = [{
    tabIcon: 'description',
    tabName: 'Eingang',
    // NewDocumentStart - NewDocumentLast
    tabBadge: 0,
    searchQuery: "foer:*",
    searchOptions: {
      skipCount:  0,
      maxItems : 5,
      //rootNodeId?: string;
      //nodeType?: string;
      //include?: string[];
      //orderBy?: string;
      //fields?: string[];
    }
  },{
    tabIcon: 'list',
    tabName: 'Belegprüfung',
    // InvoiceAuditStart - InvoiceAuditLast
    tabBadge: 0,
    searchQuery: "oemag",
    searchOptions: {
      skipCount:  0,
      maxItems : 5,
      //rootNodeId?: string;
      //nodeType?: string;
      //include?: string[];
      //orderBy?: string;
      //fields?: string[];
    }
  },{
    tabIcon: 'label',
    tabName: 'Allgemein',
    // CommonTaskStart - CommonTaskLast
    tabBadge: 0,
    searchQuery: "aws",
    searchOptions: {
      skipCount:  0,
      maxItems : 5,
      //rootNodeId?: string;
      nodeType: "cm:folder",
      //include?: string[];
      //orderBy?: string;
      //fields?: string[];
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
