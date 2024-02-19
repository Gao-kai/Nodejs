import {
  computed,
  createVNode,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  render,
  h,
  resolveComponent,
  provide,
  inject,
} from "vue";

import { ElIcon } from "element-plus";
import {
  Delete,
  View,
  SortUp,
  SortDown,
  Download,
} from "@element-plus/icons-vue";
// 如何基于字符串获取到组件呢
const iconMap = {
  Delete: Delete,
  View: View,
  SortUp: SortUp,
  SortDown: SortDown,
  Download: Download,
};

export const DropDownItem = defineComponent({
  props: {
    label: String,
    icon: String,
  },
  setup(props) {
    const closeDropDown = inject("closeDropDown");
    return () => {
      return (
        <div class="dropdown-item" onClick={() => closeDropDown()}>
          <ElIcon size={20}>
            {h(iconMap[props.icon])}
            {/* {props.icon && createVNode(resolveComponent(props.icon))} */}
            {/* {props.icon && h(props.icon)} */}
          </ElIcon>
          <span>{props.label}</span>
        </div>
      );
    };
  },
});

export const DropDown = defineComponent({
  props: {
    options: {
      type: Object,
    },
  },
  setup(props, context) {
    const state = reactive({
      options: props.options,
      visible: false,
      top: 0,
      left: 0,
    });

    const closeDropDown = () => {
      state.visible = false;
    };

    // 提供给Item点击后关闭dropdown的方法
    provide("closeDropDown", closeDropDown);

    context.expose({
      showDropDown(options) {
        state.options = options;
        state.visible = true;
        // 计算下拉菜单出现的位置
        const { el } = state.options;
        const { top, left, height } = el.getBoundingClientRect();
        state.top = top + height + "px";
        state.left = left + "px";
      },
      closeDropDown,
    });

    const dropClass = computed(() => {
      return ["dropdown", state.visible ? "dropdown-show" : null];
    });

    const dropStyle = computed(() => {
      return {
        top: state.top,
        left: state.left,
      };
    });

    const dropDownRef = ref(null);
    const handleBodyClick = (e) => {
      // contains() 方法返回一个布尔值，表示一个节点是否是给定节点的后代，
      // 即该节点本身、其直接子节点（childNodes）、子节点的直接子节点等
      // 也就是判断只有鼠标点击的是当前之外的区域 才让它关闭
      // 如果点击是下拉的选项 那么不关闭哦
      if (!dropDownRef.value.contains(e.target)) {
        state.visible = false;
      }
    };

    onMounted(() => {
      // 捕获阶段就触发事件 因为之前给block阻止了冒泡 所以这里在捕获阶段就处理
      document.body.addEventListener("mousedown", handleBodyClick, true);
    });

    onBeforeUnmount(() => {
      document.body.removeEventListener("mousedown", handleBodyClick, true);
    });

    return () => {
      return (
        <div style={dropStyle.value} class={dropClass.value} ref={dropDownRef}>
          {state.options.content}
        </div>
      );
    };
  },
});

let vNode;
export function $dropdown(options) {
  if (!vNode) {
    const el = document.createElement("div");
    vNode = createVNode(DropDown, { options });
    render(vNode, el);
    document.body.appendChild(el);
  }

  const { showDropDown } = vNode.component.exposed;
  showDropDown(options);
}
