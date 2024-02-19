<template>
    <div class="g-transfer-panel">
        <div class="g-transfer-panel__header">
            <!-- 全选按钮 -->
            <G-Checkbox v-model="isCheckAll" :indeterminate="indeterminate" @change="handleCheckAllChange">列表1</G-Checkbox>
        </div>

        <!-- 列表 -->
        <div class="g-transfer-panel__body">
            <G-Checkbox-Group v-model="checked">
                <G-Checkbox v-for="item in data" :label="item[keyAlias]" :disabled="item[disabledAlias]"
                    :key="item[keyAlias]" @change="handleItemCheckChange" />
            </G-Checkbox-Group>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref, toRefs, watch } from 'vue';
export default defineComponent({
    name: "G-TransferPanel",
})
</script>

<script setup lang="ts">
import GCheckbox from '@g-ui/checkbox'
import GCheckboxGroup from '@g-ui/checkbox-group'
import { TransferPropsAlias } from '../types'

interface ITransferPanelProps {
    data: any[];
    props: TransferPropsAlias;
}
const emit = defineEmits(['checked-change'])
const transferPanelProps = withDefaults(defineProps<ITransferPanelProps>(), {
    data: () => [],
    props: () => {
        return {
            key: 'key',
            label: 'label',
            disabled: 'disabled'
        }
    }
})

const usePanleState = (keyAlias, labelAlias, disabledAlias) => {
    const panelState = reactive({
        isCheckAll: false,
        checked: [],
        indeterminate: false
    })

    const checkableData = computed(() => transferPanelProps.data.filter(item => !item[disabledAlias.value]))


    const handleCheckAllChange = (e) => {
        panelState.isCheckAll = e;
        panelState.indeterminate = false
        panelState.checked = e ? checkableData.value.map((item) => item[keyAlias.value]) : []
    }

    watch(() => panelState.checked, (newValue) => {
        const checkableKeys = checkableData.value.map(item => item[keyAlias.value])
        panelState.isCheckAll = checkableKeys.every(key => newValue.includes(key));
        panelState.indeterminate = !(panelState.isCheckAll || newValue.length == 0)

        emit('checked-change', newValue)
    })


    watch(() => transferPanelProps.data, (newValue) => {
        panelState.checked = [];
        // panelState.isCheckAll = false;
        // panelState.indeterminate = !(panelState.isCheckAll || panelState.checked.length == 0)
    })


    return {
        ...toRefs(panelState),
        handleCheckAllChange,
        handleItemCheckChange
    }
}

const useCheckPropsAlias = (transferPanelProps: ITransferPanelProps) => {

    const keyAlias = computed(() => transferPanelProps.props.key);
    const labelAlias = computed(() => transferPanelProps.props.label);
    const disabledAlias = computed(() => transferPanelProps.props.disabled);

    return {
        keyAlias,
        labelAlias,
        disabledAlias,
    }
}

const { keyAlias, labelAlias, disabledAlias, } = useCheckPropsAlias(transferPanelProps);
const { isCheckAll, checked, indeterminate, handleCheckAllChange, handleItemCheckChange } = usePanleState(keyAlias, labelAlias, disabledAlias);


</script>


<style scoped></style>