const { editorUrl, viewerUrl } = require('./dev/sites');

module.exports = {
  startUrl: [editorUrl, viewerUrl],
  hmr: 'auto',
  servers: {
    cdn: {
      ssl: true,
    },
  },
};
