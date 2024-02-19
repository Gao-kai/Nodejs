<template>
	<div class="viewport" ref="viewport" @scroll="handleScroll">
		<!-- 滚动条 高度超出父盒子 会出现滚动条-->
		<div class="scroll-bar" ref="scrollBar"></div>

		<!-- 渲染真实内容的盒子 -->
		<div class="scroll-list" ref="scrollList" :style="{transform:`translate3d(0,${offset}px,0)`}">
			<div v-for="item in visibleData" :key="item.id" :vid="item.id">
				<slot :item="item"></slot>
			</div>
		</div>
	</div>
</template>

<script>
	/* 
		子组件slot拿到值item  传递给自己真实的父组件ListItem
		ListItem组件通过作用域插槽 将item当做作用域 传递给自己的props
		
		直接渲染为什么不行？
		用户是一个调用你的VirtualList组件进行开发的人，用户要获取到源数据并自定义渲染？就是如何渲染item完全交给用户自己去定义？VlIST组件内部不机械的对用户传入的数据做渲染
	 */
	export default {
		name: "VirtualList",
		props: {
			items: Array, // 总数据
			remain: Number, // 可见的item个数
			size: Number ,// item的高度
			variable:Boolean ,// item高度不固定
		},
		data() {
			return {
				start: 0,
				end: this.remain, // 默认展示10个
				offset: 0 // 偏移量
			}
		},
		created() {
			// console.log(this.remain);
		},
		computed: {
			// 计算可见的数据 slice不会改变原数组
			visibleData() {
				let start = this.start - this.prevCount;
				let end = this.end + this.nextCount;
				
				let v = this.items.slice(start, end);
				console.log(v)
				return v;
			},
			// 正式渲染区域前面预渲染的数量
			prevCount(){
				/* 
					如果start小于等于10，就于加载start个
					如果start大于10，就最多只渲染remain也就是10个
				 */
				return Math.min(this.start,this.remain);
			},
			// 正式渲染区域后面预渲染的数量
			nextCount(){
				/*
					假设总数有100个 remain是10个 
					如果剩余待渲染的个数length-end的值大于10，就最多只渲染10个
					如果剩余待渲染的个数length-end的值小于10，就最多渲染剩余的个数，因为没有10个够渲染了
					
				 */
				return Math.min(this.remain,this.items.length - this.end);
			}
		},
		mounted() {
			// 计算视口盒子的高度 = 可见元素个数 * 单个高度
			this.$refs.viewport.style.height = this.remain * this.size + 'px';

			// 计算滚动条的高度 = 总元素个数 * 单个高度
			this.$refs.scrollBar.style.height = this.items.length * this.size + 'px';
			
			// 如果加载完毕 缓存每一项的高度
			this.cacheList();
		},
		methods: {
			// 缓存当前渲染项的高度 top值和bottom值
			cacheList(){
				
			},
			handleScroll(e) {
				// 1.应该先计算已经滚过去几个了 当前应该从第几个开始显示
				let scrollTop = this.$refs.viewport.scrollTop;
				console.dir(this.$refs.viewport);

				// 计算已经卷去多少个了 刷新start开始的值
				this.start = Math.floor(scrollTop / this.size);

				// 进一步计算出end的值
				this.end = this.start + this.remain;

				// 定位当前可视区域 计算偏移位置
				this.offset = this.start * this.size - this.prevCount * this.size ;

				
				console.log({
					scrollTop: scrollTop,
					start: this.start,
					end: this.end,
					offset: this.offset
				})
			}
		}
	}
</script>

<style>
	.viewport {
		overflow-y: scroll;
		position: relative;
		margin: 100px;
	}

	.scroll-list {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		background-color: antiquewhite;
	}
</style>
