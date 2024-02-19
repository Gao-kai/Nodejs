import { defineComponent, openBlock, createElementBlock, createElementVNode, normalizeClass, toDisplayString } from 'vue';

var script = defineComponent({
    name: 'GIcon',
    props: {
        name: {
            type: String,
            default: ""
        }
    }
});

const _hoisted_1 = { class: "icon-container" };

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1, [
    createElementVNode("i", {
      class: normalizeClass(`g-icon-${_ctx.name}`)
    }, null, 2 /* CLASS */),
    createElementVNode("span", null, toDisplayString(_ctx.name), 1 /* TEXT */)
  ]))
}

script.render = render;
script.__file = "packages/icon/src/icon.vue";

script.install = function (app) {
    app.component(script.name, script);
};

export { script as default };
