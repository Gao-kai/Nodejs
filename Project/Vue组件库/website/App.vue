<template>
    <div>
        <h1 class="title">GUI 官方文档</h1>

        <h2>Message组件</h2>
        <div>
            <G-Button type="primary" @click="openMessage">打开弹框</G-Button>
        </div>

        <h2>Transfer组件</h2>
        <div>
            <G-Transfer v-model="rightValue" :data="transferData" :props="transferProps"></G-Transfer>
        </div>

        <h2>Button组件</h2>
        <div style="display: flex;column-gap: 10px;">
            <G-Button type="primary" loading>primary</G-Button>
            <G-Button type="success" icon="caps-lock"></G-Button>
            <G-Button type="warning" icon="add" :loading="btnLoading" @click="btnClick">warning</G-Button>
            <G-Button type="danger">danger</G-Button>
            <G-Button type="info">info</G-Button>
            <G-Button type="default">default</G-Button>
            <G-Button type="success" icon="calendar">ICON</G-Button>
        </div>

        <h2>Button Group组件</h2>
        <div style="display: flex;column-gap: 10px;">
            <G-Button-Group>
                <G-Button type="primary" loading>primary</G-Button>
                <G-Button type="success" icon="caps-lock">success</G-Button>
                <G-Button type="info">info</G-Button>
            </G-Button-Group>

        </div>

        <h2>Icon组件</h2>
        <div class="icons">
            <G-Icon name="3column"></G-Icon>
            <G-Icon name="back"></G-Icon>
            <G-Icon name="browse"></G-Icon>
            <G-Icon name="bad"></G-Icon>
            <G-Icon name="code"></G-Icon>
        </div>

        <h2>Layout组件</h2>

        <h3>基础布局</h3>
        <G-Row justify="center">
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6">这是Col组件</G-Col>
        </G-Row>

        <h3>对齐方式</h3>
        <G-Row justify="space-between">
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6">这是Col组件</G-Col>
        </G-Row>



        <h3>混合布局</h3>
        <G-Row>
            <G-Col :span="8">这是Col组件</G-Col>
            <G-Col :span="4">这是Col组件</G-Col>
            <G-Col :span="8">这是Col组件</G-Col>
            <G-Col :span="4">这是Col组件</G-Col>
        </G-Row>

        <h3>列偏移</h3>
        <G-Row>
            <G-Col :span="6">这是Col组件</G-Col>
            <G-Col :span="6" :offset="6">这是Col组件</G-Col>
        </G-Row>

        <G-Row>
            <G-Col :span="6" :offset="6">这是Col组件</G-Col>
            <G-Col :span="6" :offset="6">这是Col组件</G-Col>
        </G-Row>

        <G-Row>
            <G-Col :span="12" :offset="6">这是Col组件</G-Col>
        </G-Row>

        <h3>分栏间隔</h3>
        <G-Row :gutter="100">
            <G-Col :span="6">
                <div style="background-color: pink;">这是Col组件</div>
            </G-Col>
            <G-Col :span="6">
                <div style="background-color: pink;">这是Col组件</div>
            </G-Col>
            <G-Col :span="6">
                <div style="background-color: pink;">这是Col组件</div>
            </G-Col>
            <G-Col :span="6">
                <div style="background-color: pink;">这是Col组件</div>
            </G-Col>
        </G-Row>

        <h2>Checkbox组件</h2>
        <G-Checkbox v-model="checkValue" @change="checkChange" :checked="false" :disabled="false"
            :indeterminate="false">苹果</G-Checkbox>
        <!-- <G-Checkbox :modelValue="checkValue" @update:modelValue="newValue=>checkValue=newValuee">苹果</G-Checkbox> -->

        <h2>CheckboxGroup组件</h2>
        <G-Checkbox-Group v-model="checkAllValue" @change="checkAllChange">
            <G-Checkbox label="shanghai" />
            <G-Checkbox label="beijing" />
            <G-Checkbox label="chengdu" />
        </G-Checkbox-Group>




    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { GMessage } from "@g-ui/message"

const useClick = () => {
    const btnLoading = ref(false);

    const btnClick = (e) => {
        btnLoading.value = true;
        setTimeout(() => {
            btnLoading.value = false;
        }, 1000)
    }

    return {
        btnClick,
        btnLoading
    }
}


const useCheckbox = () => {

    const checkValue = ref(true);
    /* 定义数据就用ref 如果是reactive  checkAllValue改了 但是实际的数组没变 不会触发响应式更新*/
    const checkAllValue = ref(['shanghai', 'beijing'])
    const checkChange = (e) => {
        console.log('checkChange', e);
    }

    const checkAllChange = (e) => {
        console.log('checkAllChange', e);
    }

    return {
        checkValue,
        checkChange,
        checkAllValue,
        checkAllChange
    }
}

type TransferKey = number | string;
type TransferDataItem = {
    key: TransferKey;
    label: string;
    disabled: boolean;
};
type TransferPropsAlias = {
    key?: string;
    label?: string;
    disabled?: string;
};


const generateData = () => {
    const data: any[] = []
    for (let i = 1; i <= 15; i++) {
        data.push({
            id: i,
            name: `选项 ${i}`,
            isChecked: i % 4 === 0,
        })
    }
    return data
}

const useTransfer = () => {
    const transferData = ref<TransferDataItem[]>(generateData());
    const rightValue = ref([1, 4])
    const transferProps: TransferPropsAlias = {
        key: 'id',
        label: 'name',
        disabled: 'isChecked'
    }

    return {
        transferData,
        rightValue,
        transferProps
    }
}

const { btnClick, btnLoading } = useClick();
const { checkValue, checkChange, checkAllValue, checkAllChange } = useCheckbox();
const { transferData, rightValue, transferProps } = useTransfer();

const openMessage = () => {

    GMessage({
        message: 'success',
        type: 'success',
        center: true,
        onClose: () => {
            console.log('success over');
        },
        duration: 5000
    })


}
</script>

<style scoped>
* {
    font-family: "Alimama" !important;
}
</style>

<style lang="scss" scoped>
.icons {
    display: flex;
    flex-wrap: wrap;
    column-gap: 15px;

    >.icon-container {
        display: flex;
        width: 50px;
        height: 50px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #999;
    }
}
</style>