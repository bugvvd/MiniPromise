"use strict";

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MiniPromise {
  constructor(executor) {
    this.state = PENDING;
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledQueue = [];
    this.onRejectedQueue = [];
    _execute(this, executor);
  }

  then(onFulfilled, onRejected) {
    const promise2 = new MiniPromise((resolve, reject) => {
      _handle(this, { onFulfilled, onRejected }, resolve, reject);
    });
    return promise2;
  }
}

const _execute = (promise, executor) => {
  if (typeof executor !== "function") {
    throw `Promise executor ${executor} is not a function`;
  }
  const resolveWithValue = (value) => _resolve(promise, value);
  const rejectWithReason = (reason) => _reject(promise, reason);
  try {
    executor(resolveWithValue, rejectWithReason);
  } catch (error) {
    _reject(promise, error);
  }
};

const _resolve = (promise, x) => {
  if (promise.state === FULFILLED || promise.state === REJECTED) return;
  if (promise === x) {
    throw new TypeError("Chaining cycle detected for promise");
  }
  if (x instanceof MiniPromise) {
    x.then(
      (value) => {
        _resolve(promise, value);
      },
      (reason) => {
        _reject(promise, reason);
      }
    );
  } else if (x && (typeof x === "function" || typeof x === "object")) {
    let used = false;
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (value) => {
            if (!used) _resolve(promise, value);
            used = true;
          },
          (reason) => {
            if (!used) _reject(promise, reason);
            used = true;
          }
        );
      } else {
        _fulfill(promise, x);
      }
    } catch (error) {
      if (!used) _reject(promise, error);
    }
  } else {
    _fulfill(promise, x);
  }
};

const _fulfill = (promise, value) => {
  if (promise.state === PENDING) {
    promise.state = FULFILLED;
    promise.value = value;
    promise.onFulfilledQueue.forEach((onFulfilled) => onFulfilled(value));
  }
};

const _reject = (promise, reason) => {
  if (promise.state === PENDING) {
    promise.state = REJECTED;
    promise.reason = reason;
    promise.onRejectedQueue.forEach((onRejected) => onRejected(reason));
  }
};

const _handle = (promise, handler, resolve, reject) => {
  const onFulfilled =
    typeof handler.onFulfilled === "function"
      ? handler.onFulfilled
      : (value) => value;
  const onRejected =
    typeof handler.onRejected === "function"
      ? handler.onRejected
      : (reason) => {
          throw reason;
        };
  if (promise.state === FULFILLED) {
    setTimeout(() => {
      try {
        resolve(onFulfilled(promise.value));
      } catch (error) {
        reject(error);
      }
    });
  }
  if (promise.state === REJECTED) {
    setTimeout(() => {
      try {
        resolve(onRejected(promise.reason));
      } catch (error) {
        reject(error);
      }
    });
  }
  if (promise.state === PENDING) {
    promise.onFulfilledQueue.push((value) => {
      setTimeout(() => {
        try {
          resolve(onFulfilled(value));
        } catch (error) {
          reject(error);
        }
      });
    });
    promise.onRejectedQueue.push((reason) => {
      setTimeout(() => {
        try {
          resolve(onRejected(reason));
        } catch (error) {
          reject(error);
        }
      });
    });
  }
};

MiniPromise.defer = MiniPromise.deferred = function () {
  let dfd = {};
  dfd.promise = new MiniPromise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  });
  return dfd;
};

module.exports = MiniPromise;
