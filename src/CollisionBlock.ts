import { Sprite, type Texture } from 'pixi.js'

interface ICollisionBlockOptions {
  initX: number
  initY: number
  texture?: Texture
}

export class CollisionBlock extends Sprite {
  constructor ({ initX, initY, texture }: ICollisionBlockOptions) {
    super(texture)
    this.position.set(initX, initY)
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
