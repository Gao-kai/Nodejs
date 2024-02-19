/*****
 * 
 * node是基于事件驱动的JS运行时，而事件的订阅和通知是基于核心模块events实现的，events的核心原理就是发布订阅模式
 * 但是我们往往不会直接new EventEmitter 而是创建一个继承自EventEmitter的子类
 * 然后new这个子类来实现事件的发布和订阅
 * 
 * ES5版本实现类的继承
 * Son.prototype = Object.create(Parent.prototype);
 * 
 * ES6版本实现类的继承
 * Object.setPrototypeOf(Son.prototype,Parent.prototype);
 * 
 *  Node最早版本实现类的继承
 * Son.prototype.__proto__ = Parent.prototype
 * 
 * 现在还会直接用node的核心模块Util实现，内部有两个很好的方法：
 * Util.promisify 实现一个函数包装为Promise化
 * Util.inherits 实现继承 其实内部就是Object.setPrototypeOf(Son.prototype,Parent.prototype);
 * 
 * 除此之外还有直接使用class 的 extends关键字
 */

// const EventEmitter = require('events');
// const Util = require('util');

// function Event(){}
// Util.inherits(Event,EventEmitter);

// const event = new Event();

// const eat = (name)=>console.log(name,'eat')
// const run = (name)=>console.log(name,'run')

// event.on('ok',eat);
// event.on('ok',run);

// event.emit('ok','李雷')

/****
 * 发布订阅模式实现
 * 
 * 观察者模式中：观察者和被观察者是两个类，被观察者保存着所有观察者的队列，一旦被观察者自己状态发生变化那么会notify所有观察者，此时观察者会调用自身的update方法实现更新
 * 
 * on('newListener',(eventName)=>{})
 * 当绑定一个newListener的事件之后，我们每次调用on或者once都会首先触发一次(eventName)=>{}回调函数，在这个回调函数内部，我们可以监听到用户绑定了那些事件
 * 并作出进一步的处理，比如在下一次事件循环结束之前将绑定的函数执行一次
 * 
 * 发布订阅可以实现解耦合 两个类可以完全解耦 没有任何关系
 */
class _EventEmitter {
    constructor(){
        this.events = {};
    }

    on(eventName,callback){
        // 继承的类的实例也要保证有一个events属性 因为构造器中的events是类自己的 不是共享的 因为用户不一定用extends继承 此时子类的实例旧访问不到父类独享的属性
        if(!this.events){
            this.events = {};
        }

        // 如果订阅的不是newListener事件 那么还要在放入队列前先执行一次newListener的回调函数 只有newListener才知道用户当前正在绑定那个事件 其实就是用来监听on或者once绑定本身这个操作的事件
        if(eventName !== 'newListener'){
            this.emit('newListener',eventName)
        }

        if(!this.events[eventName]){
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    emit(eventName,...args){
        if(!this.events){
            this.events = {};
        }

        const cbs = this.events[eventName];
        if(cbs && Array.isArray(cbs)){
            cbs.forEach(cb=>cb(...args))
        }
    }

    off(eventName,callback){
        if(!this.events){
            this.events = {};
        }
        const cbs = this.events[eventName];
        if(cbs && Array.isArray(cbs)){
            const index = cbs.findIndex(cb=>(cb===callback || cb === callback.wrap));
            if(index!==-1){
                this.events[eventName].splice(index,1);
            }
           
        }
    }

    // 先订阅 后执行 后删除 切片 执行一次就会将事件清空 从数组中移除
    once(eventName,callback){
        /**
         * 不能直接这样子 因为这样子假设要off的移除的不是callback 而是那个箭头函数
         *  this.on(eventName,()=>{
                callback();
                this.off(eventName,callback);
            })
            应该改为下面这个：将once提出来 这样就可以传递参数
         */

        const once = (...args)=>{
            callback(...args);
            this.off(eventName,once);
        }

        // 避免once绑定之后直接off 会以为函数引用不同删不掉 所以强行让callback和once产生关联
        callback.wrap = once;

        // 绑定的是once函数 
       this.on(eventName,once)

    }



}
const Util = require('util');
function Man(){}
Util.inherits(Man,_EventEmitter);
const man = new Man();
const eat1 = (name)=>console.log(name,'eat1')
const run1 = (name)=>console.log(name,'run1')


man.on('newListener',(eventName)=>{
    console.log('用户正在绑定'+ eventName)
    // 此时on事件还没有绑上去 执行不了
    process.nextTick(()=>{
        man.emit(eventName,'1111111')
    })
})
console.log(man.events);

// 第一次绑定on 触发newListener的回调 执行man.emit(‘on’,'1111111')
// 但是此时代码还没有走到 this.events[eventName].push(callback);这一步
// 所以on的事件eat1还没有绑定 此时不会打印任何东西
man.once('once',eat1)

// 第二次绑定on 还是一样 先执行newListener的回调 
// 此时cbs中on已经有之前的eat1
// 执行eat1之后才绑定run1
// 最后的结果就是只打印eat1
man.once('once',run1)

// 那么如何在绑定的时候就让两个都打印呢  就是nextTick 等同步代码都绑定完成之后再
// 执行emit 此时就可以都打印 最后等于在循环队列上推上去了
// [man.emit(eventName,'1111111'),man.emit(eventName,'1111111')]
// 执行两次 分别打印2次 总计4次
// 那么有没有办法只打印2次呢  用once即可

console.log(man.events);