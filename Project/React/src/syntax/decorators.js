class Demo {
  @validRange(100, 200)
  num = 150;
}

function validRange(min, max) {
  return function (target, prop, desc) {
    console.log({
      target,
      prop,
      desc,
    });
    Object.defineProperty(target, prop, {
      set(newValue) {
        if (newValue < min || newValue > max) {
          throw new RangeError();
        }
      },
    });
  };
}

const d = new Demo();
d.num = 500;
