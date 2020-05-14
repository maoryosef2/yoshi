import path from 'path';
import fs from 'fs-extra';
import { FlowEditorModel, ComponentModel } from '../model';
import viewerScriptEntry, {
  TemplateControllerConfig,
} from './templates/CommonViewerScriptEntry';

const viewerScriptWrapperPath =
  'yoshi-flow-editor-runtime/build/viewerScript.js';

export const toControllerMeta = (
  component: ComponentModel,
): TemplateControllerConfig => {
  return {
    controllerFileName: component.viewerControllerFileName,
    id: component.id,
    controllerType: component.controllerType,
    widgetType: component.type,
  };
};

export const isConfigured = (component: ComponentModel): boolean => {
  return !!component.id;
};

const viewerScriptWrapper = (
  generatedWidgetEntriesPath: string,
  model: FlowEditorModel,
) => {
  const controllersMeta: Array<TemplateControllerConfig> = model.components
    .filter(isConfigured)
    .map(toControllerMeta);

  const generatedViewerScriptEntryPath = path.join(
    generatedWidgetEntriesPath,
    'viewerScript.js',
  );

  const generateControllerEntryContent = viewerScriptEntry({
    viewerScriptWrapperPath,
    controllersMeta,
    viewerAppFileName: model.viewerAppFileName,
  });

  fs.outputFileSync(
    generatedViewerScriptEntryPath,
    generateControllerEntryContent,
  );

  return {
    viewerScript: generatedViewerScriptEntryPath,
  };
};

export default viewerScriptWrapper;
