import {
  observable,
  autorun,
  observe,
  computed,
  reaction,
  action,
  configure,
  runInAction,
} from "mobx";

/* 强制规定修改状态比如通过定义action来修改 */
configure({
  enforceActions: "observed",
});

class Store {
  @observable count = 10;
  @observable price = 200;
  @observable name = "lilei";
  @computed get total() {
    console.log("computed total执行一次");
    return this.count * this.price;
  }

  @action.bound change() {
    this.name = "zhaoxiao";
  }

  @action.bound async query() {
    let res = 0;
    try {
      res = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(1000);
        }, 1000);
      });
    } catch (error) {}
    runInAction(() => {
      this.count = res;
    });
  }
}

const store = new Store();

autorun(() => {
  //   console.log("autorun", store.name, store.price * store.count);
  console.log("autorun", store.count);
});

store.query();
