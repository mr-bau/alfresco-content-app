import { AuthenticationService } from '@alfresco/adf-core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export class MrbauAuthGuard  implements CanActivate, CanActivateChild {

  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
  ){}

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree>
  {
    return this.canActivate(childRoute, state);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree>
  {
    route;
    state;
    console.log(route);
    console.log
    if (this.authenticationService.getEcmUsername() == "Wolfgang Moser")
    {
      return Promise.resolve(true);
    }
    this.router.navigate( ['home']);
    return Promise.resolve(false);
  }

}
