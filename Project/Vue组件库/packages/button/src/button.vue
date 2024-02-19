<template>
    <button :class="buttonClass" @click="handleClick">
        <!-- 如果用户开启了button的loading 那么屏蔽用户自定义的icon 展示loading动画 -->
        <i v-if="loading" class="g-icon-loading"></i>
        <!-- 如果用户没有开启loading 那么展示自定义图标 -->
        <i :class="`g-icon-${icon}`" v-if="icon && !loading"></i>

        <!-- 没有插槽就只渲染icon -->
        <span v-if="$slots.default">
            <slot></slot>
        </span>
    </button>
</template>

/* 因为setup中无法声明组件的name 但是SFC支持setup和普通script混用 */
<script lang="ts">
import { defineComponent, computed, type PropType } from 'vue';

/**
 * 类型定义
 */
type IButtonType = 'primary' | 'warning' | 'success' | 'danger' | 'default' | 'info'

export default defineComponent({
    name: 'GButton',
    props: {
        type: {
            type: String as PropType<IButtonType>,
            default: "primary",
            validator: (value: string) => {
                return ['primary', 'warning', 'success', 'danger', 'default', 'info'].includes(value)
            }

        },
        icon: {
            type: String,
            default: ""
        },
        disabled: Boolean,
        loading: Boolean,
        round: Boolean

    },
    emits: ['click'],
    setup(props, { attrs, slots, emit, expose }) {

        const buttonClass = computed(() => {
            return [
                'g-button',
                'g-button--' + props.type,
                {
                    'is-disabled': props.disabled,
                    "is-loading": props.loading,
                    "is-round": props.round
                }
            ]
        })

        const handleClick = (e) => {
            emit('click', e);
        }


        return {
            buttonClass,
            handleClick
        }
    },
})
</script>

<style lang="scss" scoped></style>