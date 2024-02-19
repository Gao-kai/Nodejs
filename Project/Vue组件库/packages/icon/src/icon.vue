<template>
    <div class="icon-container">
        <i :class="`g-icon-${name}`"></i>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
    name: 'GIcon',
    props: {
        name: {
            type: String,
            default: ""
        }
    }
})
</script>

<!-- <style scoped>
.icon-container {
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: pink;
    row-gap: 8px;
    cursor: pointer;
}

.icon-container i {
    font-size: 22px;
}
</style> -->