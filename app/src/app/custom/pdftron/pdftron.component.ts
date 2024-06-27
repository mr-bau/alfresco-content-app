import { Component, ViewChild, OnInit, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges, SecurityContext, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IFileSelectData } from '../tasks/tasks.component';
import { ContentApiService } from '@alfresco/aca-shared';
import { MrbauNodeService } from '../services/mrbau-node.service';
import { MrbauCommonService } from '../services/mrbau-common.service';
import { HttpHeaders } from '@angular/common/http';
import * as MrbauStamps from './mrbau.stamps';
import { DatePipe } from '@angular/common';
import { ContentService } from '@alfresco/adf-core';
import { EMRBauVerifiedInboundInvoiceType, MRBauVerifiedInboundInvoiceTypes } from '../mrbau-doc-declarations';

declare const WebViewer: any;

interface ISVGData {
  path: string,
  icon: string,
  tooltip: string,
  svg?: string,
  width?: number,
  height?: number
  patchFunction? : IPatchFunction,
};

interface IPatchFunction {
  (a: string): Promise<string>;
}

@Component({
  selector: 'aca-pdftron',
  templateUrl: './pdftron.component.html',
  styleUrls: ['./pdftron.component.scss']
})
export class PdftronComponent implements OnInit, AfterViewInit, OnChanges {
  // Syntax if using Angular 8+
  // true or false depending on code
  @ViewChild('viewer', {static: true}) viewer: ElementRef;
  @Input() fileSelectData: IFileSelectData;
  previousFileSelectData : IFileSelectData | null = null;
  sanitized_document_url: SafeResourceUrl = null;
  isPDFFile = true;
  private modified = false;
  loaderVisible = false;
  // Syntax if using Angular 7 and below
  //@ViewChild('viewer') viewer: ElementRef;

  customStamps : any[] = [];
  readonly STAMP_FOLDER_PATH = 'Vorlagen/Stempel/';

  wvInstance: any;
  constructor(
    private sanitizer: DomSanitizer,
    private contentApiService : ContentApiService,
    private contentService : ContentService,
    private mrbauNodeService : MrbauNodeService,
    private mrbauCommonService : MrbauCommonService,
    private datePipe : DatePipe,
    private changeDetectorRef: ChangeDetectorRef
  ){
    this.sanitizer;
    this.contentService;
    //SecurityContext;
  }

