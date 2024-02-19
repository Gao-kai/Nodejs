// import { defineStore } from "pinia";
import { defineStore } from "../pinia/index.js";
import { ref, computed } from "vue";

export const useCounterStore1 = defineStore("counter1", {
  // id:"counter1"
  state: () => {
    return {
      count: 0,
    };
  },
  getters: {
    double1() {
      return this.count * 2;
    },
  },
  actions: {
    increment(payload: number) {
      this.count += payload;
    },
  },
});

export const useCounterStore2 = defineStore("counter2", () => {
  const count = ref(10);

  const double = computed(() => {
    return count.value * 2;
  });

  const increment = (payload: number) => {
    count.value += payload;
  };

  return {
    count,
    double,
    increment,
  };
});
