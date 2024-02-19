function isPlugin(id) {
  const pluginRE = /^(@vue\/|vue-|@[\w-]+(\.)?[\w-]+\/vue-)cli-plugin-/;
  return pluginRE.test(id);
}

function toShortPluginId(id) {
  return id.replace(pluginRE, "");
}

module.exports = {
  isPlugin,
  toShortPluginId,
};
