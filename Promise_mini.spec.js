import Promise_mini from "./Promise_mini";

describe("Promise-mini", () => {
  describe("instantiation", () => {
    test("Promise_mini Class takes 1 functional executor argument in which has 2 functional arguments", () => {
      const executorMock = jest.fn();
      const promise_mini = new Promise_mini(executorMock);
      expect(executorMock.mock.calls.length).toBe(1);
      expect(typeof executorMock.mock.calls[0][0]).toBe("function");
      expect(typeof executorMock.mock.calls[0][1]).toBe("function");
    });
    test("promise_mini instance should have 'Pending' state (0) on initialization", () => {
      const executorMock = jest.fn();
      const promise_mini = new Promise_mini(executorMock);
      expect(promise_mini.state).toEqual(0);
    });
    test("promise_mini instance should have 'Fulfilled' state (1) on resolving", () => {
      const valueMock = Number.parseInt(Math.random() * 100);
      const promise_mini = new Promise_mini((resolve, reject) => {
        resolve(valueMock);
      });
      expect(promise_mini.state).toEqual(1);
      expect(promise_mini.value).toEqual(valueMock);
    });
    test("promise_mini instance should have 'Rejected' state (2) on rejecting", () => {
      const reasonMock = "failed for reason X";
      const promise_mini = new Promise_mini((resolve, reject) => {
        reject(reasonMock);
      });
      expect(promise_mini.state).toEqual(2);
      expect(promise_mini.value).toEqual(reasonMock);
    });
  });
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
      });
      promise_mini.then(onFulfilledMock, onRejectedMock);
      expect(onFulfilledMock).toHaveBeenCalledTimes(1);
      expect(onRejectedMock).toHaveBeenCalledTimes(0);
      expect(onFulfilledMock.mock.calls[0][0]).toBe(valueMock);
      expect(promise_mini.state).toBe(1);
      expect(promise_mini.value).toBe(valueMock);
    });
    test("primise_init instance should transit its state from 'Pending' to 'Rejected' when resolved", () => {
      const reasonMock = "failed for reason X";
      const onFulfilledMock = jest.fn();
      const onRejectedMock = jest.fn();
      const promise_mini = new Promise_mini((resolve, reject) => {
        reject(reasonMock);
      });
      promise_mini.then(onFulfilledMock, onRejectedMock);
      expect(onFulfilledMock).toHaveBeenCalledTimes(0);
      expect(onRejectedMock).toHaveBeenCalledTimes(1);
      expect(onRejectedMock.mock.calls[0][0]).toBe(reasonMock);
      expect(promise_mini.state).toBe(2);
      expect(promise_mini.value).toBe(reasonMock);
    });
  });
  describe("transition lock", () => {
    test("primise_init instance state can't transition from 'Fulfilled' to 'Rejected'", () => {
      const valueMock = Number.parseInt(Math.random() * 100);
      const reasonMock = "failed for reason X";
      const onFulfilledMock = jest.fn();
      const onRejectedMock = jest.fn();
      const promise_mini = new Promise_mini((resolve, reject) => {
        resolve(valueMock);
        reject(reasonMock);
      });
      promise_mini.then(onFulfilledMock, onRejectedMock);
      expect(onFulfilledMock).toHaveBeenCalledTimes(1);
      expect(onRejectedMock).toHaveBeenCalledTimes(0);
      expect(onFulfilledMock.mock.calls[0][0]).toBe(valueMock);
      expect(promise_mini.state).toBe(1);
      expect(promise_mini.value).toBe(valueMock);
    });
    test("primise_init instance state can't transition from 'Rejected' to 'Fulfilled'", () => {
      const valueMock = Number.parseInt(Math.random() * 100);
      const reasonMock = "failed for reason X";
      const onFulfilledMock = jest.fn();
      const onRejectedMock = jest.fn();
      const promise_mini = new Promise_mini((resolve, reject) => {
        reject(reasonMock);
        resolve(valueMock);
      });
      promise_mini.then(onFulfilledMock, onRejectedMock);
      expect(onRejectedMock).toHaveBeenCalledTimes(1);
      expect(onFulfilledMock).toHaveBeenCalledTimes(0);
      expect(onRejectedMock.mock.calls[0][0]).toBe(reasonMock);
      expect(promise_mini.state).toBe(2);
      expect(promise_mini.value).toBe(reasonMock);
    });
  });
});
