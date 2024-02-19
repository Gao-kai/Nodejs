'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const hasOwnProperty = Object.hasOwnProperty;
const isObject = (value) => {
    return typeof value === "object" && value !== null;
};
const isFunction = (value) => {
    return typeof value === "function";
};
const isArray = Array.isArray;
const isString = (val) => toTypeString(val) === "[object String]";
const hasOwn = (obj, key) => hasOwnProperty.call(obj, key);
/**
 * @description 判断传入的属性名是否是一个数字类型的字符串 比如'0' '1' '10'都符合 但是'-1' 'name' 'NaN'不符合
 * @param key
 * @returns
 */
const isIntegerKey = (key) => isString(key) &&
    key !== "NaN" &&
    key[0] !== "-" &&
    "" + parseInt(key, 10) === key;

/**
 * @description 响应式的核心实现effect函数
 * @param fn 回调函数
 *
 * 1. 默认会将传入的fn立即执行 如果是lazy 那么不会立即执行
 */
function effect(fn, options = {}) {
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
        effect();
    }
    return effect;
}
/**
 * @description 每次执行当前的effect重新渲染的时候 首先把存储的deps清空 避免重复执行effect
 * @param effect 当前执行的effect函数
 */
function cleanup(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (const dep of deps) {
            dep.delete(effect);
        }
        deps.length = 0;
    }
}
let uid = 0;
let activeEffect;
// 栈结构主要是用于解决effect的嵌套执行 因为组件就是嵌套的
const effectStack = [];
/**
 * @description 创建一个effect副作用函数并返回 执行这个effect函数可以添加对内部响应式数据的主动观测
 * @param fn
 * @param options
 * @returns
 */
function createReactiveEffect(fn, options) {
    const effect = function reactiveEffect() {
        // 解决一个effect被无限循环执行 eg:effect(()=>{state.age++})
        if (!effectStack.includes(effect)) {
            // 每次执行前先做一个cleanup
            cleanup(effect);
            // 执行fn回调会去代理对象上取值 依赖收集就是在这里发生的
            try {
                effectStack.push(effect);
                activeEffect = effect;
                const res = fn();
                return res; // 后续计算属性需要这个函数执行的结果
            }
            finally {
                effectStack.pop();
                activeEffect = effectStack[effectStack.length - 1];
            }
        }
    };
    /* 给创建出来的effect打上标记 */
    effect.id = uid++;
    effect._isEffect = true;
    effect.raw = fn;
    effect.options = options;
    effect.active = true;
    effect.deps = [];
    return effect;
}
const targetMap = new WeakMap();
/**
 * @description 属性的依赖收集
 * @param target 那个对象
 * @param type 属性收集的类型
 * @param key 那个属性
 */
function track(target, type, key) {
    if (activeEffect === undefined)
        return;
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    if (!dep.has(activeEffect)) {
        // 让属性记住依赖(组件)：更新当前target对象的key属性所收集的依赖Set集合 Set{effect1,effect2}
        dep.add(activeEffect);
        // 让依赖(组件)也记住属性:将当前这一刻的属性自身的dep也就是Set集合(存放着当前属性的所有依赖effect)
        activeEffect.deps.push(dep);
    }
    console.log("依赖收集完成一次，当前的targetMap是 === > ", "\r\n", target, "\r\n", key, "\r\n", targetMap);
}
/**
 * @description 属性的更新通知
 * @param target
 * @param type
 * @param key
 * @param newValue
 * @param oldValue
 */
