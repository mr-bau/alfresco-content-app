export interface IAspectDetailItem {key:string, label:string, label_short:string};
export const AspectDeductionDetails : { [key:string]: IAspectDetailItem } = {
  netAmountPreDeduction                        : {key:"mrba:netAmountPreDeduction", label:"Geprüfte Summe Netto vor Abzügen [€]", label_short:"Gepr. Summe Netto vor Abzügen" },
  //netAmountCentsPreDeduction                   : {key:"mrba:netAmountCentsPreDeduction", label:"Geprüfte Summe Netto vor Abzügen [€]" },
  deductionDamageUnassignedPercent             : {key:"mrba:deductionDamageUnassignedPercent", label:"Nicht zuordenbare Bauschäden [%]", label_short:"Nicht zuord. Bauschäden" },
  //deductionDamageUnassignedPercentNumericValue : {key:"mrba:deductionDamageUnassignedPercentNumericValue ", label:"Nicht zuordenbare Bauschäden" },
  deductionDamageAssignedNetAmount             : {key:"mrba:deductionDamageAssignedNetAmount", label:"Zuordenbare Bauschäden Netto [€]", label_short: "Zuordenbare Bauschäden" },
  //deductionDamageAssignedNetAmountCents        : {key:"mrba:deductionDamageAssignedNetAmountCents", label:"Zuordenbare Bauschäden Netto [€]" },
  deductionSpecialNetAmount                    : {key:"mrba:deductionSpecialNetAmount", label:"Sonderabzüge Netto [€]", label_short: "Sonderabzüge"},
  //deductionSpecialNetAmountCents               : {key:"mrba:deductionSpecialNetAmountCents", label:"Sonderabzüge Netto [€]"},
  deductionSpecialPercent                      : {key:"mrba:deductionSpecialPercent", label:"Sonderabzüge [%]", label_short: "Sonderabzüge"},
  //deductionSpecialPercentNumericValue          : {key:"mrba:deductionSpecialPercentNumericValue", label:"Sonderabz\u00fcge Prozent "},
  deductionWastePercent                        : {key:"mrba:deductionWastePercent", label:"Umlage Bauschutt [%]", label_short: "Umlage Bauschutt"},
  //deductionWastePercentNumericValue            : {key:"mrba:deductionWastePercentNumericValue", label:"Umlage Bauschutt"},
  deductionCleaningPercent                     : {key:"mrba:deductionCleaningPercent", label:"Umlage Baureinigung [%]", label_short: "Umlage Baureinigung"},
  //deductionCleaningPercentNumericValue         : {key:"mrba:deductionCleaningPercentNumericValue", label:"Umlage Baureinigung"},
  deductionToiletsPercent                      : {key:"mrba:deductionToiletsPercent", label:"Umlage Baustellen-WC [%]", label_short: "Umlage Baustellen-WC"},
  //deductionToiletsPercentNumericValue          : {key:"mrba:deductionToiletsPercentNumericValue", label:"Umlage Baustellen-WC"},
  deductionWaterPercent                        : {key:"mrba:deductionWaterPercent", label:"Umlage Wasser [%]", label_short: "Umlage Wasser"},
  //deductionWaterPercentNumericValue            : {key:"mrba:deductionWaterPercentNumericValue", label:"Umlage Wasser"},
  deductionElectricityPercent                  : {key:"mrba:deductionElectricityPercent", label:"Umlage Strom [%]", label_short: "Umlage Strom"},
  //deductionElectricityPercentNumericValue      : {key:"mrba:deductionElectricityPercentNumericValue", label:"Umlage Strom"},
  deductionPreviousPaymentsNetAmount             : {key:"mrba:deductionPreviousPaymentsNetAmount", label:"Geleistete Zahlungen Netto [€]", label_short: "Geleistete Zahlungen" },
  //deductionPreviousPaymentsNetAmountCents        : {key:"mrba:deductionPreviousPaymentsNetAmountCents", label:"Geleistete Zahlungen Netto [€]", label_short: "Geleistete Zahlungen" },
}
export const AspectRetentionDetails : { [key:string]: IAspectDetailItem } = {
  retentionDRLPercent             : {key:"mrba:retentionDRLPercent", label:"Deckungsrücklass [%]", label_short: "Deckungsrücklass"},
  //retentionDRLPercentNumericValue : {key:"mrba:retentionDRLPercentNumericValue", label:"Deckungsrücklass"},
  retentionHRLPercent             : {key:"mrba:retentionHRLPercent", label:"Haftungsrücklass [%]", label_short: "Haftungsrücklass"},
  //retentionHRLPercentNumericValue : {key:"mrba:retentionHRLPercentNumericValue", label:"Haftungsrücklass"},
  retentionHRLDate : {key:"mrba:retentionHRLDate", label:"Laufzeit", label_short: "Laufzeit"},
  retentionHRLDateValue : {key:"mrba:retentionHRLDateValue", label:"Laufzeit", label_short: "Laufzeit"},
}

