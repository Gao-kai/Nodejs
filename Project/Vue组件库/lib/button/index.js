import { defineComponent, openBlock, createElementBlock } from 'vue';

var script = defineComponent({
    name: 'GButton'
});

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", null, " button组件 "))
}

script.render = render;
script.__file = "packages/button/src/button.vue";

// ts文件默认是不认识.vue文件的
script.install = function (app) {
    app.component(script.name, script);
};

export { script as default };
