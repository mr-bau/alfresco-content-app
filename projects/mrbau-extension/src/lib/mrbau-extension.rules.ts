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
    context.selection.nodes.forEach( (node) => {
      if (node.entry.aspectNames.indexOf('mrba:archiveIdentifiers') < 0)
      {
        // not an archive document
        result = false;
      }
    });
  }
  return result;
}
