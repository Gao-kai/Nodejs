import { defineComponent, openBlock, createElementBlock, createElementVNode, normalizeClass, toDisplayString } from 'vue';

var script$1 = defineComponent({
    name: 'GButton'
});

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, " button组件 "))
}

script$1.render = render$1;
script$1.__file = "packages/button/src/button.vue";

// ts文件默认是不认识.vue文件的
script$1.install = function (app) {
    app.component(script$1.name, script$1);
};

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

/* 导入所有组件 这里可以使用require.context */
const components = [script$1, script];
/* 循环注册为全局组件 */
const install = (app) => {
    components.forEach((component) => {
        app.component(component.name, component);
    });
};
var index = {
    install, // 导出install方法
};

export { index as default };