  ngOnInit() {
    this.documentModified = this.documentModified.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fileSelectData) {
      if (this.previousFileSelectData == null) {
        this.previousFileSelectData = changes.fileSelectData.previousValue;
      }
      this.onFileSelected();
    }
  }

  async ngAfterViewInit(): Promise<void> {
    // The following code initiates a new instance of WebViewer.
    await this.loadSVGStamps();

    WebViewer({
      path: '../..'+location.pathname+'wv-resources/lib',
      licenseKey: 'demo:1712755081824:7f15e134030000000055b9b826f68203ea09c327fac3598037aca85361', // sign up to get a key at https://dev.apryse.com
      //initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf'
      fullAPI: true
    }, this.viewer.nativeElement).then(instance => {
      this.wvInstance = instance;

      // now you can access APIs through this.webviewer.getInstance()
      // instance.UI.openElement('notesPanel');
      // see https://docs.apryse.com/documentation/web/guides/ui/apis/
      // for the full list of APIs

      // or listen to events from the viewer element
      // this.viewer.nativeElement.addEventListener('pageChanged', (e) => { const [ pageNumber ] = e.detail; console.log(`Current page is ${pageNumber}`); });

      // or from the docViewer instance
      // instance.Core.documentViewer.addEventListener('annotationsLoaded', () => { console.log('annotations loaded'); });
      // instance.Core.documentViewer.addEventListener('documentLoaded', this.wvDocumentLoadedHandler)

      instance.Core.annotationManager.addEventListener('annotationChanged', this.documentModified);
      instance.Core.annotationManager.addEventListener('fieldChanged', this.documentModified);
      instance.Core.documentViewer.addEventListener('layoutChanged', this.documentModified);
      instance.Core.documentViewer.addEventListener('toolModeUpdated', this.toolUpdated.bind(this))

      this.customizeUI();

      this.onFileSelected();
    })
  }

  svgEscapeUmlaute(text:string) : string {
    text = text.replace(/Ä/g, '&#196;');
    text = text.replace(/ä/g, '&#228;');
    text = text.replace(/Ö/g, '&#214;');
    text = text.replace(/ö/g, '&#246;');
    text = text.replace(/Ü/g, '&#220;');
    text = text.replace(/ü/g, '&#252;');
    text = text.replace(/ß/g, '&#223;');
    text = text.replace(/§/g, '&#167;');
    text = text.replace(/®/g, '&#174;');
    text = text.replace(/©/g, '&#169;');
    return text;
  }

  async svgPatchCurrentDate(svgData :string) : Promise<string> {
    return new Promise<string>(async (resolve) => {
      let dateAsString = this.datePipe.transform(new Date(), 'dd. MMM yyyy');
      dateAsString = this.svgEscapeUmlaute(dateAsString);
      svgData = svgData.replace('DATE', dateAsString);
      resolve(svgData);
      return;
    });
  }

  async svgPatchArchiveDate(svgData :string) : Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const node = await this.contentService.getNode(this.fileSelectData.nodeId).toPromise();
        const date = new Date(node.entry.properties['mrba:archivedDateValue']);
        let dateAsString = this.datePipe.transform(date, 'dd. MMM yyyy');
        dateAsString = this.svgEscapeUmlaute(dateAsString);
        svgData = svgData.replace('DATE', dateAsString);
        resolve(svgData);
        return;
      }
      catch (error) {
        reject(error)
      }
    });
  }

  async svgPatchDocumentProperties(svgData :string) : Promise<string> {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const { annotationManager } = this.wvInstance.Core;
        const dateAsString = this.datePipe.transform(new Date(), 'dd. MMM yyyy');
        interface IProps {name:string, value:string};
        const propNames : string[] = ["mrba:costCarrierNumber", "mrba:projectName", "mrba:reviewDaysFinalInvoice", "mrba:reviewDaysPartialInvoice", "mrba:verifyDate", "mrba:verifyDate", "mrba:grossAmountVerified"];
        const props : IProps[] = [];
        props.push({name:'DATE', value:dateAsString});
        if (this.fileSelectData?.nodeId)
        {
          const node = await this.contentService.getNode(this.fileSelectData.nodeId).toPromise();
          for (let i=0; i< propNames.length; i++) {
            const name = propNames[i];
            let value = (node.entry.properties[name]) ? (node.entry.properties[name]) : '';
            props.push({name:name, value:value});
          }
          let review_days = ''
          if (node.entry.properties["mrba:reviewDaysPartialInvoice"]) {
            review_days = node.entry.properties["mrba:reviewDaysPartialInvoice"]+'T TR';
          }
          if (node.entry.properties["mrba:reviewDaysFinalInvoice"]) {
            if (review_days.length == 0)
              review_days = node.entry.properties["mrba:reviewDaysFinalInvoice"]+'T';
            else
              review_days += ' / '+node.entry.properties["mrba:reviewDaysFinalInvoice"]+'T SR';
          }
          props.push({name:'REVIEW_DAYS', value:review_days});

          let payment_conditions = ['','',''];
          if (node.entry.properties['mrba:verifiedInboundInvoiceType']
              && node.entry.properties['mrba:verifiedInboundInvoiceType'].length > 0
              && node.entry.properties['mrba:verifiedInboundInvoiceType'] != MRBauVerifiedInboundInvoiceTypes.get(EMRBauVerifiedInboundInvoiceType.UEBERWEISUNG).value) {
            // Abbucher, intern,etc.
            payment_conditions[0] = node.entry.properties['mrba:verifiedInboundInvoiceType'];
          }
          else
          {
            let i = 0;
            if (node.entry.properties['mrba:earlyPaymentDiscountDays1']) {
              payment_conditions[i] = node.entry.properties['mrba:earlyPaymentDiscountDays1']+'T -'+node.entry.properties['mrba:earlyPaymentDiscountPercentNumericValue1']+'%';
              i++;
            }
            if (node.entry.properties['mrba:earlyPaymentDiscountDays2']) {
              payment_conditions[i] = node.entry.properties['mrba:earlyPaymentDiscountDays2']+'T -'+node.entry.properties['mrba:earlyPaymentDiscountPercentNumericValue2']+'%';
              i++;
              if (i == 2 && new Date(node.entry.properties['mrba:earlyPaymentDiscountDays1Value']) > new Date(node.entry.properties['mrba:earlyPaymentDiscountDays2Value']))
              {
                let temp = payment_conditions[0];
                payment_conditions[0] = payment_conditions[1];
                payment_conditions[1] = temp;
              }
            }
            if (node.entry.properties['mrba:paymentTargetDays']) {
              payment_conditions[i] = node.entry.properties['mrba:paymentTargetDays']+'T NETTO';
              i++;
            }
          }
          props.push({name:'PAYMENT_CONDITIONS_1', value:payment_conditions[0]});
          props.push({name:'PAYMENT_CONDITIONS_2', value:payment_conditions[1]});
          props.push({name:'PAYMENT_CONDITIONS_3', value:payment_conditions[2]});
          let payment_dates = ['','',''];
          if (node.entry.properties['mrba:verifiedInboundInvoiceType']
              && node.entry.properties['mrba:verifiedInboundInvoiceType'].length > 0
              && node.entry.properties['mrba:verifiedInboundInvoiceType'] != MRBauVerifiedInboundInvoiceTypes.get(EMRBauVerifiedInboundInvoiceType.UEBERWEISUNG).value) {
            // Abbucher, intern,etc.
            payment_dates[0] = node.entry.properties['mrba:verifiedInboundInvoiceType'];
          }
          else
          {
            let i = 0;
            if (node.entry.properties['mrba:paymentDateDiscount1']) {
              const discount = node.entry.properties['mrba:earlyPaymentDiscountPercentNumericValue1'] || '';
              payment_dates[i] = node.entry.properties['mrba:paymentDateDiscount1']+' -'+discount+'%';
              i++;
            }
            if (node.entry.properties['mrba:paymentDateDiscount2']) {
              const discount = node.entry.properties['mrba:earlyPaymentDiscountPercentNumericValue2'] || '';
              payment_dates[i] = node.entry.properties['mrba:paymentDateDiscount2']+' -'+discount+'%';
              i++;
              if (i == 2 && new Date(node.entry.properties['mrba:paymentDateDiscount1Value']) > new Date(node.entry.properties['mrba:paymentDateDiscount2Value']))
              {
                const temp = payment_dates[0];
                payment_dates[0] = payment_dates[1];
                payment_dates[1] = temp;
              }
            }
            if (node.entry.properties['mrba:paymentDateNet']) {
              payment_dates[i] = node.entry.properties['mrba:paymentDateNet']+' NETTO';
              i++;
            }
          }
          props.push({name:'PAYMENT_1', value:payment_dates[0]});
          props.push({name:'PAYMENT_2', value:payment_dates[1]});
          props.push({name:'PAYMENT_3', value:payment_dates[2]});
          props.push({name:'AUTHOR', value: annotationManager.getCurrentUser()});
        }
        // patch svg
        for (let i=0; i<props.length;i++) {
          const prop = props[i];
          if (typeof prop.value === 'string') {
            prop.value = this.svgEscapeUmlaute(prop.value)
          }
          svgData = svgData.replace(prop.name, prop.value);
        }
        resolve(svgData);
        return;
      }
      catch (error) {
        console.log(error);
        reject(error);
        return;
      }
    });
  }

  svgStamps : ISVGData[] = [
    /*
    {path : 'wv-resources/lib/ui/assets/icons/mrbau-stamp-eingelangt.svg', patchFunction : this.svgPatchArchivDate.bind(this), icon: MrbauStamps.SVG_ICON_MR_S1, tooltip: 'M&R Eingelangt'},
    {path : 'wv-resources/lib/ui/assets/icons/mrbau-stamp-eingang.svg', patchFunction: this.svgPatchArchivDate.bind(this), icon:  MrbauStamps.SVG_ICON_MR_S2, tooltip: 'M&R Eingang'},
    {path : 'wv-resources/lib/ui/assets/icons/mrbau-stamp-Rechnungkorrektur1.svg', patchFunction: this.svgPatchDocumentProperties.bind(this), icon :  MrbauStamps.SVG_ICON_MR_S3, tooltip: 'M&R Prüfstempel 1'},
    {path : 'wv-resources/lib/ui/assets/icons/mrbau-stamp-Rechnungkorrektur2.svg', patchFunction: this.svgPatchDocumentProperties.bind(this), icon :  MrbauStamps.SVG_ICON_MR_S4, tooltip: 'M&R Prüfstempel 2'},
    */
    {path : 'assets/mrbau-extension/svg/mrbau-stamp-eingelangt.svg', patchFunction : this.svgPatchArchiveDate.bind(this), icon: MrbauStamps.SVG_ICON_MR_S1, tooltip: 'M&R Eingelangt'},
    {path : 'assets/mrbau-extension/svg/mrbau-stamp-eingang.svg', patchFunction: this.svgPatchArchiveDate.bind(this), icon:  MrbauStamps.SVG_ICON_MR_S2, tooltip: 'M&R Eingang'},
    {path : 'assets/mrbau-extension/svg/mrbau-stamp-formal.svg', patchFunction: this.svgPatchDocumentProperties.bind(this), icon :  MrbauStamps.SVG_ICON_MR_S3, tooltip: 'M&R Prüfstempel 1'},
    {path : 'assets/mrbau-extension/svg/mrbau-stamp-pruefung.svg', patchFunction: this.svgPatchDocumentProperties.bind(this), icon :  MrbauStamps.SVG_ICON_MR_S4, tooltip: 'M&R Prüfstempel 2'},
  ];

  async loadSVGStamps() {
    const headers = new HttpHeaders();
    headers.set('Accept', 'image/svg+xml');
    for (let i=0; i<this.svgStamps.length;i++) {
      const stamp = this.svgStamps[i];
      //const svgString = await this.httpClient.get(stamp.path, {headers, responseType: 'text'}).toPromise();
      try {
        const response = await fetch(stamp.path);
        let svgString = await response.text();
        // extract size and patch svg size to improve quality
        const searchStrings = ['width', 'height'];
        for (let index = 0; index < searchStrings.length; index++) {
          const searchString = searchStrings[index];
          let start = svgString.indexOf(searchString+'="');
          start += searchString.length+2;
          let end = svgString.indexOf('"', start);
          const lengthSvg = svgString.substring(start, end);
          if (lengthSvg.endsWith('mm'))
          {
            const lengthSvgNumberText = lengthSvg.replace(/\D/g, '');
            const lengthSvgNumber = +lengthSvgNumberText;
            stamp[searchString] = lengthSvgNumber;
            svgString =  svgString.substring(0, start)+lengthSvgNumber*MrbauStamps.SVG_QUALITY_FACTOR+svgString.substring(end);
          }
        }
        stamp.svg = svgString;
      }
      catch (error)
      {
        console.log(error);
      }
    }
  }

  // see also https://groups.google.com/g/pdfnet-webviewer/c/tM--7GW5MP8
  customizeUIMRStamps() {
    const { Annotations, annotationManager, Tools, documentViewer } = this.wvInstance.Core;

    const XFDF_NAME='stamp';  //const XFDF_NAME='mrbau_stamp_annotation'
    interface IMRBauStampParamater {
      svgStamp : ISVGData
    }
    class MRBauCustomStampAnnotation extends Annotations.StampAnnotation  {
      mrbau_parameter : IMRBauStampParamater | undefined;
      constructor(mrbau_parameter: IMRBauStampParamater) {
        super(XFDF_NAME); // Provide the custom XFDF element name. You can provide an object initializer as a second parameter.
        this.mrbau_parameter = mrbau_parameter;
        this.Subject = 'MRBauCustomStampAnnotation';
      }

      setFixedSize() {
        const stamp = this.mrbau_parameter.svgStamp;
        this.Width = stamp.width*MrbauStamps.SCALE_FACTOR_MM_TO_POINTS;
        this.Height = stamp.height*MrbauStamps.SCALE_FACTOR_MM_TO_POINTS;
        const rotation = documentViewer.getCompleteRotation(this.PageNumber) * 90;
        this.Rotation = rotation;
        if (rotation === 270 || rotation === 90) {
          this.Width = stamp.height*MrbauStamps.SCALE_FACTOR_MM_TO_POINTS;
          this.Height = stamp.width*MrbauStamps.SCALE_FACTOR_MM_TO_POINTS;
        }
        this.X -= this.Width/2;
        this.Y -= this.Height/2
      }

      async initAnnotation() {
        if (!this.mrbau_parameter.svgStamp)
          return;

        this.Author = annotationManager.getCurrentUser();
        this.NoResize = true;
        this.setFixedSize();

        let svgData = this.mrbau_parameter.svgStamp.svg;
        let svgDataUrl = svgData;
        // patch svg
        if (typeof svgData === 'string' && !svgData.startsWith('data:image')) {
          svgData = await this.mrbau_parameter.svgStamp.patchFunction(svgData);
          const svgDataBase64 = btoa(svgData as string);
          svgDataUrl = 'data:image/svg+xml;base64,'+svgDataBase64;
        }

        await this.setImageData(svgDataUrl);
      }
    }

    class MRBauCustomStampAnnotationCreateTool extends Tools.GenericAnnotationCreateTool {
      constructor(documentViewer, param: IMRBauStampParamater) {
        super(documentViewer, MRBauCustomStampAnnotation, param);
      }
      mouseLeftDown(e) {
        e;
        Tools.AnnotationSelectTool.prototype.mouseLeftDown.apply(this, arguments);
      };
      mouseMove(e) {
        e;
        Tools.AnnotationSelectTool.prototype.mouseMove.apply(this, arguments);
      };
      async mouseLeftUp(e) {
        let annotationReference;
        Tools.GenericAnnotationCreateTool.prototype.mouseLeftDown.call(this, e);
        if (this.annotation) {
          await this.annotation.initAnnotation();
          annotationReference = this.annotation;
        }
        Tools.GenericAnnotationCreateTool.prototype.mouseLeftUp.call(this, e);
        if (annotationReference) {
          /* workaround for testing
          if (42 < 0) {
            // clone into StampAnnotation
            const stampAnnotation = new Annotations.StampAnnotation({
              PageNumber: annotationReference.PageNumber,
              X: annotationReference.X,
              Y: annotationReference.Y,
              Width: annotationReference.Width,
              Height: annotationReference.Height,
              NoResize:annotationReference.NoResize,
              Rotation:annotationReference.Rotation,
            });
            const data = await annotationReference.getImageData();
            await stampAnnotation.setImageData(data); // Base64 URL or SVG
            annotationManager.addAnnotation(stampAnnotation);
            annotationManager.redrawAnnotation(stampAnnotation);
            annotationManager.selectAnnotation(stampAnnotation);
          }
          else */
          {
            annotationManager.redrawAnnotation(annotationReference);
            annotationManager.selectAnnotation(annotationReference);
          }
        }
      };
    };

    // This is necessary to set the elementName before instantiation
    MRBauCustomStampAnnotation.prototype.elementName = XFDF_NAME;
    annotationManager.registerAnnotationType(MRBauCustomStampAnnotation.prototype.elementName, MRBauCustomStampAnnotation);

    // Register tool
    for (let i=0; i<this.svgStamps.length; i++) {
      const mrbauStampToolName = 'MRBauAnnotationCustomStamp'+i;
      const mrbauCustomStampTool = new MRBauCustomStampAnnotationCreateTool(documentViewer, {svgStamp: this.svgStamps[i]});
      const myTool = {
        toolName: mrbauStampToolName,
        toolObject: mrbauCustomStampTool,
        buttonImage: this.svgStamps[i].icon,
        buttonGroup: 'mrbauStampToolGroup',
        //buttonName: 'mrbauCustomStampToolButton',
        tooltip: this.svgStamps[i].tooltip,
        showColor: 'never',
        showPresets: true
      };
      this.wvInstance.UI.registerTool(myTool, MRBauCustomStampAnnotation);
    }

    const mrbauToolGroupButton = {
      type: 'toolGroupButton',
      //toolGroup: 'rubberStampTools',
      toolGroup: 'mrbauStampToolGroup',
      //dataElement: 'mrbauStampToolGroupButton',
      title: 'M&R Stempel',
      img: MrbauStamps.SVG_ICON_MR,
    };

    this.wvInstance.UI.setHeaderItems(header => {
      const item = header
        .getHeader('toolbarGroup-Insert')
        .get('rubberStampToolGroupButton');
        item.insertBefore(mrbauToolGroupButton);
    });
  }

  private onFileSelected() {
    if (this.modified && this.previousFileSelectData != null) {
      this.previousFileSelectData = null;
      //this.openModal(this.mrbauModalSaveYesNo);
      //return;
    }

    this.modified = false;

    if (!this.fileSelectData) {
      this.sanitized_document_url = null;
      if (this.wvInstance) {
        this.wvInstance.UI.closeDocument();
      }
      return;
    }

    if (this.fileSelectData.versionId)
    {
      this.loadUrl(this.contentApiService.getVersionContentUrl(this.fileSelectData.nodeId, this.fileSelectData.versionId));
    }
    else
    {
      this.loadUrl(this.contentApiService.getContentUrl(this.fileSelectData.nodeId));
    }
  }

  private loadUrl(fileUrl : string)
  {
    this.modified = false;
    if (fileUrl == null)
    {
      this.sanitized_document_url = null;
    }
    else {
      this.sanitized_document_url = this.sanitizeUrl(fileUrl);
    }
    this.loadPdf(this.sanitized_document_url);
  }

  private sanitizeUrl(url:string) : SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  documentModified(info:any): void {
    // see https://www.pdftron.com/api/web/WebViewerInstance.html for the full list of low-level APIs
    // https://community.apryse.com/t/detect-any-pdf-modifications/5347/3
    for(let i=0; i<info?.length; i++) {
      if (!info[i].isImporting) {
        if (this.modified == false) {
          this.modified = true;
        }
        return;
      }
    }
  }

  toolUpdated(info:any): void {
    const elements = [ 'colorPalette', 'opacitySlider', 'strokeThicknessSlider'];

    if (this.wvInstance && info && info.name && info.name.startsWith('MRBauAnnotationCustomStamp'))
    {
      this.wvInstance.UI.disableElements(elements);
      //this.wvInstance.UI.disableElements(['toolsOverlay']);
    }
    else
    {
      this.wvInstance.UI.enableElements(elements);
    }
  }

  loadPdf(url:SafeResourceUrl) {
    if (!this.wvInstance) {
      return;
    }
    if (url === null)
    {
      return;
    }
    const pdfSrc = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
    this.toggleSpinner(true);
    this.wvInstance.UI.loadDocument(pdfSrc, {extension:'pdf'});
    this.toggleSpinner(false);
  }

  addModalDialog(headerText:string, bodyText:string, name: string) {
    // Custom modal parameters
    const modalOptions = {
      dataElement: name,
      disableBackdropClick: true,
      header: {
        title: headerText,
        className: 'mrbauCustomModal-header',
      },
      body: {
        className: 'mrbauCustomModal-body',
        style: {},
        children: [ {title: bodyText}],
      },
      footer: {
        className: 'mrbauCustomModal-footer footer',
        style: {},
        children: [
          {
            title: 'OK',
            button: true,
            style: {},
            className: 'modal-button confirm ok-btn',
            onClick: (e) => {
              e;
              this.wvInstance.UI.closeElements([modalOptions.dataElement]);
            }
          },
        ]
      }
    }
    this.wvInstance.UI.addCustomModal(modalOptions);
  }

  addModalYesNoDialog(headerText:string, bodyText:string, name: string) {
    const modalOptions = {
      dataElement: name,
        disableBackdropClick: true,
        header: {
          title: headerText,
          className: 'mrbauCustomModal-header',
        },
        body: {
          className: 'mrbauCustomModal-body',
          style: {},
          children: [ {title: bodyText}],
        },
      footer: {
        className: 'myCustomModal-footer footer',
        style: {},
        children: [
          {
            title: 'Nein',
            button: true,
            style: {},
            className: 'modal-button cancel-form-field-button',
            onClick: (e) => {
              e;
              this.modified = false;
              this.wvInstance.UI.closeElements([modalOptions.dataElement]);
              this.previousFileSelectData = null;
              this.onFileSelected();
            }
          },
          {
            title: 'Ja',
            button: true,
            style: {},
            className: 'modal-button confirm ok-btn',
            onClick: async (e) => {
              e;
              this.wvInstance.UI.closeElements([modalOptions.dataElement]);
              await this.doUploadDocumentToDMS(this.previousFileSelectData);
              this.previousFileSelectData = null;
              this.onFileSelected();
            }
          },
        ]
      }
    }
    this.wvInstance.UI.addCustomModal(modalOptions);
  }

  openModal(name:string, ) {
    this.wvInstance.UI.openElements([name]);
  }

  mrbauModalNoChange = "mrbauModalNoChange";
  mrbauModalNoNodeId = "mrbauModalNoNodeId";
  mrbauModalUploadOK = "mrbauModalUploadOK";
  mrbauModalUploadError = "mrbauModalUploadError";
  mrbauModalSaveYesNo = "mrbauModalSaveYesNo";

  customizeUI() {
    const {annotationManager } = this.wvInstance.Core;

    this.mrbauCommonService.getCurrentUser()
    .then((user) => {
      annotationManager.setCurrentUser(user.entry.displayName);
    })
    .catch(error => {
      console.log(error);
    });

    this.customizeDefaults();

    // Add header button that will get file data on click
    this.wvInstance.UI.settingsMenuOverlay.add({ type: 'actionButton', label: 'Flatten PDF',  img: MrbauStamps.SVG_ICON_FLATTEN, className:"row", onClick: async () => { this.flattenDocument(); }});
    this.wvInstance.UI.settingsMenuOverlay.add({ type: 'actionButton', label: 'Änderungen im DMS speichern', img: MrbauStamps.SVG_ICON_CLOUD_UPLOAD, className:"row", onClick: async () => { this.doUploadDocumentToDMS(this.fileSelectData); }});
    this.wvInstance.UI.setHeaderItems(header => {
      header.get('leftPanelButton').insertBefore({ type: 'actionButton', title: 'Änderungen im DMS speichern', img: MrbauStamps.SVG_ICON_CLOUD_UPLOAD, onClick: async () => { this.doUploadDocumentToDMS(this.fileSelectData); }});
    });

    this.addModalDialog("Upload abgebrochen", "Es wurden keine Änderungen durchgeführt", this.mrbauModalNoChange);
    this.addModalDialog("Upload abgebrochen", "Node Id fehlt.", this.mrbauModalNoNodeId);
    this.addModalDialog("Upload erfolgreich", "Dokument als neue Version gespeichert.", this.mrbauModalUploadOK);
    this.addModalDialog("Upload Fehler", "Upload Fehler!", this.mrbauModalUploadError);
    this.addModalYesNoDialog("Änderungen Speichern", "Sollen die Änderungen als neue Version gespeichert werden?",this.mrbauModalSaveYesNo)
    this.customizeUIStamps();
    this.customizeUIMRStamps();
    this.customizeSignatureTool();
  }

  async customizeSignatureTool() {
    this.customStamps = [];
    const nodeUrls = []

    const { documentViewer } = this.wvInstance.Core;
    const signatureTool = documentViewer.getTool('AnnotationCreateSignature');

    try {
      const node = await this.contentApiService.getNodeChildren('-my-', {relativePath: this.STAMP_FOLDER_PATH}).toPromise();
      for (let i = 0; i < node.list.entries.length; i++) {
        const result = node.list.entries[i];
        if (result.entry.isFile && result.entry.content.mimeType == "image/png") {
          const nodeId = result.entry.id;
          nodeUrls.push(this.contentApiService.getContentUrl(nodeId));
        }
      }
    } catch(error) {
      //console.log(error);
    };

    if (nodeUrls.length ==0)
    {
      return;
    }

    this.wvInstance.UI.setMaxSignaturesCount(nodeUrls.length + 1);
    documentViewer.addEventListener('documentLoaded', () => {
      signatureTool.importSignatures(this.customStamps);
    });

    for (let i=0; i< nodeUrls.length; i++) {
      const res = await fetch(nodeUrls[i]);
      const imageBlob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result;
        this.customStamps.push(base64data);
      }
      reader.readAsDataURL(imageBlob);
    }
  }

  customizeDefaults() {
    const { documentViewer } = this.wvInstance.Core;

    this.wvInstance.UI.setLanguage('de');

    const theme = this.wvInstance.UI.Theme;
    this.wvInstance.UI.setTheme(theme.DARK);

    const tool = documentViewer.getTool('AnnotationCreateFreeText');
    tool.defaults.Font = "Roboto";
    tool.defaults.FontSize = "12pt";
  }

  customizeUIStamps() {
    const { documentViewer, Annotations } = this.wvInstance.Core;

    // Custom stamps
    const tool = documentViewer.getTool('AnnotationCreateRubberStamp');
    const customStamps = [
      //{ title: "Eingang", subtitle: "[$currentUser] DD.MM.YYYY, hh:mm", color: new Annotations.Color('#5656D6'), textColor: new Annotations.Color(255,255,255, 1.0), font: "robo" },
      { title: "Geprüft", subtitle: "[$currentUser] DD.MM.YYYY, hh:mm", color: new Annotations.Color('#5656D6'), font: "robo" },
      { title: "Gebucht", subtitle: "[$currentUser] DD.MM.YYYY, hh:mm", color: new Annotations.Color('#D65656'), font: "robo"},
    ]
    tool.setCustomStamps(customStamps)

    // Standard stamps
    //const pathToLogo = 'assets/icons/stamp-eingelangt.svg';
    tool.setStandardStamps([
      //pathToLogo,
      'Approved',
      'NotApproved',
      'Completed',
      'Confidential',
      'SHSignHere',
      'SHWitness',
      'SHInitialHere',
      'SHAccepted',
      'SBRejected',
    ]);
  }

  async flattenDocument() {
    const { documentViewer, PDFNet, annotationManager } = this.wvInstance.Core;

    this.wvInstance.UI.closeElements([ 'menuOverlay' ]);

    await PDFNet.initialize();
    const doc = await documentViewer.getDocument().getPDFDoc();

    // export annotations from the document
    const annots = await annotationManager.exportAnnotations();

    // Run PDFNet methods with memory management
    await PDFNet.runWithCleanup(async () => {

      // lock the document before a write operation
      // runWithCleanup will auto unlock when complete
      doc.lock();

      // import annotations to PDFNet
      const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(annots);
      await doc.fdfUpdate(fdf_doc);

      // flatten all annotations in the document
      await doc.flattenAnnotations();

      // or optionally only flatten forms
      // await doc.flattenAnnotations(true);

      // clear the original annotations
      annotationManager.deleteAnnotations(annotationManager.getAnnotationsList());

      // optionally only clear widget annotations if forms were only flattened
      // const widgetAnnots = annots.filter(a => a instanceof Annotations.WidgetAnnotation);
      // annotationManager.deleteAnnotations(widgetAnnots);
    });

    // clear the cache (rendered) data with the newly updated document
    documentViewer.refreshAll();

    // Update viewer to render with the new document
    documentViewer.updateView();

    // Refresh searchable and selectable text data with the new document
    documentViewer.getDocument().refreshTextData();
  }

  toggleSpinner(val:boolean) {
    this.loaderVisible = val;
    this.changeDetectorRef.detectChanges();
  }

  async doUploadDocumentToDMS(fileSelectData : IFileSelectData) {
    const { documentViewer, annotationManager } = this.wvInstance.Core;

    this.wvInstance.UI.closeElements([ 'menuOverlay' ]);

    if (this.modified == false) {
      this.openModal(this.mrbauModalNoChange);
      return;
    }

    if (!fileSelectData || !fileSelectData.nodeId) {
      this.openModal(this.mrbauModalNoNodeId);
      return;
    }
    this.toggleSpinner(true);
    const doc = documentViewer.getDocument();
    const xfdfString = await annotationManager.exportAnnotations();
    const data = await doc.getFileData({
      // saves the document with annotations in it
      xfdfString
    });
    const arrayBuffer = new Uint8Array(data);
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

    // Add code for handling Blob here
    await this.mrbauNodeService.updateNodeContent(fileSelectData.nodeId, blob, false, 'PDF Annotation')
    .then(result => {
      result;
      //this.mrbauCommonService.showInfo("Dokument erfolgreich gespeichert.");
      this.toggleSpinner(false);
      this.openModal(this.mrbauModalUploadOK);
      this.modified = false;
    })
    .catch(error => {
      this.toggleSpinner(false);
      this.mrbauCommonService.showError(error);
      this.openModal(this.mrbauModalUploadError);
      console.log(error)
    })
  }
}
