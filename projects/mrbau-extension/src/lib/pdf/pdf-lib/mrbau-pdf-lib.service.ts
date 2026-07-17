import { Injectable } from '@angular/core';
import { PDFDocument, PDFFont, PDFPage, PageSizes, StandardFonts, TextAlignment, clip, degrees, endPath, layoutMultilineText, popGraphicsState, pushGraphicsState, rectangle, rgb } from 'pdf-lib';
import { Node } from '@alfresco/js-api';
import { MrbauCalcService } from '../../services/mrbau-calc.service';
import { MrbauCommonService } from '../../services/mrbau-common.service';

/*
    TODO underline
    TODO Automatischer Seitenumbruch?
*/

// 72 Points = 1 Inch (Zoll)
// 1 Inch = 25.4 mm
export const MM_TO_POINT = 72 / 25.4; // ca. 2.83465
export const POINT_TO_MM = 25.4 / 72; // ca. 0.35278

export enum EPDFCellFlags {
  Left = 0,
  Right = 1,
  Centered = 2,
  Multiline = 4,
  Bold = 8,
  Oblique = 16,
  ExtraSpaceAfter = 32
}
export type PDFCellFlags = EPDFCellFlags;

export enum EPDFBorderFlags {
  None = 0,
  Top = 1,
  Right= 2,
  Bottom=4,
  Left=8,
  Inner=16,
  TopBottom = Top | Bottom,
  RightLeft = Right | Left,
  Outline = Top | Right | Bottom | Left,
  Upper = Top | Left | Right,
  Lower = Bottom | Left | Right,
  All = Outline | Inner,
}
export type PDFBorderFlags = EPDFBorderFlags;

export interface IPDFTemplateLine {
  line?: (string | null)[];
  condition?: string;
  colWeight?: number[];
  fontSize?: number | number[];
  lineHeight?: number;
  flags?: PDFCellFlags[] | PDFCellFlags;
  extraSpaceY?: number;
  cellBorder?: PDFBorderFlags[] | EPDFBorderFlags;
  border?: PDFBorderFlags
}

export interface IPDFTemplate {
  title: string,
  company?: string[],
  lines: IPDFTemplateLine[];
}

export interface PDFTemplateData {
  node : Node;
  [key: string]: any;
}

export interface PDFState {
    pdfDoc: PDFDocument,
    page: PDFPage,
    font: PDFFont,
    fontBold: PDFFont,
    fontOblique: PDFFont,
    fontSize: number,
    lineHeight: number,
    marginLeft: number,
    marginRight: number,
    marginTop: number,
    marginBottom: number,
  }

@Injectable({
  providedIn: 'root' // Singleton service, available application-wide
})
export class MrbauPdfLibService {
  constructor(
    private mrbauCalcService : MrbauCalcService,
    private mrbauCommonService : MrbauCommonService,
  ) { }

  private fontSize = 11;
  private lineHeight = this.fontSize + 4;
  private marginLeft = this.mmToPt(10);
  private marginRight = this.marginLeft;
  private marginTop = this.mmToPt(55);
  private marginBottom = this.mmToPt(14);
  private defaultLineSize = 0.5;
  black = rgb(0, 0, 0);
  blue = rgb(0, 0, 1.0);
  red = rgb(1.0, 0, 0);
  darkGray = rgb(0.3, 0.3, 0.3);
  lightGray = rgb(0.7, 0.7, 0.7);

  mmToPt(mm: number): number {
    return Math.round(mm * MM_TO_POINT);
  }

  ptToMm(pt: number): number {
    return Math.round(pt * POINT_TO_MM);
  }

