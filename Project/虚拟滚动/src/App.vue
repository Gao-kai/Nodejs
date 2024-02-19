<template>
  <div id="app">
	<VirtualList
		:size="50"
		:remain="10"
		:items="items"
		:variable="false"
		>
		<!-- 用户自己自定义的插槽 -->
		<ListItem slot-scope="{item}" :item="item"></ListItem>
	</VirtualList>
  </div>
</template>

<script>
import VirtualList from './components/VirtualList.vue'
import ListItem from './components/ListItem.vue'
import Mock from 'mockjs';

// 构造总数据
let totalData = [];
for (let i = 0; i < 1000; i++) {
	totalData.push({
		id:i,
		value:Mock.Random.csentence(20,150)
	})
}

export default {
  name: 'App',
  data(){
	return {
		items:totalData,
	}  
  },
  components: {
    VirtualList,
	ListItem
  }
}
</script>

<style type="text/css">
	*{
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}
</style>

