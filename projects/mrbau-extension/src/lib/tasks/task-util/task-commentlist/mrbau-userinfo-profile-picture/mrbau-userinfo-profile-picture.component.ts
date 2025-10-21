import { Component, Input, OnInit } from '@angular/core';
import { MrbauCommonService } from '../../../../services/mrbau-common.service';
import { CommonModule } from '@angular/common';
import { MrbauUsernameInitialsPipe } from './mrbau-username-initials-pipe.component';

@Component({
  standalone:true,
  imports:[
    CommonModule,
    MrbauUsernameInitialsPipe,
    ],
  selector: 'mrbau-userinfo-profile-picture',
  template: `
  <div *ngIf="avatarId; else userInfoInitialsTemplate" class="mrbau-userinfo-profile-container">
    <img [src]="getUserProfileImage()" alt="user-info-profile-picture" class="mrbau-userinfo-profile-image"/>
  </div>
  <ng-template #userInfoInitialsTemplate>
    <div class="mrbau-userinfo-pic">{{userName | mrbauUsernameInitialsPipe}}</div>
  </ng-template>
  `,
  styleUrls: ['./mrbau-userinfo-profile-picture.component.scss']
})
export class MrbauUserinfoProfilePictureComponent implements OnInit {
  @Input() userName : string = "";
  @Input() avatarId : string = "";
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
