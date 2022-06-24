# Promise_mini

从 `Promise` 的使用习惯来看，它首先是一个 `Class`，它即可以用来实例化 `promise` 对象，也可以有 `Promise.resolve()`, `Promise.reject()` 等方法。


## 1


`Promise_mini.spec.js`
```js
import Promise_mini from "./Promise_mini";

describe("Promise-mini", () => {
  test("Promise_mini takes 1 functional executor argument in which has 2 functional arguments", () => {
    const executorMock = jest.fn();
    const promise_mini = new Promise_mini(executorMock);
    expect(executorMock.mock.calls.length).toBe(1);
    expect(typeof executorMock.mock.calls[0][0]).toBe("function");
    expect(typeof executorMock.mock.calls[0][1]).toBe("function");
  });
  test("Promise_mini instance should have 'Pending' state (0) on initialization", () => {
    const executorMock = jest.fn();
    const promise_mini = new Promise_mini(executorMock);
    expect(promise_mini.state).toEqual(0);
  });
  test("Promise_mini instance should have 'Fulfilled' state (1) on resolving", () => {
    const mockValue = Number.parseInt(Math.random() * 100);
    const promise_mini = new Promise_mini((resolve, reject) => {
      resolve(mockValue);
    });
    expect(promise_mini.state).toEqual(1);
    expect(promise_mini.value).toEqual(mockValue);
  });
  test("Promise_mini instance should have 'Rejected' state (2) on rejecting", () => {
    const mockReason = 0;
    const promise_mini = new Promise_mini((resolve, reject) => {
      reject(mockReason);
    });
    expect(promise_mini.state).toEqual(2);
  });
});
```

实现
`Promise_mini.js`

```js
const STATE = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

class Promise_mini {
  constructor(executor) {
    this.state = STATE.PENDING;
    init(this, executor);
  }
  then(){}
}

const resolve = (promise, value) => {
  promise.state = STATE.FULFILLED;
  promise.value = value;
};

const reject = (promise, reason) => {
  promise.state = STATE.REJECTED;
};

function init(promise, executor) {
  const resolveHOC = (value) => resolve(promise, value);
  const rejectHOC = (reason) => reject(promise, reason);
  executor(resolveHOC, rejectHOC);
}

export default Promise_mini;
```

`executor` is immediately called by `init` on instantiation.
`resolve` and `reject` is actually not argumnets of `executor`. They are designated to change the state of the `promise_mini` instance upon calling. 
You can definately pass original `resolve` and `reject` to `executor`. They will still be executed when called. But then `resolve` and `reject` would be sort of "blind" because they don't have their first argument `promise`. They become ignorant what to do with `state`.
Therefore wrapped by HOC. The "Closure" mechanism wraps `promise_mini` instance, which is the `this` of `init(this, executor)`, inside HOC and give original `resolve` and `reject` target to work on. 

## 2
To observe changes in the state of `promise_mini` instance. we need a `then` method. This `then` function takes 2 funcitonal argumnets, `onResolved(value)` and `onRejected(reason)`,
- call `onResolved(value)` when `this.state === fulfilled`
- call `onRejected(reason)` when `this.state === rejected`

`Promise_mini.spec.js`
```js
describe("instance.then method", () => {
    test("primise_init instance should have a .then method", () => {
      const executorMock = jest.fn();
      const promise_mini = new Promise_mini(executorMock);
      expect(typeof promise_mini.then).toBe("function");
    });
    test("primise_init instance should transit its state from 'Pending' to 'Fulfilled' when resolved", () => {
      const valueMock = Number.parseInt(Math.random() * 100);
      const onFulfilledMock = jest.fn();
      const onRejectedMock = jest.fn();
      const promise_mini = new Promise_mini((resolve, reject) => {
        resolve(valueMock);
      }).then(onFulfilledMock, onRejectedMock);
      expect(onFulfilledMock).toHaveBeenCalledTimes(1);
      expect(onRejectedMock).toHaveBeenCalledTimes(0);
      expect(onFulfilledMock.mock.calls[0][0]).toBe(valueMock);
    });
    test("primise_init instance should transit its state from 'Pending' to 'Rejected' when resolved", () => {
      const reasonMock = "failed for reason X";
      const onFulfilledMock = jest.fn();
      const onRejectedMock = jest.fn();
      const promise_mini = new Promise_mini((resolve, reject) => {
        reject(reasonMock);
      }).then(onFulfilledMock, onRejectedMock);
      expect(onFulfilledMock).toHaveBeenCalledTimes(0);
      expect(onRejectedMock).toHaveBeenCalledTimes(1);
      expect(onRejectedMock.mock.calls[0][0]).toBe(reasonMock);
    });
  });
```

`Promise_mini.js`
```js

class Promise_mini {
  then(onFulfilled, onRejected) {
    handler(this, onFulfilled, onRejected);
  }
}

function handler(promise, onFulfilled, onRejected) {
  const callback = promise.state === STATE.FULFILLED ? onFulfilled : onRejected;
  callback(promise.value);
}

export default Promise_mini;
```

## 3 one way state transitioning
