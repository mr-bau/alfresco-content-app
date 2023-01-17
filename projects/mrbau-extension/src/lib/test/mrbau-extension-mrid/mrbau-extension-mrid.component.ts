import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'aca-mrbau-extension-mrid',
  templateUrl: './mrbau-extension-mrid.component.html',
  styleUrls: ['./mrbau-extension-mrid.component.scss']
})
export class MrbauExtensionMridComponent implements OnInit {
  mrId : string;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(({ mrId }: Params) => {
      //console.log('MrBau ID: ', mrId);
      this.mrId = mrId;
  });
  }

}
