import { Component, OnInit } from '@angular/core';
import { MRBauTask } from '../../mrbau-task-declarations';
@Component({
  selector: 'aca-mrbau-form',
  templateUrl: './mrbau-form.component.html',
  styleUrls: ['./mrbau-form.component.scss']
})

// Evaluate
// https://formly.dev/ui/material
// https://morioh.com/p/6a501824066a
// https://angularscript.com/best-form-builder/

export class MrbauFormComponent implements OnInit {
  task: MRBauTask = null;
  constructor() { }

  ngOnInit(): void {
  }

}
