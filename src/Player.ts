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
import { logPlayerState } from './logger'

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

  constructor (options: IPlayerOptions) {
    super()
    this.game = options.game
    this.setup(options)

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
    spritesContainer.addChild(enterDoorLeftAnimation)
    this.enterDoorLeftAnimation = enterDoorLeftAnimation

    const enterDoorRightAnimation = new AnimatedSprite(enterDoorRightTextures)
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
    return true
  }

  isFalling (): boolean {
    return this.velocity.vy > Player.options.gravity
  }

  stop (): void {
    this.velocity.vx = 0
    this.velocity.vy = 0
  }

  handleUpdate (deltaMS: number): void {
    this.checkCollision()
    this.currentState.handleInput()

    const { inputHandler } = this.game
    // HORIZONTAL MOVEMENT
    this.x += this.velocity.vx
    if (inputHandler.hasDirectionLeft()) {
      this.velocity.vx = -Player.options.moveSpeed
    } else if (inputHandler.hasDirectionRight()) {
      this.velocity.vx = Player.options.moveSpeed
    } else {
      this.velocity.vx = 0
    }

    // VERTICAL MOVEMENT
    this.y += this.velocity.vy
    if (!this.isOnGround()) {
      this.velocity.vy += Player.options.gravity
    } else {
      this.velocity.vy = 0
    }

    // SPRITE ANIMATION
    if (this.frameTimer > Player.options.frameInterval) {
      this.frameTimer = 0
      if (this.currentAnimation.currentFrame < this.currentAnimation.totalFrames - 1) {
        this.currentAnimation.currentFrame++
      } else {
        this.currentAnimation.currentFrame = 0
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

  checkCollision (): void {
    this.game.collisionBlocks.children.forEach((collisionBlock) => {
      if (
        collisionBlock.x < this.x + this.width &&
        collisionBlock.x + collisionBlock.width > this.x &&
        collisionBlock.y < this.y + this.height &&
        collisionBlock.y + collisionBlock.height > this.y
      ) {
        console.log('Collision')
      }
    })
  }
}
