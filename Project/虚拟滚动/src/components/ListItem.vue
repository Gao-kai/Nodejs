<template>
	<div class="item">
		{{item.id}}:{{item.value}}
	</div>
</template>

<script>
	export default {
		props:{
			item:Object
		}
	}
</script>

<style>
	.item{
		border: 1px solid pink;
		padding: 10px;
	}
</style>