export const AspectInvoiceReviewSheetDetails : { [key:string]: IAspectDetailItem } = {
  mainOrderAmount               : {key:"mrba:mainOrderAmount", label:"Auftrags-Summe [€]", label_short: "Auftrags-Summe"},
  //mainOrderAmountCents          : {key:"mrba:mainOrderAmountCents", label:"Auftrags-Summe [€]", label_short: "Auftrags-Summe"},
  additionalOrderAmount         : {key:"mrba:additionalOrderAmount", label:"ZA-Summe [€]", label_short: "ZA-Summe"},
  //additionalOrderAmountCents    : {key:"mrba:additionalOrderAmountCents", label:"ZA-Summe [€]", label_short: "ZA-Summe"},
  deductionOrClearing         : {key:"mrba:deductionOrClearing", label:"Einbehalt [€]", label_short: "Einbehalt"},
  //deductionOrClearingCents    : {key:"mrba:deductionOrClearingCents", label:"Einbehalt [€]", label_short: "Einbehalt"},
  takeoverDate : {key:"mrba:takeoverDate", label:"Übernahme-Datum", label_short: "Übernahme-Datum"},
  takeoverDateValue : {key:"mrba:takeoverDateValue", label:"Übernahme-Datum", label_short: "Übernahme-Datum"},
  remedyNoticeDate : {key:"mrba:remedyNoticeDate", label:"Mängelfreimeldung Datum", label_short: "Mängelfreimeldung"},
  remedyNoticeDateValue : {key:"mrba:remedyNoticeDateValue", label:"Mängelfreimeldung Datum", label_short: "Mängelfreimeldung"},
  constructionTrade : {key:"mrba:constructionTrade", label:"Gewerk", label_short: "Gewerk"},
}

export const AspectDocumentIdentityDetails : { [key:string]: IAspectDetailItem } = {
  documentTopic : {key:"mrba:documentTopic", label:"Bezeichnung", label_short: "Bezeichnung"},
  documentNumber : {key:"mrba:documentNumber", label:"Nummer", label_short: "Nummer"},
  documentDate : {key:"mrba:documentDate", label:"Datum", label_short: "Datum"},
  documentDateValue : {key:"mrba:documentDateValue", label:"Datum", label_short: "Datum"},
}

export enum InvoiceTypes {
  Einzelrechnung =  "Einzelrechnung",
  Schlussrechnung = "Schlussrechnung",
  Teilrechnung =    "Teilrechnung",
}

export const AspectInvoiceDetails : { [key:string]: IAspectDetailItem } = {
  invoiceType : {key:"mrba:invoiceType", label:"Rechnungs-Typ", label_short: "Rechnungs-Typ"},
  partialInvoiceNumber : {key:"mrba:partialInvoiceNumber", label:"Teil-/Anzahlungsrechnung-Nummer (min=1, max=99)", label_short: "Teil-/Anzahlungsrechnung-Nummer"},
  accountingId : {key:"mrba:accountingId", label:"BMD Beleg Nr.", label_short: "BMD Beleg Nr."},
}

export const AspectAmountDetails : { [key:string]: IAspectDetailItem } = {
  netAmountCents : {key:"mrba:netAmountCents", label:"Netto Betrag [€]", label_short: "Netto Betrag"},
  netAmount : {key:"mrba:netAmount", label:"Netto Betrag [€]", label_short: "Netto Betrag"},
  grossAmountCents : {key:"mrba:grossAmountCents", label:"Brutto Betrag [€]", label_short: "Brutto Betrag"},
  grossAmount : {key:"mrba:grossAmount", label:"Brutto Betrag [€]", label_short: "Brutto Betrag"},
}

