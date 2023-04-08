import { AnimatedSprite, Container, Graphics, type Texture } from 'pixi.js'
import {
  IdleLeft, IdleRight,
  RunLeft, RunRight,
  JumpLeft, JumpRight,
  FallLeft, FallRight,
  EnterDoorLeft, EnterDoorRight,
  type PlayerState, EPlayerState
} from './playerStates'
import { type Game } from './Game'
import { logPlayerBounds, logPlayerState } from './logger'
import { type CollisionBlock } from './CollisionBlock'

export interface IPlayerOptions {
  game: Game
  textures: {
    enterDoorLeftTextures: Texture[]
    enterDoorRightTextures: Texture[]
    idleLeftTextures: Texture[]
    idleRightTextures: Texture[]
    runLeftTextures: Texture[]
    runRightTextures: Texture[]
  }
}

export enum PlayerAnimation {
  idleLeft = 'idleLeft',
  idleRight = 'idleRight',
  runLeft = 'runLeft',
  runRight = 'runRight',
  enterDoorLeft = 'enterDoorLeft',
  enterDoorRight = 'enterDoorRight',
}

export class Player extends Container {
  public velocity = {
    vx: 0,
    vy: 0
  }

  public hitbox = {
    position: {
      x: 0,
      y: 0
    },
    offset: {
      x: 4,
      y: 4
    },
    width: 50,
    height: 53
  }

  public frameTimer = 0

  static fps = 20
  static options = {
    moveSpeed: 5,
    jumpSpeed: 25,
    gravity: 1,
    frameInterval: 1000 / Player.fps
  }

  public game!: Game
  public states!: Record<EPlayerState, PlayerState>
  public currentState!: PlayerState
  idleLeftAnimation!: AnimatedSprite
  idleRightAnimation!: AnimatedSprite
  runLeftAnimation!: AnimatedSprite
  runRightAnimation!: AnimatedSprite
  enterDoorLeftAnimation!: AnimatedSprite
  enterDoorRightAnimation!: AnimatedSprite
  public currentAnimation!: AnimatedSprite
  spritesContainer!: Container<AnimatedSprite>
  public playerBox!: Graphics
  public groundBlock?: CollisionBlock

  constructor (options: IPlayerOptions) {
    super()
    this.game = options.game
    this.setup(options)
    this.updateHitbox()
    if (logPlayerBounds.enabled) {
      const graphics = new Graphics()
      graphics.beginFill(0xff00ff)
      graphics.drawRect(0, 0, this.width, this.height)
      graphics.endFill()
      graphics.alpha = 0.5
      this.addChild(graphics)

      const hitboxGraphics = new Graphics()
      hitboxGraphics.beginFill(0x00ffff)
      hitboxGraphics.drawRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)
      hitboxGraphics.endFill()
      hitboxGraphics.alpha = 0.5
      this.addChild(hitboxGraphics)
    }

