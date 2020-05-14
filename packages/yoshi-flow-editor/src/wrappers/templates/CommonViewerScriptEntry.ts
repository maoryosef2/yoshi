import { WidgetType } from 'yoshi-flow-editor-runtime/build/constants';
import t from './template';

export type TemplateControllerConfig = {
  id: string | null;
  controllerFileName: string;
  widgetType: WidgetType;
  controllerType?: string;
};

type Opts = {
  viewerScriptWrapperPath: string;
  viewerAppFileName: string;
  controllersMeta: Array<TemplateControllerConfig>;
};

const getControllerVariableName = (index: number) => `controller${index}`;

const importsForControllers = t<{
  controllersMeta: Array<TemplateControllerConfig>;
}>`
  ${({ controllersMeta }) => {
    return controllersMeta
      .map((controller, i) => {
        return `import ${getControllerVariableName(i)} from '${
          controller.controllerFileName
        }';`;
      })
      .join('\n');
  }}
`;

const getControllerScriptId = (controller: TemplateControllerConfig) => {
  const controllerScriptId = controller.controllerType || controller.id;

  return controllerScriptId ? `"${controllerScriptId}"` : controllerScriptId;
};

const controllerConfigs = t<{
  controllersMeta: Array<TemplateControllerConfig>;
}>`${({ controllersMeta }) =>
  controllersMeta
    .map(
      (controller, i) =>
        `{ method: ${getControllerVariableName(i)},
          widgetType: "${controller.widgetType}",
          id: ${getControllerScriptId(controller)} }`,
    )
    .join(', ')}`;

export default t<Opts>`
  import {createControllersWithDescriptors, initAppForPageWrapper} from '${({
    viewerScriptWrapperPath,
  }) => viewerScriptWrapperPath}';
  ${({ controllersMeta }) => importsForControllers({ controllersMeta })}
  import * as viewerApp from '${({ viewerAppFileName }) => viewerAppFileName}';
  var importedApp = viewerApp;

  export const initAppForPage = initAppForPageWrapper(importedApp.initAppForPage);
  export const createControllers = createControllersWithDescriptors([${({
    controllersMeta,
  }) =>
    controllerConfigs({
      controllersMeta,
    })}], importedApp.mapPlatformStateToAppData);
`;
