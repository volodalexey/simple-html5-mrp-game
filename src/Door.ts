import { AnimatedSprite, type Texture } from 'pixi.js'

export class Door extends AnimatedSprite {
  static texturesCache: Texture[]
  public frameTimer = 0

  static fps = 20
  static options = {
    frameInterval: 1000 / Door.fps
  }

  constructor () {
    super(Door.texturesCache)
    this.loop = false
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

  handleUpdate (deltaMS: number): void {
    if (this.frameTimer > Door.options.frameInterval) {
      this.frameTimer = 0
      if (this.currentFrame < this.totalFrames - 1) {
        this.currentFrame++
      } else if (this.loop) {
        this.currentFrame = 0
      }
    } else {
      this.frameTimer += deltaMS
    }
  }
}
