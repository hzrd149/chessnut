export default class Signal {
  private listeners = new Set<Function>();
  on(fn: Function) {
    this.listeners.add(fn);
  }
  off(fn: Function) {
    this.listeners.delete(fn);
  }
  notify() {
    for (const fn of this.listeners) fn();
  }
}
