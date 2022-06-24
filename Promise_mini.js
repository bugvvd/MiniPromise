const STATE = { PENDING: 0, FULFILLED: 1, REJECTED: 2 };

class Promise_mini {
  constructor(executor) {
    this.state = STATE.PENDING;
    // no value on instantiation
    // but is attached when resolve or reject is called
    init(this, executor);
  }
  then(onFulfilled, onRejected) {
    handler(this, onFulfilled, onRejected);
  }
}

const resolve = (promise, value) => {
  promise.state = STATE.FULFILLED;
  promise.value = value;
};

const reject = (promise, reason) => {
  promise.state = STATE.REJECTED;
  promise.value = reason;
};

function init(promise, executor) {
  let transitionLock = false;
  const resolveHOC = (value) => {
    if (transitionLock) {
      return;
    }
    transitionLock = true;
    resolve(promise, value);
  };
  const rejectHOC = (reason) => {
    if (transitionLock) {
      return;
    }
    transitionLock = true;
    reject(promise, reason);
  };
  executor(resolveHOC, rejectHOC);
}

function handler(promise, onFulfilled, onRejected) {
  const callback = promise.state === STATE.FULFILLED ? onFulfilled : onRejected;
  callback(promise.value);
}

export default Promise_mini;