  drawTableLine(pdfState : PDFState, data : (string | null)[], line : IPDFTemplateLine ) : number
  {
    const colWeight = line.colWeight;
    const page = pdfState.page;
    const { width } = page.getSize();
    const w = width - pdfState.marginLeft - pdfState.marginRight;
    const totalWeight = (colWeight) ? colWeight.reduce((a, b) => a + b, 0) : data.length;
    const unitWeight = w / totalWeight;
    let heightResult = pdfState.lineHeight;
    const originalFontSize = pdfState.fontSize;
    const originalLineHeight = pdfState.lineHeight;
    for (let i = 0; i < data.length; i++)
    {
      const val = data[i];
      const width = colWeight ? colWeight[i]*unitWeight : unitWeight;
      const flags = line.flags ? ((typeof line.flags == 'number') ? line.flags : line.flags[i]) : EPDFCellFlags.Left;
      const fontSize = line.fontSize ? ((typeof line.fontSize == 'number') ? line.fontSize : line.fontSize[i]) : originalFontSize;
      const lineHeight = line.lineHeight ? line.lineHeight  : originalLineHeight;
      pdfState.fontSize = fontSize;
      pdfState.lineHeight = lineHeight;
      if (typeof val == 'string') {
        if ((flags & EPDFCellFlags.Multiline) > 0)
        {
          const result = this.drawMultilineText(pdfState, val, width);
          heightResult = Math.max(heightResult, result);
        }
        else
        {
          this.drawClippedText(pdfState, val, width, flags);
          //page.drawRectangle({x: x, y: y, width: width, height: this.lineHeight, borderColor: this.black, borderWidth: this.defaultLineSize });
        }
      }
      page.moveRight(width);
      if (line.cellBorder) {
        const borderFlag = (typeof line.cellBorder == 'number') ? line.cellBorder : line.cellBorder[i];
        this.drawBorder(pdfState, borderFlag, page.getX() - width - 2, page.getY() - 4 - heightResult + lineHeight, width, heightResult);
      }
      else if (line.border && (line.border & EPDFBorderFlags.Inner)) {
        this.drawBorder(pdfState, line.border, page.getX() - width - 2, page.getY() - 4 - heightResult + lineHeight, width, heightResult);
      }
    }
    if (line.border) {
      this.drawBorder(pdfState, line.border, page.getX() - w - 2, page.getY() - 4 - heightResult + pdfState.lineHeight, w, heightResult);
    }
    pdfState.fontSize = originalFontSize;
    pdfState.lineHeight = originalLineHeight;
    return heightResult ? heightResult : pdfState.lineHeight;
  }

  drawBorder(pdfState : PDFState, borderFlags: PDFBorderFlags, x:number, y:number, width:number, height:number, color = this.black) {
    const page = pdfState.page;
    if ((borderFlags & EPDFBorderFlags.Outline) == EPDFBorderFlags.Outline)
    {
      page.drawRectangle({x: x, y: y, width: width, height: height, borderColor: color, borderWidth: this.defaultLineSize });
    }
    else {
      if ((borderFlags & EPDFBorderFlags.Bottom) > 0) {
        page.drawLine({ start: { x: x, y: y }, end: { x: x + width, y: y }, thickness: this.defaultLineSize, color: color });
      }
      if ((borderFlags & EPDFBorderFlags.Top) > 0) {
        page.drawLine({ start: { x: x, y: y + height }, end: { x: x + width, y: y + height }, thickness: this.defaultLineSize, color: color });
      }
      if ((borderFlags & EPDFBorderFlags.Left) > 0) {
        page.drawLine({ start: { x: x, y: y }, end: { x: x, y: y + height }, thickness: this.defaultLineSize, color: color });
      }
      if ((borderFlags & EPDFBorderFlags.Right) > 0) {
        page.drawLine({ start: { x: x + width, y: y }, end: { x: x + width, y: y + height }, thickness: this.defaultLineSize, color: color });
      }
    }
  }

  drawMultilineText(pdfState: PDFState, text: string, maxWidth: number, flags?: PDFCellFlags) : number
  {
    const page = pdfState.page;
    const x = page.getX();
    const y = page.getY();
    const availableHeight = Math.max(0, y - pdfState.marginBottom);
    const font = this.evaluateFont(pdfState, flags);
    const multiText = layoutMultilineText(text, {
      alignment: TextAlignment.Left,
      font: pdfState.font,
      fontSize: pdfState.fontSize,
      bounds: { x: x, y: y, width: maxWidth, height: availableHeight }
    });

    let posY = y;
    for (let i = 0; i < multiText.lines.length; i++) {
      const line = multiText.lines[i];
      page.drawText(line.text, { x: x, y: posY, font: font, size: pdfState.fontSize });
      posY -= pdfState.lineHeight;
    }
    return y-posY;
  }

