import { AuthenticationService } from '@alfresco/adf-core';
import { Component, OnInit } from '@angular/core';
import { MrbauConventionsService } from '../services/mrbau-conventions.service';

@Component({
  selector: 'aca-mrbau-settings',
  template: `
    <div id="main" style="margin-left:10px">
      <h2>Administration</h2>
      <div *ngIf="isUserAllowed; else elseBlock">
        <h3>Kunden/Lieferanten</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewVendor()" matTooltip="Neue Firma anlegen">Neue Firma anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditVendor()" matTooltip="Firma ändern">Firma ändern</button>
        </div>
        <h3>Projekte</h3>
        <div style="display:flex;gap:10px">
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonNewProject()" matTooltip="Neues Projekt anlegen">Neues Projekt anlegen</button>
          <button mat-raised-button type="button" class="mat-flat-button mat-button-base mat-primary" color="primary" (click)="buttonEditProject()" matTooltip="Projekt ändern">Projekt ändern</button>
        </div>
      </div>

      <div *ngIf="isUserAllowedMaintenance; else elseBlock">
        <aca-maintenance-tasks></aca-maintenance-tasks>
      </div>
      <ng-template #elseBlock>Zugriff nicht erlaubt.</ng-template>
    </div>
  `,
  styleUrls: [],
})
export class MrbauSettingsComponent implements OnInit {
  isUserAllowed = false;
  isUserAllowedMaintenance = false;

  ngOnInit(): void {
    this.isUserAllowed = false;
    this.isUserAllowedMaintenance = false;

    const user = this.authenticationService.getEcmUsername().toLowerCase();
    if (user == "admin" ||
        user == "wolfgang moser" ||
        user == "skofitsch" ||
        user == "pichlkastner" )
    {
      this.isUserAllowed = true;
    }

    if (user == "admin" ||
        user == "wolfgang moser" )
    {
      this.isUserAllowedMaintenance = true;
    }
  }

  constructor(
    private authenticationService: AuthenticationService,
    private mrbauConventionsService: MrbauConventionsService
    ) {
  }

  buttonNewVendor() {
    this.mrbauConventionsService.addVendor();
  }

  buttonEditVendor() {
    this.mrbauConventionsService.editVendor();
  }

  buttonNewProject() {
    this.mrbauConventionsService.addProject();
  }

  buttonEditProject() {
    this.mrbauConventionsService.editProject();
  }

}