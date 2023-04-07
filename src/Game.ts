import { Container, type Texture } from 'pixi.js'
import { Level } from './Level'
import { type IPlayerOptions, Player } from './Player'
import { StatusBar } from './StatusBar'
import { StartModal } from './StartModal'
import { InputHandler } from './InputHandler'
import { EPlayerState } from './playerStates'
import { type CollisionBlock } from './CollisionBlock'

export interface IGameOptions {
  viewWidth: number
  viewHeight: number
  textures: {
    doopOpenTextures: Texture[]
    kingTextures: IPlayerOptions['textures']
    boxTexture: Texture
  }
}

export class Game extends Container {
  public gameEnded = false
  public time = 0

  static options = {
    startLevel: 1,
    maxTime: 50000
  }

  public currentLevel = Game.options.startLevel

  public player!: Player
  public inputHandler!: InputHandler
  public level!: Level
  public statusBar!: StatusBar
  public startModal!: StartModal
  public collisionBlocks = new Container<CollisionBlock>()
  constructor (options: IGameOptions) {
    super()

    this.setup(options)

    this.addEventLesteners()

    this.player.setState(EPlayerState.idleRight)
  }

  setup ({
    viewWidth,
    viewHeight,
    textures: {
      kingTextures
    }
  }: IGameOptions): void {
    const level = new Level()
    this.addChild(level)
    this.level = level

    this.statusBar = new StatusBar()
    this.addChild(this.statusBar)

    this.player = new Player({ game: this, textures: kingTextures })
    this.addChild(this.player)

    this.inputHandler = new InputHandler({ eventTarget: this, relativeToTarget: this.player })

    this.addChild(this.collisionBlocks)

    this.startModal = new StartModal({ viewWidth, viewHeight })
    this.startModal.visible = false
    this.addChild(this.startModal)
  }

  addEventLesteners (): void {
    this.startModal.on('click', this.startGame)
  }

  cleanFromAll (): void {
    while (this.collisionBlocks.children[0] != null) {
      this.collisionBlocks.children[0].removeFromParent()
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.gameEnded = false
    this.player.restart()
    this.inputHandler.restart()
    this.currentLevel = Game.options.startLevel
    this.statusBar.updateLevel(this.currentLevel)
    this.cleanFromAll()
  }

  endGame (): void {
    this.gameEnded = true
    this.player.stop()
    this.startModal.visible = true
    const success = this.currentLevel === 3
    this.startModal.reasonText.text = success ? 'Win!!' : 'Time out!'
  }

  handleResize (options: {
    viewWidth: number
    viewHeight: number
  }): void {
    // this.scale.set(options.viewHeight / this.cityBackground.bgHeight)
    this.startModal.handleResize({ scaleX: this.scale.x, scaleY: this.scale.y, ...options })
  }

  handleUpdate (deltaMS: number): void {
    if (this.gameEnded) {
      return
    }
    this.time += deltaMS
    this.statusBar.updateTime(this.time)
    if (this.time > Game.options.maxTime) {
      this.endGame()
    }
    this.player.handleUpdate(deltaMS)
  }
}
