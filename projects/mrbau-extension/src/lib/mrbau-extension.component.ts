import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'lib-mrbau-extension',
  templateUrl: './mrbau-extension.component.html',
  styleUrls: ['./mrbau-extension.component.scss'],

  template: `
  <div id="main">
  <h2>Fördermanager</h2>

    <p>
      mrbau-extension works!
    </p>

    <span><img class="textIcon" src="./assets/images/ft_ic_folder_shortcut_link.svg" alt="Eigenschaften"> <a href="/#/personal-files/details/{{row.id}}">Link zu den Ordner-Eigenschaften</a></span>
  `,
  styles: [
  ]
})
export class MrbauExtensionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
