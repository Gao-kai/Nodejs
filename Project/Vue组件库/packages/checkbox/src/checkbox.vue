<template>
    <div class="g-checkbox">
        {{ modelValue }}
        <span class="g-checkbox__input">
            <!-- <input type="checkbox" :value="modelValue" @change="handleChexkBoxChange"> -->
            <input :name="name" :disabled="disabled" :indeterminate="indeterminate" type="checkbox" v-model="model"
                :value="label" :checked="isChecked" @change="inputChange">
            <!-- 这里为什么还要绑定一个value=lable？
                这是vue 内置的功能 对于checkbox这种表单来说
                如果绑定的数组v-model是数组 那么value绑定的lable值在v-model绑定的model数组中 
                那么在ui视图上呈现为选中 
                vue2可以不写 但是vue3必须写 否则找不到
            -->
        </span>

        <span class="g-checkbox__label">
            <slot>{{ label }}</slot>
        </span>
    </div>
</template>



<!-- 这个脚本专门用来定义组件的name 因为setup语法糖内部不方便定义组件的name -->
<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: "G-Checkbox"
})
</script>

<script setup lang="ts">

/**
 * 父组件中使用了我们的子组件G-Checkbox 并且绑定了一个响应式的值checkValue，
 * <G-Checkbox v-model="checkValue">苹果</G-Checkbox>
 * 此时首先需要接受这个checkValue：
 * const props = defineProps(['modelValue'])
 * const emit = defineEmits(['update:modelValue'])
 * 
 * 方法一：直接在input上展开 
 *  <input type="checkbox" :value="modelValue" @change="handleChexkBoxChange">
 *  handleChexkBoxChange内部emit('update:modelValue', $event.target.value)
 * 
 * 方法二：在input上再绑定一个v-model 然后子组件内部新建一个计算属性 因为不能直接绑定 这样会修改父组件传递来的值 不符合单向数据流
 * <input v-model="value" />
 * 
 * const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
    })
 */

/* Import */
import { useCheckbox } from './useCheckbox'

/* props 在声明 props 和 emits 选项时获得完整的类型推导支持*/
const props = defineProps({
    indeterminate: Boolean,
    name: String,
    checked: Boolean,
    disabled: Boolean,
    label: [String, Number, Boolean],
    modelValue: [String, Number, Boolean]
})

/* emits */
const emit = defineEmits(['update:modelValue', 'change'])

/* state */
const { model, isChecked, inputChange } = useCheckbox(props);

/* events */


/* directives */


/* expose */
defineExpose()


</script>

<style lang="scss" scoped></style>