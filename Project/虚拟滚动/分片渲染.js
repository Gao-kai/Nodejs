let total = 1000;
let pageNum = 0;
let pageSize = 100;
let maxPage = Math.ceil(total / pageSize);

let timer = Date.now();
function render(pageNum){
	if(pageNum >= maxPage) return;
	window.requestAnimationFrame(()=>{
		let startIndex = pageNum * pageSize;
		let endIndex = pageNum * pageSize + pageSize;
		let fragment = document.createDocumentFragment();
		
		for (let i = startIndex; i < endIndex; i++) {
			let li = document.createElement('li');
			li.innerHTML = i;
			fragment.appendChild(li);
		}
		
		container.appendChild(fragment);
		// 本次宏任务执行完成之后 执行新的宏任务 但由于事件循环机制 在执行之前渲染页面 不像之前一下子渲染10万条
		render(pageNum + 1);
	})
}
render(pageNum);

console.log(Date.now() - timer);
setTimeout(()=>{
	console.log('渲染时间',Date.now() - timer);
},0)
