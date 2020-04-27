export const createTextComponentStructure = (text, layout) => ({
  type: 'Component',
  skin: 'wysiwyg.viewer.skins.WRichTextNewSkin',
  layout,
  componentType: 'wysiwyg.viewer.components.WRichText',
  data: {
    type: 'StyledText',
    text: `<h1 class="font_0">${text}</h1>`,
    stylesMapId: 'CK_EDITOR_PARAGRAPH_STYLES',
    linkList: [],
  },
  props: {
    type: 'WRichTextProperties',
    packed: true,
    brightness: 1,
  },
  style: 'txtNew',
});

export const createPageStructure = (
  managingAppDefId,
  tpaPageId,
  components,
) => ({
  componentType: 'mobile.core.components.Page',
  data: {
    managingAppDefId,
    tpaPageId,
  },
  components,
});

const getEditorSdkSource = editorSDK =>
  editorSDK.info.getSdkVersion('token').scriptSrc;

export const panelUrlBuilder = (editorSDK, componentRef, panelName) => {
  const inWatchMode = process.env.NODE_ENV !== 'production';
  // During yoshi-flow-editor start we want have local rendered settings panel. For prod - we are using static html file.
  const baseUrl = inWatchMode
    ? `https://localhost:3000/settings/${panelName}`
    : `./settings/${panelName}.html`;

  return `${baseUrl}?wix-sdk-version=${getEditorSdkSource(
    editorSDK,
  )}&componentId=${componentRef.id}`;
};
