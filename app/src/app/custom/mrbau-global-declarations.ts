import { NodeEntry } from '@alfresco/js-api';

export class CONST {

  public static readonly MAX_LENGTH_TASK_DESC:  number = 500;
  public static readonly MAX_LENGTH_TASK_FULL_DESC:  number = 500;
  public static readonly MAX_LENGTH_COMMENT:  number = 500;

  public static readonly DMS_SERVER_URL:       string = "https://mrdms01.mrbau.at";

  public static readonly CM_DESC:               string = "cm:description";
  public static readonly CM_FOLDER:             string = "cm:folder";

  static readonly HELPER_FORCE_FULL_TEXT_SEARCH: string =  " and ISNODE:T";

  static isPdfDocument(node: NodeEntry) : boolean
  {
    if ( node != null && node.entry.isFolder == false && node.entry.content["mimeType"] == "application/pdf")
    {
      return true;
    }
    return false;
  }

}
