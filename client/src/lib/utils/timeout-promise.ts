type PromiseCallback<T> = ConstructorParameters<typeof Promise<T>>[0]

class TimeoutPromise<T> implements Promise<T> {
  private _p: Promise<T>;
  private _resolve: Parameters<PromiseCallback<T>>[0] | undefined;
  private _reject: Parameters<PromiseCallback<T>>[1] | undefined;
  private _timerId: number = 0;


  constructor(callback: PromiseCallback<T>, delay_ms: number) {
    this._p = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      this._timerId = setTimeout(() => {
        callback(resolve, reject)
      }, delay_ms) as any;
    })
  }

  get timerId() { return this._timerId; }

  abort = (reason?: any) => {
    if(!this._reject) throw Error ("Could not abort TimeoutPromise. It is not yet initialized")
    return this._reject(reason);
  }

  finish: Parameters<PromiseCallback<T>>[0] = (value) => {
    if(!this._resolve) throw Error ("Could not finish TimeoutPromise. It is not yet initialized")
    return this._resolve(value);
  }

  then: Promise<T>['then'] = (onFulfilled, onRejected) => this._p.then(onFulfilled, onRejected);
  catch: Promise<T>['catch'] = (onRejected) => this._p.catch(onRejected);
  finally: Promise<T>['finally'] = (onfinally) => this._p.finally(onfinally);

  [Symbol.toStringTag]: string = "TimeoutPromise";
}


export default TimeoutPromise;