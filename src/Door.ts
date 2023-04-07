import { AnimatedSprite, type Texture } from 'pixi.js'

export class Door extends AnimatedSprite {
  static texturesCache: Texture[]
  constructor () {
    super(Door.texturesCache)
  }

  setPosition ({ x, y }: { x?: number, y?: number }): void {
    if (x != null) {
      this.position.x = x
    }
    if (y != null) {
      this.position.y = y
    }
  }

  getRectBounds (): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    return {
      top: this.y,
      right: this.x + this.width,
      bottom: this.y + this.height,
      left: this.x
    }
  }
}
