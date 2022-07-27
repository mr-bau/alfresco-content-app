//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/model/archiveModel.xml
//https://github.com/mr-bau/alfresco-customisations/blob/default/mrbau-alfresco-platform/src/main/resources/alfresco/module/mrbau-alfresco-platform/messages/archiveModel.properties

export interface IMRBauDocumentAspect {
  name: string,
  properties?: string[],
  associations?: string[]
}

export const enum EMRBauDocumentCategory {
  // BILLS
  ARCHIVE_DOCUMENT,
  OFFER,
  ORDER,
  ADDON_ORDER,
  ORDER_NEGOTIATION_PROTOCOL,
  DELIVERY_NOTE,
  ER,
  PAYMENT_TERMS,
  OTHER_BILL,
  // CONTRACTS
  /*
  LEASE_CONTRACT,
  WAIVE_TERMINATION_RIGHT,
  MAINTENANCE_CONTRACT,
  ALL_IN_CONTRACT,
  LICENSE_CONTRACT,
  TERMINATION,
  FUEL_CARD,
  OTHER_CONTRACT*/
}

export const enum EMRBauDocumentCategoryGroup {
  BILLS        = 0,
  CONTRACTS    = 1,
}

export interface IMRBauDocumentType {
  title:string,
  name: string,
  parent: string,
  mandatoryAspects: string[],
  category: EMRBauDocumentCategory,
  folder: string,
  group: DocumentCategoryGroupData,
}

interface DocumentCategoryGroupData {
  label: string,
  folder: string,
  category: EMRBauDocumentCategoryGroup,
}

export const documentCategoryGroups = new Map<number, DocumentCategoryGroupData>([
  [EMRBauDocumentCategoryGroup.BILLS, {category: EMRBauDocumentCategoryGroup.BILLS, label: "Belege", folder: "01 Belege"}],
  [EMRBauDocumentCategoryGroup.CONTRACTS, {category: EMRBauDocumentCategoryGroup.CONTRACTS, label: "Verträge", folder: "02 Verträge"}],
]);

export const MRBauArchiveModelTypes : IMRBauDocumentType[] = [
  {
    title: "doc",
    name : "mrba:archiveDocument",
    parent : "cm:content",
    mandatoryAspects : [
      "mrba:archiveDates",
      "mrba:archiveIdentifiers",
      "cm:versionable"
    ],
    category: EMRBauDocumentCategory.ARCHIVE_DOCUMENT,
    folder: "99 doc",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Angebot",
    name : "mrba:offer",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifier",
      "mrba:documentIdentityDetails",
      "amountDetails",
      "taxRate",
      "costCarrierDetails",
    ],
    category: EMRBauDocumentCategory.OFFER,
    folder: "01 Angebote",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Auftrag",
    name : "mrba:order",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:documentIdentityDetails",
      "mrba:amountDetails",
      "mrba:taxRate",
      "mrba:paymentConditionDetails",
      "mrba:costCarrierDetails",
      "mrba:offerReference",
      "mrba:frameworkContractReference",
    ],
    category: EMRBauDocumentCategory.ORDER,
    folder: "02 Aufträge",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Zusatzauftrag",
    name : "mrba:addonOrder",
    parent : "mrba:order",
    mandatoryAspects : [
      "mrba:addonOrderDetails",
      "mrba:orderReference",
    ],
    category: EMRBauDocumentCategory.ADDON_ORDER,
    folder: "02 Aufträge",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Vergabeverhandlungsprotokoll",
    name : "mrba:orderNegotiationProtocol",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:documentIdentityDetails",
      "mrba:amountDetails",
      "mrba:taxRate",
      "mrba:costCarrierDetails",
    ],
    category: EMRBauDocumentCategory.ORDER_NEGOTIATION_PROTOCOL,
    folder: "02 Aufträge",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Zahlungskonditionen / Jahresauftrag",
    name : "mrba:frameworkContract",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:paymentConditionDetails",
      "mrba:inboundInvoiceReference",
      "mrba:inboundPartialInvoiceReference",
    ],
    category: EMRBauDocumentCategory.PAYMENT_TERMS,
    folder: "06 Zahlungskonditionen",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Lieferschein",
    name : "mrba:deliveryNote",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:documentIdentityDetails",
      "mrba:costCarrierDetails",
    ],
    category: EMRBauDocumentCategory.PAYMENT_TERMS,
    folder: "03 Lieferscheine",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Eingangsrechnung",
    name : "mrba:inboundInvoice",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:documentIdentityDetails",
      "mrba:inboundInvoiceDetails",
      "mrba:taxRate",
      "mrba:paymentConditionDetails",
      "mrba:costCarrierDetails",
      "mrba:orderReference",
      "mrba:deliveryNoteReference",
      "mrba:inboundInvoiceReference",
      "mrba_inboundRevokedInvoiceReference",
      "mrba:inboundPartialInvoiceReference",
    ],
    category: EMRBauDocumentCategory.ER,
    folder: "04 Eingangsrechnungen",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  },
  {
    title: "Sonstiger Beleg",
    name : "mrba:miscellaneousDocument",
    parent : "mrba:archiveDocument",
    mandatoryAspects : [
      "mrba:companyIdentifiers",
      "mrba:documentIdentityDetails",
    ],
    category: EMRBauDocumentCategory.OTHER_BILL,
    folder: "99 Sonstige Belege",
    group : documentCategoryGroups.get(EMRBauDocumentCategoryGroup.BILLS)
  }
];


