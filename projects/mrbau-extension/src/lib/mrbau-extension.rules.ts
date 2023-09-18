import { RuleContext } from '@alfresco/adf-extensions';

//export function MrbauRuleHasOnlyFileSelection(context: RuleContext, ...args: RuleParameter[]) : boolean {
export function MrbauRuleHasOnlyFileSelection(context: RuleContext) : boolean {
  let result = false;
  if (context && context.selection && !context.selection.isEmpty)
  {
    result = true;
    context.selection.nodes.forEach( node => {
      if (!node.entry.isFile)
      {
        result = false;
      }
    });
  }
  return result;
}

export function MrbauRuleHasOnlyFileOrNoSelection(context: RuleContext) : boolean {
  let result = true;
  if (context && context.selection && !context.selection.isEmpty)
  {
    result = true;
    context.selection.nodes.forEach( node => {
      if (!node.entry.isFile)
      {
        result = false;
      }
    });
  }
  return result;
}

export function MrbauRuleIsMrbaArchiveDocument(context:RuleContext) : boolean {
  let result = false;
  if (context && context.selection && !context.selection.isEmpty)
  {
    result = true;
    for (let i = 0; i< context.selection.nodes.length; i++)
    {
      const node = context.selection.nodes[i];
      if (node.entry.aspectNames)
      {
        if (node.entry.aspectNames.indexOf('mrba:archiveDates') < 0)
        {
          // not an archive document
          return false;
        }
      }
      else
      {
        if (!node.entry.properties['mrba:archivedDate'])
        {
          // not an archive document
          return false;
        }
      }
    }
  }
  return result;
}