function trigger(target, type, key, newValue, oldValue) {
    let depsMap = targetMap.get(target);
    // 如果在weakMap依赖收集集合中找不到这个对象 说明没有被收集 那么不用更新
    if (!depsMap)
        return;
    // 新建一个Set集合用来存储本次更新的所有effect 目的是去重
    const effects = new Set();
    /**
     * @description 专门用于更新时将属性key对应的dep 也就是Set集合都添加到统一的effects中
     * @param effectToAdd
     */
    const add = (effectToAdd) => {
        if (effectToAdd) {
            // 遍历Set集合 然后依次添加
            for (const effect of effectToAdd) {
                effects.add(effect);
            }
        }
    };
    /**
     * 特殊处理1：关于数组length的更新
     * 场景：如果在依赖收集的时候对于某个数组arr的length属性和索引属性都进行了收集，比如：
     *  const state = reactive([100,200,300])
     *  state[2] state.length 此时页面渲染：300和3
     *
     *  如果后续修改了length属性的值 此时就需要特殊处理，比如：
     *  + state.length被修改为大于等于原来length的值
     *    比如state.length = 5 此时只需要找到length收集的依赖进行更新
     *  + state.length被修改为小于原来length的值
     *    比如state.length = 0 此时不仅需要更新length依赖
     *    还需从依赖集合中找到当前收集的所有数组索引属性比如'2' 然后更新相关依赖
     *    因为数组的长度都变为0了 数组应该为空 此时页面应该为：undefined和0
     *
     */
    if (key === "length" && isArray(target)) {
        depsMap.forEach((dep, key) => {
            // 这里的key可能是length 也可能是数字索引属性 newValue就是被新赋值的长度
            if (key === "length" || key >= newValue) {
                add(dep);
            }
        });
    }
    else {
        // 走到这里只能是：对象属性更新 或 数组索引属性更新
        if (key !== undefined) {
            add(depsMap.get(key));
        }
        /**
         * 如果直接修改了数组的索引属性并因此修改了length,比如：
         * const state = reactive([100,200,300])
         * state.length 依赖收集 渲染3
         *  state[100] = 0;
         * 此时数组的length会变为100 需要触发length有关的依赖 渲染 100 200 300，，，，，，0
         */
        switch (type) {
            case "add" /* ADD */:
                if (isArray(target) && isIntegerKey(key)) {
                    add(depsMap.get("length"));
                }
                break;
        }
    }
    // 触发更新 也就是取出当前属性key的每一个effect然后执行 再次更新的时候会重新去依赖收集触发getter并拿到更新后的值
    // 在页面上的表现就是视图上绑定的依赖属性都发生了变化
    effects.forEach((effect) => {
        if (effect.options.scheduler) {
            effect.options.scheduler(effect);
        }
        else {
            effect();
        }
    });
}

/**
 * Notes:
 * 1. 避免写重复的radonl的setter 使用assign进行解耦
 * 2. 函数柯里化的思想
 * 3. 为什么用Reflect.get而不是target[key]
 *      + ES Next以后会将Object上的方法迁移到Reflect来
 *      + target[key]=value设置值就算设置失败也不会异常 但是Reflect设置值具有返回值
 *      + 解决源对象中有get访问器属性的时候修改源对象中name的值不引起响应式更新的bug
 * 4. Object.assign会修改第一个参数的值 很难注意到的bug
 */
