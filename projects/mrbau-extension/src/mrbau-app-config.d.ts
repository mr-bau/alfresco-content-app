//declare module "xxx" {

  export interface IOrganisationUnit {
      id: number;
      label: string;
      folder: string;
  }

  export interface IMrbauAppConfig {
      organisationUnitDefault: number;
      organisationUnits: IOrganisationUnit[];
  }

//}