    this.states = {
      [EPlayerState.idleLeft]: new IdleLeft({ game: options.game }),
      [EPlayerState.idleRight]: new IdleRight({ game: options.game }),
      [EPlayerState.runLeft]: new RunLeft({ game: options.game }),
      [EPlayerState.runRight]: new RunRight({ game: options.game }),
      [EPlayerState.jumpLeft]: new JumpLeft({ game: options.game }),
      [EPlayerState.jumpRight]: new JumpRight({ game: options.game }),
      [EPlayerState.fallLeft]: new FallLeft({ game: options.game }),
      [EPlayerState.fallRight]: new FallRight({ game: options.game }),
      [EPlayerState.enterDoorLeft]: new EnterDoorLeft({ game: options.game }),
      [EPlayerState.enterDoorRight]: new EnterDoorRight({ game: options.game })
    }
  }

  setup ({
    textures: {
      idleLeftTextures,
      idleRightTextures,
      runLeftTextures,
      runRightTextures,
      enterDoorLeftTextures,
      enterDoorRightTextures
    }
  }: IPlayerOptions): void {
    const playerBox = new Graphics()
    this.addChild(playerBox)
    this.playerBox = playerBox

    const spritesContainer = new Container<AnimatedSprite>()
    this.addChild(spritesContainer)
    this.spritesContainer = spritesContainer

    const idleLeftAnimation = new AnimatedSprite(idleLeftTextures)
    spritesContainer.addChild(idleLeftAnimation)
    this.idleLeftAnimation = idleLeftAnimation

    const idleRightAnimation = new AnimatedSprite(idleRightTextures)
    spritesContainer.addChild(idleRightAnimation)
    this.idleRightAnimation = idleRightAnimation

    const runLeftAnimation = new AnimatedSprite(runLeftTextures)
    spritesContainer.addChild(runLeftAnimation)
    this.runLeftAnimation = runLeftAnimation

    const runRightAnimation = new AnimatedSprite(runRightTextures)
    spritesContainer.addChild(runRightAnimation)
    this.runRightAnimation = runRightAnimation

    const enterDoorLeftAnimation = new AnimatedSprite(enterDoorLeftTextures)
    enterDoorLeftAnimation.loop = false
    spritesContainer.addChild(enterDoorLeftAnimation)
    this.enterDoorLeftAnimation = enterDoorLeftAnimation

    const enterDoorRightAnimation = new AnimatedSprite(enterDoorRightTextures)
    enterDoorRightAnimation.loop = false
    spritesContainer.addChild(enterDoorRightAnimation)
    this.enterDoorRightAnimation = enterDoorRightAnimation
  }

  hideAllAnimations (): void {
    this.spritesContainer.children.forEach(spr => {
      spr.visible = false
    })
  }

  switchAnimation (animation: PlayerAnimation): void {
    this.hideAllAnimations()
    switch (animation) {
      case PlayerAnimation.idleLeft:
        this.currentAnimation = this.idleLeftAnimation
        break
      case PlayerAnimation.idleRight:
        this.currentAnimation = this.idleRightAnimation
        break
      case PlayerAnimation.runLeft:
        this.currentAnimation = this.runLeftAnimation
        break
      case PlayerAnimation.runRight:
        this.currentAnimation = this.runRightAnimation
        break
      case PlayerAnimation.enterDoorLeft:
        this.currentAnimation = this.enterDoorLeftAnimation
        break
      case PlayerAnimation.enterDoorRight:
        this.currentAnimation = this.enterDoorRightAnimation
        break
    }
    this.currentAnimation.currentFrame = 0
    this.currentAnimation.visible = true
  }

  setState (state: EPlayerState): void {
    this.currentState = this.states[state]
    this.currentState.enter()
    logPlayerState(`state=${state}`)
  }

  jump (): void {
    this.velocity.vy = -Player.options.jumpSpeed
  }

  isOnGround (): boolean {
    return Boolean(this.groundBlock)
  }

  isFalling (): boolean {
    return this.velocity.vy > Player.options.gravity
  }

  stop (): void {
    this.velocity.vx = 0
    this.velocity.vy = 0
  }

  isEnteringDoorState (): boolean {
    return [this.states[EPlayerState.enterDoorLeft], this.states[EPlayerState.enterDoorRight]].includes(this.currentState)
  }

  handleUpdate (deltaMS: number): void {
    const { inputHandler } = this.game

    const isEnterDoor = this.isEnteringDoorState()

    if (!isEnterDoor) {
      this.currentState.handleInput()
      if (inputHandler.hasDirectionLeft()) {
        this.velocity.vx = -Player.options.moveSpeed
      } else if (inputHandler.hasDirectionRight()) {
        this.velocity.vx = Player.options.moveSpeed
      } else {
        this.velocity.vx = 0
      }
      this.x += this.velocity.vx
    }

    this.checkForHorizontalCollisions()
    this.applyGravity()
    this.checkForVerticalCollisions()

    // SPRITE ANIMATION
    if (this.frameTimer > Player.options.frameInterval) {
      this.frameTimer = 0
      if (this.currentAnimation.currentFrame < this.currentAnimation.totalFrames - 1) {
        this.currentAnimation.currentFrame++
      } else if (this.currentAnimation.loop) {
        this.currentAnimation.currentFrame = 0
      }
      if (isEnterDoor && this.currentAnimation.currentFrame >= 0 && !this.game.transitionToOverlay) {
        this.game.transitionToOverlay = true
      }
    } else {
      this.frameTimer += deltaMS
    }
  }

  restart (): void {
    this.velocity.vx = 0
    this.velocity.vy = 0
    this.setState(EPlayerState.idleRight)
  }

  checkForHorizontalCollisions (): void {
    this.updateHitbox()
    const playerBounds = this.getHitboxBounds()

    for (let i = 0; i < this.game.collisionBlocks.children.length; i++) {
      const collisionBlock = this.game.collisionBlocks.children[i]
      const blockBounds = collisionBlock.getRectBounds()

      if (
        playerBounds.left <= blockBounds.right &&
        playerBounds.right >= blockBounds.left &&
        playerBounds.bottom >= blockBounds.top &&
        playerBounds.top <= blockBounds.bottom
      ) {
        if (this.velocity.vx < 0) {
          this.setPosition({ x: blockBounds.right + 1 })
          break
        }

        if (this.velocity.vx > 0) {
          this.setPosition({ x: blockBounds.left - this.hitbox.width - 1 })
          break
        }
      }
    }
  }

  checkForVerticalCollisions (): void {
    this.updateHitbox()
    const playerBounds = this.getHitboxBounds()
    this.groundBlock = undefined
    for (let i = 0; i < this.game.collisionBlocks.children.length; i++) {
      const collisionBlock = this.game.collisionBlocks.children[i]
      const blockBounds = collisionBlock.getRectBounds()

      if (
        playerBounds.left <= blockBounds.right &&
        playerBounds.right >= blockBounds.left &&
        playerBounds.bottom >= blockBounds.top &&
        playerBounds.top <= blockBounds.bottom
      ) {
        if (this.velocity.vy < 0) {
          this.velocity.vy = 0
          this.setPosition({ y: blockBounds.bottom + 1 })
          break
        }

        if (this.velocity.vy > 0) {
          this.velocity.vy = 0
          this.groundBlock = collisionBlock
          this.setPosition({ y: blockBounds.top - this.hitbox.height - 1 })
          break
        }
      }
    }
  }

  applyGravity (): void {
    this.velocity.vy += Player.options.gravity
    this.position.y += this.velocity.vy
  }

  updateHitbox (): void {
    const { position, offset, width, height } = this.hitbox
    position.x = this.position.x + (this.width - width) / 2 + offset.x
    position.y = this.position.y + (this.height - height) / 2 + offset.y
  }

  setPosition ({ x, y }: { x?: number, y?: number }): void {
    this.updateHitbox()
    if (x != null) {
      this.position.x = x + (this.position.x - this.hitbox.position.x)
    }
    if (y != null) {
      this.position.y = y + (this.position.y - this.hitbox.position.y)
    }
  }

  getHitboxBounds (): {
    top: number
    right: number
    bottom: number
    left: number
  } {
    return {
      top: this.hitbox.position.y,
      right: this.hitbox.position.x + this.hitbox.width,
      bottom: this.hitbox.position.y + this.hitbox.height,
      left: this.hitbox.position.x
    }
  }

  checkDoorsCollision (): boolean {
    this.updateHitbox()
    const playerBounds = this.getHitboxBounds()
    return this.game.doors.children.some(door => {
      const doorBounds = door.getRectBounds()
      if (
        playerBounds.right <= doorBounds.right &&
          playerBounds.left >= doorBounds.left &&
          playerBounds.bottom >= doorBounds.top &&
          playerBounds.top <= doorBounds.bottom
      ) {
        if (this.currentState === this.states[EPlayerState.idleLeft]) {
          this.setState(EPlayerState.enterDoorLeft)
        } else {
          this.setState(EPlayerState.enterDoorRight)
        }
        return true
      }
      return false
    })
  }
}