/**
 * @description 创建一个get拦截函数并返回 依赖收集在此发生
 * @param isReadonly 是否只读
 * @param shallow 是否为浅劫持
 */
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_raw" /* RAW */ &&
            receiver === (isReadonly ? readonlyMap : reactiveMap).get(target)) {
            return target;
        }
        const result = Reflect.get(target, key, receiver);
        // 如果不是只读的 进行依赖收集
        if (!isReadonly) {
            track(target, "get" /* GET */, key);
        }
        // 如果是浅收集 那么直接返回即可
        if (shallow) {
            return result;
        }
        /*
            vue3.0的懒代理
            + vue2.0是一上来就对对象进行递归劫持
            + vue3.0是取值取到一个对象的时候才去代理
        */
        if (isObject(result)) {
            return isReadonly ? readonly(result) : reactive(result);
        }
        return result;
    };
}
/**
 * @description 创建一个set拦截函数并返回 通知更新在此发生 新增 - 修改 - 相等
 * @param shallow 是否为浅劫持
 */
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        // 获取旧值
        const oldValue = target[key];
        /**
         * 判断1：setter的时候是修改值还是新增值？
         * 1. 如果target是数组并且key是有效索引 那么就判断修改的索引key是否小于数组长度 如果是那么就是修改 否则就是新增
         * 2. 否则target就是对象 那么就判断当前对象target上是否存在属性key 如果存在就是修改 否则就是新增
         * 3. Proxy的强大之处就是可以监控到任何修改数组和对象的行为 比如修改数组的索引和新增对象属性 在Vue2中要用$set方法实现
         */
        const isExistKey = isArray(target) && isIntegerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        // 获取设置后的返回值用于setter方法的返回值
        const res = Reflect.set(target, key, value, receiver);
        if (!isExistKey) {
            // 走新增的更新
            trigger(target, "add" /* ADD */, key, value);
        }
        else if (oldValue !== value) {
            // 走修改的更新
            trigger(target, "set" /* SET */, key, value);
        }
        return res;
    };
}
const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const set = createSetter();
const shallowSet = createSetter(true);
const mutableHandlers = {
    get,
    set,
};
const shallowReactiveHandlers = {
    get: shallowGet,
    set: shallowSet,
};
const readonlyHandlers = {
    get: readonlyGet,
    set: (target, key) => {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        return true;
    },
};
const shallowReadonlyHandlers = Object.assign({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers);
}
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers);
}
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers);
}
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers);
}
// 存放响应代理的缓存 以target为key 以代理对象proxy为value
const reactiveMap = new WeakMap();
// 存放只读代理的缓存
const readonlyMap = new WeakMap();
/**
 *
 * @description 基于传入的target和isReadonly等配置创建一个Proxy响应式对象并返回
 * @param target 要代理的目标对象
 * @param isReadonly 是否只读
 * @param baseHandlers Proxy中的handles拦截器
 */
