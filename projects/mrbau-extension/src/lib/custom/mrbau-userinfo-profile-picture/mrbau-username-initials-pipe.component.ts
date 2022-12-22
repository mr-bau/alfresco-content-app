import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'mrbauUsernameInitialsPipe'})
export class MrbauUsernameInitialsPipe implements PipeTransform {
  transform(name : string, ...args: any[]): string {
    args;
    const nameParts = name.split(' ');
    if (nameParts.length == 1)
    {
      return nameParts[0][0];
    }
    return nameParts[0][0]+nameParts[nameParts.length-1][0];
  }
}