export enum VerifiedInboundInvoiceType {
  Ueberweisung =     "Überweisung",
  InterneRechnung =  "Interne Rechnung",
  Abbucher =         "Abbucher",
  Gutschrift =       "Gutschrift",
}

export const AspectInboundInvoiceReviewDetails : { [key:string]: IAspectDetailItem } = {
  verifiedInboundInvoiceType : {key:"mrba:verifiedInboundInvoiceType", label:"Überweisung/Abbucher", label_short: "Überweisung/Abbucher"},
  verifyDate : {key:"mrba:verifyDate", label:"Prüfdatum", label_short: "Prüfdatum"},
  verifyDateValue : {key:"mrba:verifyDateValue", label:"Prüfdatum", label_short: "Prüfdatum"},
  netAmountVerifiedCents : {key:"mrba:netAmountVerifiedCents", label:"Geprüfter Betrag Netto [€]", label_short: "Geprüfter Betrag Netto"},
  netAmountVerified : {key:"mrba:netAmountVerified", label:"Geprüfter Betrag Netto [€]", label_short: "Geprüfter Betrag Netto"},
  grossAmountVerifiedCents : {key:"mrba:grossAmountVerifiedCents", label:"Geprüfter Betrag Brutto [€]", label_short: "Geprüfter Betrag Brutto"},
  grossAmountVerified : {key:"mrba:grossAmountVerified", label:"Geprüfter Betrag Brutto [€]", label_short: "Geprüfter Betrag Brutto"},
  paymentDateNet : {key:"mrba:paymentDateNet", label:"Überweisungsdatum Netto", label_short: "Überweisungsdatum Netto"},
  paymentDateNetValue : {key:"mrba:paymentDateNetValue", label:"Überweisungsdatum Netto", label_short: "Überweisungsdatum Netto"},
  paymentDateDiscount1 : {key:"mrba:paymentDateDiscount1", label:"Überweisungsdatum Skonto 1", label_short: "Überweisungsdatum Skonto 1"},
  paymentDateDiscount1Value : {key:"mrba:paymentDateDiscount1Value", label:"Überweisungsdatum Skonto 1", label_short: "Überweisungsdatum Skonto 1"},
  paymentDateDiscount2 : {key:"mrba:paymentDateDiscount2", label:"Überweisungsdatum Skonto 2", label_short: "Überweisungsdatum Skonto 2"},
  paymentDateDiscount2Value : {key:"mrba:paymentDateDiscount2Value", label:"Überweisungsdatum Skonto 2", label_short: "Überweisungsdatum Skonto 2"},
}

export const AspectPaymentConditionDetails : { [key:string]: IAspectDetailItem } = {
  reviewDaysPartialInvoice : {key:"mrba:reviewDaysPartialInvoice", label:"Prüffrist Teilrechnungen [Tage]", label_short: "Prüffrist Teilrechnungen"},
  reviewDaysFinalInvoice : {key:"mrba:reviewDaysFinalInvoice", label:"Prüffrist Schlussrechnungen [Tage]", label_short: "Prüffrist Schlussrechnungen"},
  paymentTargetDays : {key:"mrba:paymentTargetDays", label:"Nettofrist [Tage]", label_short: "Nettofrist"},
  earlyPaymentDiscountDays1 : {key:"mrba:earlyPaymentDiscountDays1", label:"Skontofrist 1 [Tage]", label_short: "Skontofrist 1"},
  earlyPaymentDiscountPercent1 : {key:"mrba:earlyPaymentDiscountPercent1", label:"Skonto 1 [%]", label_short: "Skonto 1"},
  earlyPaymentDiscountPercentNumericValue1 : {key:"mrba:earlyPaymentDiscountPercentNumericValue1", label:"Skonto 1 [%]", label_short: "Skonto 1"},
  earlyPaymentDiscountDays2 : {key:"mrba:earlyPaymentDiscountDays2", label:"Skontofrist 2 [Tage]", label_short: "Skontofrist 2"},
  earlyPaymentDiscountPercent2 : {key:"mrba:earlyPaymentDiscountPercent2", label:"Skonto 2 [%]", label_short: "Skonto 2"},
  earlyPaymentDiscountPercentNumericValue2 : {key:"mrba:earlyPaymentDiscountPercentNumericValue2", label:"Skonto 2 [%]", label_short: "Skonto 2"},
}

export enum OrderTypes {
  Auftrag = "Auftrag",
  Zusatzauftrag = "Zusatzauftrag"
}
