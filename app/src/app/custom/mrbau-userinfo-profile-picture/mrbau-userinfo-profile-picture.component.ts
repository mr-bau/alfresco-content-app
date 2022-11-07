import { Component, Input, OnInit } from '@angular/core';
import { MrbauCommonService } from '../services/mrbau-common.service';

@Component({
  selector: 'aca-mrbau-userinfo-profile-picture',
  template: `
  <div *ngIf="avatarId; else userInfoInitialsTemplate" class="adf-userinfo-profile-container">
    <img [src]="getUserProfileImage()" alt="user-info-profile-picture" class="adf-userinfo-profile-image"/>
  </div>
  <ng-template #userInfoInitialsTemplate>
    <div class="adf-userinfo-pic">{{userName | mrbauUsernameInitialsPipe}}</div>
  </ng-template>
  `,
  styles: []
})
export class MrbauUserinfoProfilePictureComponent implements OnInit {
  @Input() userName : string;
  @Input() avatarId : string;
  constructor(
    private _mrbauCommonService: MrbauCommonService
  ) { }

  ngOnInit(): void {
  }

  getUserProfileImage()
  {
    return this._mrbauCommonService.getUserProfileImage(this.avatarId);
  }

}
