<template>
  <div class="main">
    <Editor v-model="initJsonData" :formData="formData"></Editor>
  </div>
</template>


<script>
import pageJson from './config/data.json'
import Editor from './packages/Editor';
import { registerConfig } from './utils/editor-config'
import { ref, defineComponent, provide } from "vue";


export default defineComponent({
  name: "App",
  components: {
    Editor
  },
  setup() {
    const initJsonData = ref(pageJson);
    provide('registerConfig', registerConfig)
    const formData = ref({
      username: '李雷',
      password: "123456",
      startTime: 0,
      endTime: 100,
      team: "heat"
    })
    return {
      initJsonData,
      formData
    }
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style lang="scss">
.main {
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  bottom: 20px;
  background-color: #ebeef5;
  border-radius: 20px;
}
</style>


