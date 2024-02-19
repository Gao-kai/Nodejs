<template>
    <Transition name="g-message-fade" @before-leave="onBeforeLeave" @after-leave="onAfterLeave">
        <div ref="messageRef" :class="messageClass" :style="messageStyles" v-show="visible">
            {{ message }}
        </div>
    </Transition>
</template>

<script lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { getLastOffset, getOffsetOrSpace } from './instance'
import { PropType, computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { type IMessageType } from './types'

/**
 * 检查mesage组件
 * 1. 页面元素展示的时候在source面板按F8
 * 2. 添加鼠标点击事件的断点
 */
export default defineComponent({
    name: "MessageComponent",
    props: {
        id: {
            type: [String, Number],
            default: ""
        },
        message: {
            type: String,
            default: ""
        },
        type: {
            type: String as PropType<IMessageType>,
            default: "info",
            validator: (value: string) => {
                return ['warning', 'success', 'error', 'info'].includes(value)
            }
        },
        duration: {
            type: Number,
            default: 3000
        },
        center: {
            type: Boolean,
            default: true
        },
        offset: {
            type: Number,
            default: 20
        },
        onClose: {
            type: Function as PropType<() => void>,
        }

    },
    emits: ['destory', 'close'],
    setup(props, { emit, expose }) {

        let timer = null;
        const startTimer = () => {
            timer = setTimeout(() => {
                visible.value = false
            }, props.duration);
        }

        const onAfterLeave = () => {
            emit('destory', props.id);
        }

        const onBeforeLeave = () => {
            emit('close');
        }


        // 只为了触发vue transtion动画效果 销毁组件靠render
        const visible = ref(false);
        const height = ref(0);
        const lastOffset = computed(() => getLastOffset(props.id));
        const offset = computed(() => getOffsetOrSpace(props.id, props.offset) + lastOffset.value);
        const bottom = computed(() => height.value + offset.value);
        const messageRef = ref();
        useResizeObserver(messageRef, () => {
            height.value = messageRef.value.getBoundingClientRect().height;
        });

        const messageClass = computed(() => {
            return [
                'g-message',
                'g-message--' + props.type,
                props.center ? 'is-center' : ""
            ]
        })

        const messageStyles = computed(() => {
            return {
                top: `${props.offset}px`
            }
        })

        onMounted(() => {
            startTimer();
            visible.value = true;
        })

        onUnmounted(() => {
            clearTimeout(timer)
        })

        expose({
            visible,
            bottom,
            close
        })

        return {
            messageClass,
            messageStyles,
            visible,
            onAfterLeave,
            onBeforeLeave
        }


    }
})
</script>

<style lang="scss" scoped></style>