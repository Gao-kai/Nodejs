

<template>
  <h1>Pinia</h1>
  <h1>{{ count }}</h1>
  <h1>{{ double1 }}</h1>
  <button @click="handleClick1">this修改状态</button>
  <button @click="handleClick3">patch修改状态</button>
  <button @click="handleReset">handleReset</button>
  <hr color="pink">

  <!-- <h1>{{ counterStore2.count }}</h1>
  <h1>{{ counterStore2.double }}</h1>
  <button @click="handleClick2">修改状态</button> -->
</template>



<script setup lang="ts">
import { toRefs } from 'vue';
import { useCounterStore1 } from './stores/counter'
import { useCounterStore2 } from './stores/counter'
// import { storeToRefs } from 'pinia';
import { storeToRefs } from './pinia/storeToRefs.js'

const counterStore1 = useCounterStore1();
console.log({ counterStore1 });
// console.log(Object.keys(counterStore1));

// const { count, double1 } = counterStore1 xx
// const { count, double1 } = toRefs(counterStore1)
const { count, double1 } = storeToRefs(counterStore1)
// const count = counterStore1.count
// const double1 = counterStore1.double1
console.log({ count, double1 });


/**
 *
 * [
    "$id", 模块id
    "$onAction",
    "$patch",
    "$reset",
    "$subscribe",
    "$dispose",
    "count", 状态
    "increment", action
    "double", getters
    "_hotUpdate",
    "_isOptionsAPI"
]
 */
const handleClick1 = () => {
  // this指向counterStore或者window 都应该符合要求
  let increment = counterStore1.increment
  increment(10)
}

const handleClick3 = () => {
  // counterStore1.$patch({ count: 1000 })
  counterStore1.$patch((state) => {
    state.count = 5555
  })
}

const handleReset = () => {
  counterStore1.$reset();
}

counterStore1.$subscribe((storeInfo, state) => {

  console.log(storeInfo, state);
})
/* 发布订阅 */
counterStore1.$onAction(({ after, onError }) => {

  console.log('$onAction', counterStore1.count);

  after(() => {
    console.log('after1', counterStore1.count);
  })


  onError(() => {
    console.log('onError');
  })
})

// counterStore1.$state = {
//   count: 666666
// }

// setTimeout(() => {
//   console.log(1111);

//   counterStore1.$state = {
//     count: 666666
//   }

//   counterStore1.$dispose();
// }, 2000);


// *---********************************

// const counterStore2 = useCounterStore2();
// const handleClick2 = () => {
//   counterStore2.increment(10)
// }

</script>
