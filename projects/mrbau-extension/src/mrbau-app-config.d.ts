//declare module "..." {

  export interface IOrganisationUnit {
      id: number;
      label: string;
      folder: string;
  }
  export interface IOrganisationPosition {
    id: number;
    label: string;
  }
  export interface IMrbauAppConfig {
      organisationUnitDefault: number;
      organisationUnits: IOrganisationUnit[];
  }

//}

