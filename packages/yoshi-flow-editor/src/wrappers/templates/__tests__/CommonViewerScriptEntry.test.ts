import {
  OOI_WIDGET_COMPONENT_TYPE,
  PLATFORM_WIDGET_COMPONENT_TYPE,
} from 'yoshi-flow-editor-runtime/build/constants';
import commonViewerScriptEntry from '../CommonViewerScriptEntry';

describe('CommonViewerScriptEntry template', () => {
  it('generates correct template with single controller', () => {
    const generateControllerEntryContent = commonViewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/button/controller.ts',
          id: '123',
          widgetType: OOI_WIDGET_COMPONENT_TYPE,
        },
      ],
      viewerAppFileName: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });

  it('generates correct template with multiple controllers', () => {
    const generateControllerEntryContent = commonViewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '123',
          widgetType: OOI_WIDGET_COMPONENT_TYPE,
        },
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '567',
          widgetType: OOI_WIDGET_COMPONENT_TYPE,
        },
      ],
      viewerAppFileName: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });

  it('generates correct template with controllerType override', () => {
    const generateControllerEntryContent = commonViewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '123',
          widgetType: PLATFORM_WIDGET_COMPONENT_TYPE,
        },
        {
          controllerFileName: 'project/src/components/todo/controller.ts',
          id: '567',
          controllerType: '09876',
          widgetType: PLATFORM_WIDGET_COMPONENT_TYPE,
        },
      ],
      viewerAppFileName: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });

  it('generates correct template w/o controllers', () => {
    const generateControllerEntryContent = commonViewerScriptEntry({
      viewerScriptWrapperPath:
        'yoshi-flow-editor-runtime/build/viewerScript.js',
      controllersMeta: [],
      viewerAppFileName: 'project/src/app.ts',
    });

    expect(generateControllerEntryContent).toMatchSnapshot();
  });
});
