<template>
    <div class="g-checkbox-group">
        {{ modelValue }}
        <slot></slot>
    </div>
</template>

<!-- 这个脚本专门用来定义组件的name 因为setup语法糖内部不方便定义组件的name -->
<script lang="ts">
import { computed, defineComponent, provide } from 'vue';
export default defineComponent({
    name: "G-Checkbox-Group"
})
</script>

<script setup lang="ts">
import { type ICheckboxGroupProps } from './types';
import type { PropType } from 'vue'
/**
 * setup语法中声明props的三种方式
 * 1. 可以直接传入ts类型比如接口和types但是不能定义默认值
 * const props1 = defineProps<ICheckboxGroupProps>()
 * 
 * 2. 可以定义默认值和外部导入的ts类型
 * const props2 = withDefaults(defineProps<ICheckboxGroupProps>(), {
 *      modelValue: [],
 *      disabled: false
 *  })
 * 
 * 3. 和Vue2基本一致
 */

/* props 在声明 props 和 emits 选项时获得完整的类型推导支持*/
const props = defineProps({
    modelValue: Array as PropType<Array<number> | string[]>,
    disable: Boolean
})

/* emits */
const emit = defineEmits(['change', 'update:modelValue'])


/* state */
const modelValue = computed(() => props.modelValue);
const changeEvent = (newValue) => {
    // 提供给外部绑定了change事件使用
    emit('change', newValue)
    // 提供给外部绑定了v-model的值 用于双向绑定使用
    emit('update:modelValue', newValue)
}

/* provide */
provide('GChekboxGroup', {
    name: "GChekboxGroup",
    modelValue,
    changeEvent
})


</script>

<style lang="scss" scoped></style>