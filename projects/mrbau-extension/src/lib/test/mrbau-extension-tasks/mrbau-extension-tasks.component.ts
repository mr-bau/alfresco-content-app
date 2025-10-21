import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'mrbau-extension-tasks',
  standalone : true,
  templateUrl: './mrbau-extension-tasks.component.html',
  styleUrls: ['./mrbau-extension-tasks.component.scss']
})
export class MrbauExtensionTasksComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.navigate(['tasks']);
  }

}
