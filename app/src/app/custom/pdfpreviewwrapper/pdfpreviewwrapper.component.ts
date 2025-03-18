import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { IFileSelectData } from '../tasks/tasks.component';

@Component({
  selector: 'aca-pdfpreviewwrapper',
  templateUrl: './pdfpreviewwrapper.component.html',
  styleUrls: ['./pdfpreviewwrapper.component.scss']
})
export class PdfpreviewwrapperComponent implements OnInit {
  fileSelectData : IFileSelectData;
  constructor(private route: ActivatedRoute)
  { }

  ngOnInit(): void {
    this.route.params.subscribe(({ nodeId, versionId }: Params) => {
      //console.log('Node Id: ', nodeId, 'versionId: ', versionId);
      this.fileSelectData = (versionId) ? {nodeId : nodeId, versionId : versionId} : {nodeId : nodeId};
    });
  }
}
