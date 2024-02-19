let start = Date.now();		
let total = 100000;
for (let i = 0; i < total; i++) {
	let li = document.createElement('li');
	li.innerHTML = i;
	container.appendChild(li);
}

console.log(Date.now() - start);
setTimeout(()=>{
	console.log(Date.now() - start);
},0)