  drawTruncatedText(pdfState: PDFState, text: string, maxWidth: number, appendEllipsis = true)
  {
    const page = pdfState.page;
    const font = pdfState.font;
    const fontSize = pdfState.fontSize;
    const fittedText = this.fitTextInWidth(text, maxWidth, font, fontSize, appendEllipsis);
    page.drawText(fittedText, { x:page.getX(), y:page.getY(), font, size: fontSize });
  }

  private evaluateFont(pdfState: PDFState, flags?: PDFCellFlags)
  {
    let font = pdfState.font;
    if (flags && ((flags & EPDFCellFlags.Bold) > 0)) {
      font = pdfState.fontBold;
    }
    if (flags && ((flags & EPDFCellFlags.Oblique) > 0)) {
      font = pdfState.fontOblique;
    }
    return font;
  }

  drawClippedText(pdfState: PDFState, text: string, width: number, flags?: PDFCellFlags)
  {
    const page = pdfState.page;
    const height = pdfState.lineHeight;
    const x = page.getX() - 2;
    const y = page.getY() - 4;
    page.pushOperators(pushGraphicsState());
    page.pushOperators(rectangle(x,y,width,height), clip(), endPath());
    const font = this.evaluateFont(pdfState, flags);
    if (flags && ((flags & EPDFCellFlags.Right) > 0)) {
      const textWidth = font.widthOfTextAtSize(text, pdfState.fontSize);
      const textX = page.getX() + width - textWidth - 4;
      page.drawText(text, { x: textX, font:font, size: pdfState.fontSize});
    }
    else if (flags && ((flags & EPDFCellFlags.Centered) > 0))
    {
      const textWidth = font.widthOfTextAtSize(text, pdfState.fontSize);
      const textX = x + Math.max(0, (width - textWidth) / 2);
      page.drawText(text, { x: textX, font: font, size: pdfState.fontSize});
    }
    else
    {
      page.drawText(text, {font:font, size: pdfState.fontSize});
    }
    page.pushOperators(popGraphicsState());
  }