function createReactiveObject(target, isReadonly, baseHandlers) {
    // 只有目标是对象 才可以进行属性劫持
    if (!isObject(target)) {
        console.warn(`value cannot be made reactive: ${String(target)}`);
        return target;
    }
    // 如果对象已经被代理过了 那么优先读取缓存 不进行重复的代理
    const proxyMap = isReadonly ? readonlyMap : reactiveMap;
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // 创建响应式对象
    const proxy = new Proxy(target, baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}

/**
 * 将普通类型转化为一个对象
 * 这个对象有value属性指向原来的原始值
 * name.value
 * name.value = xxx;
 *
 */
/**
 * @description 如果rawValue是一个对象 将其转化为响应式的对象后返回
 * @param rawValue 用户调用ref()时传入的值 可能是对象可能是基本值
 * @returns
 */
function convert(rawValue) {
    if (isObject(rawValue)) {
        return reactive(rawValue);
    }
    else {
        return rawValue;
    }
}
/**
 * 核心：ref和reactive的区别
 * reactive内部使用proxy实现拦截
 * ref内部使用类的访问器和取值器 其实编译之后就是definProperty实现拦截
 *
 * ref可以接受一个value的值为对象或者原始值
 * 返回的是一个RefImpl的实例
 */
function ref(value) {
    return createRef(value);
}
function shallowRef(value) {
    return createRef(value, true);
}
function createRef(rawValue, shallow = false) {
    return new RefImpl(rawValue, shallow);
}
/**
 * TypeScript的类
 * 1. 所有可以this.xxx访问的属性必须要在顶部通过public或privite声明
 * 2. 在ts类的构造器函数的参数中声明并添加public或privite声明，会默认执行：this.xxx = xxx的行为
 *    代表属性就被默认放到this实例上了
 */
class RefImpl {
    /**
     *
     * @param rawValue 永远暴露的是未被代理过的值
     * @param shallow 是否浅劫持
     */
    constructor(rawValue, shallow) {
        this.rawValue = rawValue;
        this.shallow = shallow;
        this.__v_isRef = true; // 标识是否为一个RefImpl实例
        // 如果是浅劫持 就直接赋值即可 否则需要将每一层都转化为响应式的值
        this._value = shallow ? rawValue : convert(rawValue);
    }
    /**
     * @description 外部执行 state.value 进行依赖收集
     */
    get value() {
        track(this, "get" /* GET */, "value");
        return this._value;
    }
    /**
     * @description 外部执行 state.value = xxx 进行通知更新
     */
    set value(newValue) {
        if (newValue !== this.rawValue) {
            // 每次设置值的时候再次判断
            this._value = this.shallow ? newValue : convert(newValue);
            this.rawValue = newValue;
            trigger(this, "set" /* SET */, "value", newValue);
        }
    }
}
function isRef(target) {
    return Boolean((target === null || target === void 0 ? void 0 : target.__v_isRef) === true);
}
/**
 *
 * @description 将target对象的key属性转换为一个Ref实例并返回 返回的ref和源对象target保持同步更改
 * 将targte[key]的访问形式 转化为 属性访问器.value的形式
 * @param target
 * @param key
 */
function toRef(target, key) {
    if (isRef(target[key])) {
        return target[key];
    }
    else {
        // 这里其实很简单 就是对象引用值地址传递过去操作即可
        return new ObjectRefImpl(target, key);
    }
}
/**
 * @description 将一个响应式对象转换为一个普通对象，这个普通对象的每个属性都是指向源对象相应属性的 ref
 * @param target
 * @use 从组合式函数中返回响应式对象时，toRefs 相当有用 消费者组件可以解构/展开返回的对象而不会失去响应性：
 * 直接对一个reactive的对象进行解构会丢失响应式
 * 但是可以先对响应式对象执行toRefs操作将其转化为普通对象
 * 然后解构到每一个属性对应的值都是一个toRef的返回值就不会丢失响应式
 */
function toRefs(target) {
    const ret = Array.isArray(target) ? [] : {};
    for (const key in target) {
        ret[key] = toRef(target, key);
    }
    return ret;
}
class ObjectRefImpl {
    constructor(target, key) {
        this.target = target;
        this.key = key;
        this.__v_isRef = true;
    }
    get value() {
        return this.target[this.key];
    }
    set value(newValue) {
        this.target[this.key] = newValue;
    }
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}

function computed(getterOrOptions) {
    let getter;
    let setter;
    if (isFunction(getterOrOptions)) {
        getter = getterOrOptions;
        setter = () => { };
    }
    else {
        getter = getterOrOptions.get || (() => { });
        setter = getterOrOptions.set || (() => { });
    }
    // 创建一个计算属性的实例
    return new ComputedRefImpl(getter, setter);
}
class ComputedRefImpl {
    constructor(getter, setter) {
        this.setter = setter;
        this._dirty = true;
        /**
         * 将计算属性传入的getter看做是一个effect的fn 创建一个effect函数并返回
         * effect有什么用呢？
         * 执行effect可以执行包裹的fn也就是getter
         * 执行getter的过程中会进行依赖收集
         * 后续getter函数中用到的属性发生变化就可以触发属性更新
         *
         * lazy属性表示不会立即执行effect
         * scheduler属性表示更新的时候不走默认执行effect逻辑 而是走scheduler调度器逻辑
         * scheduler采用对象属性写法this是这个options对象
         * scheduler采用箭头函数写法this是计算属性实例
         */
        this.effect = effect(getter, {
            lazy: true,
            scheduler: () => {
                if (!this._dirty) {
                    this._dirty = true;
                }
                // 每次计算属性依赖的属性比如name变化了
                // 需要通知依赖计算属性自己的上一层effect也更新
                trigger(this, "set" /* SET */, "value");
            },
        });
    }
    get value() {
        if (this._dirty) {
            // effect执行的返回值就是getter的返回值
            const res = this.effect();
            this._value = res;
            this._dirty = false;
        }
        // 计算属性实例可以把自己当做对象target 进行依赖收集
        track(this, "get" /* GET */, "value");
        // 然后将值返回
        return this._value;
    }
    //   计算属性不需要主动更新setter
    set value(newValue) {
        this.setter(newValue);
    }
}

exports.computed = computed;
exports.effect = effect;
exports.isRef = isRef;
exports.reactive = reactive;
exports.readonly = readonly;
exports.ref = ref;
exports.shallowReactive = shallowReactive;
exports.shallowReadonly = shallowReadonly;
exports.shallowRef = shallowRef;
exports.toRef = toRef;
exports.toRefs = toRefs;
exports.track = track;
exports.trigger = trigger;
exports.unref = unref;
//# sourceMappingURL=reactivity.cjs.js.map
