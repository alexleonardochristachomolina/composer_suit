import { Event } from "./lib/event"

export * from "./lib/event"

export abstract class Control {}

export interface IVector {
  x: number
  y: number
}

export interface IValue {
  value: number
}

export class VectorControl extends Control implements IVector {
  constructor(public x = 0, public y = 0) {
    super()
  }

  length = () => Math.sqrt(this.x * this.x + this.y * this.y)

  apply = (v: IVector) => {
    this.x = v.x
    this.y = v.y
    return this
  }

  normalize = () => {
    const length = this.length()
    if (length > 0) {
      this.x /= length
      this.y /= length
    }
    return this
  }

  deadzone = (threshold = 0.2) => {
    const length = this.length()

    if (length < threshold) {
      this.x = 0
      this.y = 0
    } else {
      this.normalize()
      this.x = (this.x * (length - threshold)) / (1 - threshold)
      this.y = (this.y * (length - threshold)) / (1 - threshold)
    }

    return this
  }
}

export class ValueControl extends Control implements IValue {
  constructor(public value = 0) {
    super()
  }

  apply(v: number) {
    this.value = v
    return this
  }

  clamp(min = 0, max = 1) {
    this.value = Math.min(Math.max(this.value, min), max)
    return this
  }
}

export abstract class Device {
  abstract update(): void
}

export class KeyboardDevice extends Device {
  keys = new Set<string>()

  constructor() {
    super()

    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
  }

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
  }

  update() {}

  getKey(code: string) {
    return this.keys.has(code) ? 1 : 0
  }

  getAxis(minKey: string, maxKey: string) {
    return this.getKey(maxKey) - this.getKey(minKey)
  }

  getVector(
    xMinKey: string,
    xMaxKey: string,
    yMinKey: string,
    yMaxKey: string
  ) {
    return {
      x: this.getAxis(xMinKey, xMaxKey),
      y: this.getAxis(yMinKey, yMaxKey)
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code)
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code)
  }
}

export class GamepadDevice extends Device {
  constructor(public index: number) {
    super()
  }

  lastTimestamp: number = 0
  gamepad: Gamepad | null = null

  onActivity = new Event()

  update() {
    this.gamepad = navigator.getGamepads()[this.index]

    if (this.gamepad && this.gamepad.timestamp !== this.lastTimestamp) {
      this.onActivity.emit()
      this.lastTimestamp = this.gamepad.timestamp
    }
  }

  getButton = (index: number) => this.gamepad?.buttons[index].value ?? 0

  getAxis = (index: number) => this.gamepad?.axes[index] ?? 0

  getVector = (xAxis: number, yAxis: number) => ({
    x: this.getAxis(xAxis),
    y: this.getAxis(yAxis)
  })
}