  async createBlankPdf() : Promise<PDFState> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const page = pdfDoc.addPage(PageSizes.A4);
    const pdfState : PDFState = {
      pdfDoc: pdfDoc,
      page: page,
      font: font,
      fontBold: fontBold,
      fontOblique: fontOblique,
      fontSize: this.fontSize,
      lineHeight: this.lineHeight,
      marginLeft: this.marginLeft,
      marginRight: this.marginRight,
      marginTop: this.marginTop,
      marginBottom: this.marginBottom,
    }
    page.setFont(pdfState.font);
    page.setFontSize(pdfState.fontSize);
    page.setFontColor(this.black);
    await this.setPdfDocMetaData(pdfState.pdfDoc);
    return pdfState;
  }

  async setPdfDocMetaData(pdfDoc : PDFDocument)  {
    try
    {
      const user = await this.mrbauCommonService.getCurrentUser();
      pdfDoc.setAuthor(user.entry.displayName || user.entry.firstName+' '+user.entry.lastName);
    } catch (error:any) {
      console.log(error);
    }
    pdfDoc.setProducer('M&R DMS')
    pdfDoc.setCreator('pdf-lib')
    pdfDoc.setCreationDate(new Date())
    pdfDoc.setModificationDate(new Date())
  }

  setPdfDocTitle(pdfState : PDFState, title:string, subject?:string, keywords?:string[]) {
    const pdfDoc = pdfState.pdfDoc;
    pdfDoc.setTitle(title)
    if (subject) pdfDoc.setSubject(subject);
    if (keywords) pdfDoc.setKeywords(keywords);
  }

  async createDefaultPage() : Promise<PDFState> {
    const pdfState : PDFState = await this.createBlankPdf();
    await this.addMRBauLogo(pdfState);
    this.addMRBauFooter(pdfState);
    return pdfState;
  }

  async createFromTemplate(template: IPDFTemplate, data : PDFTemplateData): Promise<Uint8Array> {
    const pdfState : PDFState = await this.createDefaultPage();
    const { height } = pdfState.page.getSize();
    this.setPdfDocTitle(pdfState, template.title);
    if (template.company) {
      this.addCompany(pdfState, this.evaluateLine(template.company, data));
    }
    let currentY = height - pdfState.marginTop;
    pdfState.page.moveTo(pdfState.marginLeft, currentY);

    for (let i=0; i< template.lines.length; i++) {
      const line = template.lines[i].line;
      const condition = template.lines[i].condition;

      if (condition && !this.evaluateCondition(condition, data)) {
        continue;
      }
      if (line) {
        const evalLine = this.evaluateLine(line, data);
        const deltaY = this.drawTableLine(pdfState, evalLine, template.lines[i]);
        currentY -= deltaY;
      }
      if (template.lines[i].extraSpaceY) {
        currentY -= template.lines[i].extraSpaceY!;
      }
      pdfState.page.moveTo(pdfState.marginLeft, currentY);
    }

    return await pdfState.pdfDoc.save();
  }

  private evaluateCondition(condition: string, data: PDFTemplateData): boolean {
    // Remove leading = if present
    condition = condition.replace(/^=/, '').trim();

    // Replace function calls with their evaluated results
    condition = condition.replace(/(\w+)\(\)/g, (_match, funcName) => {
      const value = data[funcName];
      if (typeof value === 'number' && !isNaN(value) && value != 0) {
        return 'true';
      }
      return typeof value === 'boolean' ? value.toString() : 'false';
    });

    try {
      // Use Function constructor with 'new' to evaluate the condition safely
      // This is still a controlled environment since we only evaluate our own templates
      return new Function(`"use strict"; return (${condition})`)();
    } catch (error) {
      console.error(`Failed to evaluate condition: "${condition}"`, error);
      return false;
    }
  }

  private evaluateLine(line: (string | null)[], data: PDFTemplateData): (string | null)[] {
    let result: (string | null)[] = [];
    for (let i = 0; i < line.length; i++) {
      let val = line[i];

      if (typeof val !== 'string') {
        result.push(val);
        continue;
      }

      // Replace all placeholders in the string
      val = val.replace(/\{\{([^}]+)\}\}|{([^}]+)}/g, (_match, nodeKey, dataKey) => {
        const fullKey = (nodeKey || dataKey).trim();
        const [key, formatOption] = fullKey.split(':');

        let projectValue = nodeKey ? data.node.properties[key] : data[key];

        if (projectValue == null) return '';

        if (typeof projectValue === 'number') {
          if (formatOption) {
            const decimals = parseInt(formatOption, 10);
            return this.mrbauCalcService.formatNumber(projectValue, decimals);
          }
          return this.mrbauCalcService.formatNumber(projectValue);
        } else if (typeof projectValue === 'string') {
          return projectValue;
        } else if (projectValue instanceof Date) {
          return projectValue.toLocaleDateString('de-DE');
        }
        return '';
      });

      result.push(val);
    }
    return result;
  }

  private async addMRBauLogo(pdfState : PDFState) {
    const { width, height } = pdfState.page.getSize();
    const pngUrl = 'assets/mrbau-extension/png/mrbau_logo.png'
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())
    const pngImage = await pdfState.pdfDoc.embedPng(pngImageBytes)
    const targetDpi = 300;
    const pngWidth = pngImage.width * (72 / targetDpi);
    const pngHeight = pngImage.height * (72 / targetDpi);
    pdfState.page.drawImage(pngImage, {
        x: width - pngWidth - this.mmToPt(15),
        y: height - pngHeight - this.mmToPt(10),
        width: pngWidth,
        height: pngHeight,
      })
  }

  private addMRBauFooter(pdfState : PDFState) {
    const { width } = pdfState.page.getSize();
    const fontSize = pdfState.fontSize - 3;
    const lineHeight = fontSize + 1;
    let currentY = pdfState.marginBottom;
    const lineWidth = width * 0.80;
    const lineX = (width - lineWidth) / 2;
    pdfState.page.drawLine({
      start: { x: lineX, y: currentY + 10 },
      end: { x: lineX + lineWidth, y: currentY + 10 },
      thickness: this.defaultLineSize,
      color: this.lightGray,
    });
    const lines = [
      'UID ATU62058249, FN 266523x, Sitz: in Feldkirchen in Kärnten, Firmenbuchgericht: LG Klagenfurt',
      'Niederlassung: Zimmerei Schwab-Weg 8, 2340 Mödling',
      'Planungsbüro: Ahrensburger Straße 1, 9560 Feldkirchen'
    ];
    for (const line of lines) {
      const textWidth = pdfState.font.widthOfTextAtSize(line, fontSize);
      const centerX = (width - textWidth) / 2;
      pdfState.page.drawText(line, {
        x: centerX,
        y: currentY,
        size: fontSize,
        font: pdfState.font,
        color: this.darkGray,
      });
      currentY -= lineHeight;
    }
  }

  private addCompany(pdfState : PDFState , lines : (string | null)[]) {
    const { height } = pdfState.page.getSize();
    let currentY = height - this.mmToPt(25);
    for (const line of lines) {
      if (typeof line == 'string') {
        pdfState.page.drawText(line, {
            x: pdfState.marginLeft,
            y: currentY,
            color: this.black,
            size: pdfState.fontSize,
          });
          currentY -= pdfState.lineHeight;
      }
    }
  }

  private fitTextInWidth(text: string, maxWidth: number, font: PDFFont, fontSize: number, appendEllipsis = true): string
  {
    const width = font.widthOfTextAtSize(text, fontSize);
    if (width <= maxWidth) {
      return text;
    }
    const ellipsis = appendEllipsis ? '...' : '';
    let currentText = text;
    while (currentText.length > 0) {
      currentText = currentText.slice(0, -1);
      const newWidth = font.widthOfTextAtSize(currentText + ellipsis, fontSize);
      if (newWidth <= maxWidth) {
        return currentText + ellipsis;
      }
    }
    return '';
  }

  async mergePDFs(pdfBytes1: Uint8Array, pdfBytes2: Uint8Array): Promise<Uint8Array>
  {
    try {
      // Load both PDFs
      const pdfDoc1 = await PDFDocument.load(pdfBytes1);
      const pdfDoc2 = await PDFDocument.load(pdfBytes2);

      // Copy all pages from second PDF to first PDF
      const copiedPages = await pdfDoc1.copyPages(pdfDoc2, pdfDoc2.getPageIndices());
      copiedPages.forEach((page) => {
        pdfDoc1.addPage(page);
      });

      this.setPdfDocMetaData(pdfDoc1);
      // Save merged PDF
      const mergedPdfBytes = await pdfDoc1.save();
      return new Uint8Array(mergedPdfBytes);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF documents');
    }
  }

  /**
   * Removes a single page from the PDF.
   * @param pdfBytes The source PDF
   * @param pageIndex The 0-based index of the page to remove
   * @returns The modified PDF as a Uint8Array
   */
  async removePage(pdfBytes: Uint8Array, pageIndex: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Note: removePage modifies the document in-place
    pdfDoc.removePage(pageIndex);

    return await pdfDoc.save();
  }

  /**
   * specific helper to get the page count of a file before processing.
   * @param file The PDF file
   * @returns Number of pages
   */
  async getPageCount(file: File): Promise<number> {
    const buffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  }

  /**
   * Utility method: Triggers a browser download for the PDF data.
   * @param data The PDF data as Uint8Array
   * @param filename The desired filename (default: document.pdf)
   */
  downloadPdf(data: Uint8Array, filename: string = 'document.pdf'): void {
    // Create a Blob from the raw data
    const blob = new Blob([data as any], { type: 'application/pdf' });

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an invisible anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // Append to body (required for Firefox compatibility)
    document.body.appendChild(a);
    a.click();

    // Cleanup: remove element and revoke URL to prevent memory leaks
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Rotates a specific page or all pages by 90 degrees clockwise.
   * @param pdfBytes The source PDF as a byte array
   * @param pageIndex Index of the page to rotate (optional). If null/undefined, all pages are rotated.
   * @returns The modified PDF as a Uint8Array
   */
  async rotatePdf(pdfBytes: Uint8Array, pageIndex?: number): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    if (pageIndex !== undefined && pageIndex >= 0 && pageIndex < pages.length) {
      // Rotate a single page
      const page = pages[pageIndex];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees(currentRotation + 90));
    } else {
      // Rotate all pages
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees(currentRotation + 90));
      });
    }

    return await pdfDoc.save();
  }
}
