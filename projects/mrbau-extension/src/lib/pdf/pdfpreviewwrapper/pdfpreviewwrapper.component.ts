import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { IFileSelectData } from '../../declaration/mrbau-task-declarations';
import { CommonModule } from '@angular/common';
import { PdfpreviewComponent } from '../pdfpreview/pdfpreview.component';
import { CanComponentDeactivate } from '../../guards/pending-changes.interface';
import { Observable } from 'rxjs';

@Component({
  standalone:true,
  imports:[
      CommonModule,
      PdfpreviewComponent,
    ],
  selector: 'mrbau-pdfpreviewwrapper',
  templateUrl: './pdfpreviewwrapper.component.html',
  styleUrls: ['./pdfpreviewwrapper.component.scss']
})
export class PdfpreviewwrapperComponent implements OnInit, CanComponentDeactivate {
  @ViewChild('PDF_PREVIEW') pdfpreviewComponent! : PdfpreviewComponent;
  fileSelectData : IFileSelectData | undefined;
  constructor(private route: ActivatedRoute)
  { }

  canDeactivate() : Observable<boolean> | Promise<boolean> | boolean {
    return this.pdfpreviewComponent.canDeactivate();
  }

  ngOnInit(): void {
    this.route.params.subscribe(({ nodeId, versionId }: Params) => {
      console.log('Node Id: ', nodeId, 'versionId: ', versionId);
      this.fileSelectData = (versionId) ? {nodeId : nodeId, versionId : versionId} : {nodeId : nodeId};
    });
  }
}
