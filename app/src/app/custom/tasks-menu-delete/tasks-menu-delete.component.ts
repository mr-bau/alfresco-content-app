import { AuthenticationService, ContentService, NotificationService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MRBauTask } from '../mrbau-task-declarations';

@Component({
  selector: 'aca-tasks-menu-delete',
  template: `
    <button mat-menu-item (click)="onDeleteTaskClicked()" [disabled]="isDisabled()">
      <mat-icon>delete</mat-icon>
        <span>Aufgabe Löschen</span>
    </button>
  `,
})
export class TasksMenuDeleteComponent {
  @Input() task: MRBauTask;
  @Output() taskChangeEvent = new EventEmitter<MRBauTask>();

  constructor(
    private contentService: ContentService,
    private notificationService:NotificationService,
    private authenticationService:AuthenticationService,
    ) { }

  isDisabled() : boolean {
    return this.authenticationService.getEcmUsername() != 'admin';
  }

  onDeleteTaskClicked()
  {

    this.contentService.nodesApi.deleteNode(this.task.id,{permanent : true}).then(
      () => {
        this.taskChangeEvent.emit(this.task);
        this.notificationService.showInfo('Aufgabe wurde gelöscht');
      })
      .catch(
        (err) => {
          this.notificationService.showError(err);
      });
  }
}
