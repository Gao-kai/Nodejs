import { isTracking, trackEffects, triggerEffects } from "../effect";
import { toReactive } from "../reactive";

/**
 *
 */
export function ref(value) {
  return createRef(value);
}

function createRef(rawValue) {
  return new RefImpl(rawValue);
}

class RefImpl {
  public dep;
  public __v_isRef;
  public _value;

  constructor(public _rawValue) {
    this._value = toReactive(_rawValue);
  }

  get value() {
    if (isTracking()) {
      trackEffects(this.dep || (this.dep = new Set()));
    }
    return this._value;
  }

  set value(newValue) {
    if (newValue !== this._rawValue) {
      this._rawValue = newValue; // 原值修改
      this._value = toReactive(this._rawValue); // 再次响应式
      triggerEffects(this.dep); // 触发更新
    }
  }
}

export function shallowRef(value) {}
