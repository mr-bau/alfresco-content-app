import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class MrbauExportService {

  constructor(
    private datePipe: DatePipe,
  ) { }

  private delimiter = ';';
  private lineBreak = '\r\n';
  private utfBOM = '\uFEFF';

  downloadData(labelData : any[], tableData : any[], fileName : string)  {
    const replacer = (key :any, value:any) => {key; return (value === null) ? '' : value;} // specify how you want to handle null values here

    if (tableData.length == 0) {
      window.alert('NO_DATA_TO_EXPORT');
      return;
    }

    let csv = tableData.map((row) =>
      /*{console.log(row);
      console.log(row.map((val) => {
        return JSON.stringify(val, replacer)
      }).join(this.delimiter));
      return row;
      }*/
      row.map((val) => {
        return JSON.stringify(val, replacer)
      })
      .join(this.delimiter)
    );

    csv.unshift(labelData.join(this.delimiter));
    const csvArray = csv.join(this.lineBreak);
    const blob = new Blob([this.utfBOM, csvArray], { type: 'text/csv' });
    blob;this.getFileName; replacer; fileName; saveAs;
    saveAs(blob, this.getFileName(fileName,'.csv'));
  }

  private getFileName(name : string, ext?:string) {
    const now = this.datePipe.transform(new Date(), 'YYMMdd-HHMMSS')
    return `${name} ${now}${ext}`;
  }
}
