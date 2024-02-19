import { b } from "./b";
import { version } from "../package.json";

import("./a.js").then((res) => {
  console.log(res);
});

// console.log(a + b);
console.log(100 + 200);
console.log(version);

export { b, version };
