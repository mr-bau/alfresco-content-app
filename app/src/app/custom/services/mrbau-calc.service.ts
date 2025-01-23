import { Injectable } from '@angular/core';
import { germanParseFloat } from '../form/mrbau-formly-validators';

export interface ICalculationParameter {
  label? : string,
  isPercent : boolean,
  value : number,
  calculatedValue? : number,
}

@Injectable({
  providedIn: 'root'
})
export class MrbauCalcService {

  constructor() { }

  getNumberFromString(value : string) : number {
    return germanParseFloat(value) || 0;
  }

  getRetentionMinimumThreshold(invoiceType : string) {
    return (invoiceType=='Teilrechnung') ? undefined : 250;
  }

  calcRetentionValue(invoiceType : string, p : ICalculationParameter, base: number) : number {
    let result = this.calcValue(p, base);
    const minimumThreshold = this.getRetentionMinimumThreshold(invoiceType);
    if (minimumThreshold && result <= minimumThreshold) {
      result = 0;
      p.calculatedValue = result;
    }
    return result;
  }

  calcPercentValue(percent:number, base:number) : number {
    return Math.round(percent*base + Number.EPSILON)/100;
  }

  calcValue(p : ICalculationParameter, base: number) : number {
    let result = p.value;
    if (p.isPercent)
    {
      result = this.calcPercentValue(p.value, base);
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
    //console.log(params)
    return result;
  }
}
