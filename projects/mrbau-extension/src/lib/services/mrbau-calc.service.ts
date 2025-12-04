import { Injectable } from '@angular/core';
import { germanParseFloat } from '../form/mrbau-formly-validators';

export type TCalculationParameterType = 'Number' | 'Percent' | 'Retention';

export interface ICalculationParameter {
  label? : string,
  //isPercent : boolean,
  type : TCalculationParameterType,
  value : number,
  calculatedValue? : number,
}

@Injectable({
  providedIn: 'root'
})
export class MrbauCalcService {

  constructor() { }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  getNumberFromString(value : string) : number {
    return germanParseFloat(value) || 0;
  }

  getRetentionMinimumThreshold(invoiceType : string) {
    return (invoiceType=='Teilrechnung') ? 0 : 250;
  }

  calcRetentionValue(invoiceType : string, p : ICalculationParameter, base: number) : number {
    let result = this.calcPercentValue(p.value, base);
    const minimumThreshold = this.getRetentionMinimumThreshold(invoiceType);
    if (minimumThreshold) {
      result = Math.round(result);
    }
    if (minimumThreshold && result <= minimumThreshold) {
      result = 0;
    }
    return result;
  }

  calcPercentValue(percent:number, base:number) : number {
    return Math.round(percent*base + Number.EPSILON)/100;
  }

  calcValue(p : ICalculationParameter, base: number) : number {
    let result = p.value;
    if (p.type === 'Percent')
    {
      result = this.calcPercentValue(p.value, base);
    } else if (p.type === 'Retention') {
      result = this.calcRetentionValue('', p, base);
    }
    p.calculatedValue = result;
    return result;
  }

  calcValueAsString(p : ICalculationParameter, base: number) : string {
    return this.numberToString(this.calcValue(p, base));
  }

  numberToString(num : number) : string {
    return num.toLocaleString('de-De', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  calcValues(params : ICalculationParameter[], base: number) : number {
    let result = base;
    for (let i=0;i<params.length; i++) {
      const p = params[i];
      result -= this.calcValue(p, base);
    }
    return result;
  }
}
