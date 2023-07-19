import { NodeEntry, RequestFields, RequestInclude, VersionEntry } from '@alfresco/js-api';

export const MRBAU_DATE_FORMAT = 'dd-MM-yyyy';
export class CONST {



  public static readonly MAX_LENGTH_TASK_DESC:  number = 500;
  public static readonly MAX_LENGTH_TASK_FULL_DESC:  number = 500;
  public static readonly MAX_LENGTH_COMMENT:  number = 500;
  public static readonly MAX_LENGTH_COMMENT_SHORT:  number = 250;
  public static readonly MAX_LENGTH_DEFAULT:  number = 256;
  public static readonly MAX_LENGTH_EMAIL:  number = 320;
  public static readonly MAX_LENGTH_PHONE: number = 20;
  public static readonly MAX_TIME_COMMENT_EDITABLE_MILLISECONDS:  number = (1000*60*60*24); // 24 h

  public static readonly GET_NODE_DEFAULT_INCLUDE = ['path', 'properties', 'allowableOperations', 'permissions', 'definition'];
  public static readonly SEARCH_REQUEST_DEFAULT_INCLUDE : RequestInclude = ['properties', 'aspectNames', 'path', 'isLink', 'allowableOperations', 'association']
  // ATTENTION make sure to request all mandatory fields for Node (vs ResultNode!)
  public static readonly SEARCH_REQUEST_DEFAULT_FIELDS : RequestFields = ['id', 'name', 'nodeType', 'isFolder', 'isFile', 'modifiedAt', 'modifiedByUser', 'createdAt', 'createdByUser']

  public static readonly DMS_SERVER_URL:        string = "https://mrdms01.mrbau.at";

  public static readonly CM_DESC:               string = "cm:description";
  public static readonly CM_FOLDER:             string = "cm:folder";


  static readonly HELPER_FORCE_FULL_TEXT_SEARCH: string =  " and ISNODE:T";

  static isPdfDocument(node: NodeEntry | VersionEntry) : boolean
  {
    if ( node != null && node.entry.isFolder == false && node.entry.content["mimeType"] == "application/pdf")
    {
      return true;
    }
    return false;
  }
}

