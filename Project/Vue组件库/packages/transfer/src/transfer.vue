<template>
    <div class="g-transfer">
        <!-- 左侧选择框 -->
        <GTransferPanel :data="sourceData" :props="TransferProps.props" @checked-change="onSourceCheckedChange">
        </GTransferPanel>
        <!-- 中间按钮 -->
        <div class="g-transfer__buttons">
            <G-Button type="primary" icon="arrow-double-left" @click="toLeftClick"
                :disabled="targetChecked.length == 0"></G-Button>
            <G-Button type="primary" icon="arrow-double-right" @click="toRightClick"
                :disabled="sourceChecked.length == 0"></G-Button>
        </div>
        <!-- 右侧选择框 -->
        <GTransferPanel :data="targetData" :props="TransferProps.props" @checked-change="onTargetCheckedChange">
        </GTransferPanel>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, toRefs } from 'vue';
import GTransferPanel from './transfer-panel.vue';
import GButton from "@g-ui/button";

export default defineComponent({
    name: "G-Transfer",
    components: {
        GTransferPanel,
        GButton
    },
})
</script>


<script setup lang="ts">
import { TransferDataItem, TransferPropsAlias, TransferKey } from '../types'

interface ITransferProps {
    data: TransferDataItem[];
    modelValue: TransferKey[];
    props: TransferPropsAlias;
}

const TransferProps = withDefaults(defineProps<ITransferProps>(), {
    data: () => [],
    modelValue: () => [],
    props: () => {
        return {
            key: 'key',
            label: 'label',
            disabled: 'disabled'
        }
    }
})

const emit = defineEmits(['update:modelValue'])


const useChckedState = () => {

    const chckedState = reactive({
        sourceChecked: [],
        targetChecked: []
    })

    const onSourceCheckedChange = (leftValue) => {
        console.log('leftValue', leftValue);
        chckedState.sourceChecked = leftValue

    }

    const onTargetCheckedChange = (rightValue) => {
        console.log('rightValue', rightValue);
        chckedState.targetChecked = rightValue

    }

    const toRightClick = () => {
        const cloneModelValue = TransferProps.modelValue.slice();
        emit('update:modelValue', cloneModelValue.concat(chckedState.sourceChecked));

    }

    const toLeftClick = () => {
        const cloneModelValue = TransferProps.modelValue.slice();
        chckedState.targetChecked.forEach(key => {
            const index = cloneModelValue.indexOf(key)
            if (index > -1) {
                cloneModelValue.splice(index, 1);
            }
            emit('update:modelValue', cloneModelValue);
        })
    }

    return {
        ...toRefs(chckedState),
        onSourceCheckedChange,
        onTargetCheckedChange,
        toRightClick,
        toLeftClick
    }
}

/* 将数据分为左右两堆 */

const useComputedData = (props: ITransferProps) => {
    const propsKey = computed(() => props.props.key);

    const sourceDataMap = computed(() => {
        return props.data.reduce((prev, curr) => {
            prev[curr[propsKey.value]] = curr;
            return prev;
        }, {})
    })

    /* 左侧数据源 */
    const sourceData = computed(() => {
        return props.data.filter(item => !props.modelValue.includes(item[propsKey.value]))
    })

    /* 右侧选中的 */
    const targetData = computed(() => {
        return props.data.filter(item => props.modelValue.includes(item[propsKey.value]))
    })

    return {
        sourceDataMap,
        sourceData,
        targetData,
        propsKey
    }
}

const { sourceData, targetData, propsKey } = useComputedData(TransferProps);
const { sourceChecked, targetChecked, onSourceCheckedChange, onTargetCheckedChange, toRightClick, toLeftClick } = useChckedState();

</script>


<style scoped></style>