export const MRBauArchiveModelAspects : IMRBauDocumentAspect[] = [
  {
    name :"mrba:archiveDates",
    properties: [
      "mrba:archivedDate",
      "mrba:archivedDateValue", // date value - kept in sync with mrba:archivedDate and set at 00:00 using Europe/Vienna as timezone
      "mrba:archiveDurationYears", // default 7
      "mrba:fiscalYear",
    ],
  },
  {
    name :"mrba:archiveIdentifiers",
    properties: [
      "mrba:mrBauId",
      "mrba:organisationUnit",
    ],
  },
  {
    name :"mrba:documentIdentityDetails",
    properties: [
      "mrba:documentTopic",
      "mrba:documentNumber",
      "mrba:documentDate", // d:text
      "mrba:documentDateValue" // d:date - date value - kept in sync with mrba:documentDate and set at 00:00 using Europe/Vienna as timezone
    ],
  },
  {
    name :"mrba:addonOrderDetails",
    properties: [
      "mrba:addonOrderNumber",
    ],
  },
  {
    name :"mrba:paymentConditionDetails",
    properties: [
      "mrba:reviewDaysPartialInvoice",
      "mrba:reviewDaysFinalInvoice",
      "mrba:paymentTargetDays",
      "mrba:earlyPaymentDiscountDays1",
      "mrba:earlyPaymentDiscountPercent1",
      "mrba:earlyPaymentDiscountPercentNumericValue1",
      "mrba:earlyPaymentDiscountDays2",
      "mrba:earlyPaymentDiscountPercent2",
      "mrba:earlyPaymentDiscountPercentNumericValue2",
    ],
  },
  {
    name :"mrba:amountDetails",
    properties: [
      "mrba:netAmountCents", // kept in sync with mrba:netAmount
      "mrba:netAmount",
      "mrba:grossAmountCents", // kept in sync with mrba:netAmount
      "mrba:grossAmount",
    ],
  },
  {
    name :"mrba:offerReference",
    associations: [
      "mrba:offer"
    ],
  },
  {
    name :"mrba:orderReference",
    associations: [
      "mrba:order"
    ],
  },
  {
    name :"mrba:frameworkContractReference",
    associations: [
      "mrba:frameworkContract"
    ],
  },
  {
    name :"mrba:deliveryNoteReference",
    associations: [
      "mrba:deliveryNote"
    ],
  },
  {
    name :"mrba:inboundInvoiceReference",
    associations: [
      "mrba:inboundInvoice"
    ],
  },
  {
    name :"mrba:inboundPartialInvoiceReference",
    associations: [
      "mrba:inboundInvoice"
    ],
  },
  {
    name :"mrba:taxRate",
    properties: [
      "mrba:taxRate",
      "mrba:taxRatePercent", // kept in sync with mrba:taxRate
      "mrba:taxRateComment",
    ],
  },
  {
    name :"mrba:companyIdentifiers",
    properties: [
      "mrba:companyName",
      "mrba:companyVatID",
      "mrba:companyStreet",
      "mrba:companyZipCode",
      "mrba:companyCity",
      "mrba:companyCountryCode",
    ],
  },
  {
    name :"mrba:costCarrierDetails",
    properties: [
      "mrba:costCarrierNumber",
      "mrba:projectName",
    ],
  },
  {
    name:"mrba:fiscalYearDetails",
    properties: [
    "mrba:fiscalYear",
    "mrba:projectName",
  ],
  },
  {
    name : "mrba:inboundInvoiceDetails",
    properties: [
    "mrba:inboundInvoiceType",
    "mrba:revokedInvoiceNumber",
    "mrba:partialInvoiceNumber",
    ]
  },
  {
    name : "mrba:inboundRevokedInvoiceReference",
    properties: [
    "mrba:inboundRevokedInvoice"
    ]
  }



];

export const MRBauArchiveModelConstraints = [
  "mrba:datePattern",
  "mrba:nonNegative",
  "mrba:germanDecimalOneDecimalPlace",
  "mrba:germanDecimalTwoDecimalPlaces",
];
