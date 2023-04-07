import { Container, type Texture } from 'pixi.js'
import { Level } from './Level'
import { type IPlayerOptions, Player } from './Player'
import { StatusBar } from './StatusBar'
import { StartModal } from './StartModal'
import { InputHandler } from './InputHandler'
import { EPlayerState } from './playerStates'
import { CollisionBlock } from './CollisionBlock'
import { MapSettings } from './MapSettings'
import { Door } from './Door'

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
  public doors = new Container<Door>()
  constructor (options: IGameOptions) {
    super()

    Door.texturesCache = options.textures.doopOpenTextures

    this.setup(options)

    this.addEventLesteners()

    this.runLevel()

    setTimeout(() => {
      void this.level.idleLoad().catch(console.error)
    }, 2000)
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

    this.addChild(this.collisionBlocks)
    this.addChild(this.doors)

    this.player = new Player({ game: this, textures: kingTextures })
    this.addChild(this.player)

    this.inputHandler = new InputHandler({ eventTarget: this, relativeToTarget: this.player })

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
    while (this.doors.children[0] != null) {
      this.doors.children[0].removeFromParent()
    }
  }

  startGame = (): void => {
    this.startModal.visible = false
    this.gameEnded = false
    this.time = 0
    this.player.restart()
    this.inputHandler.restart()
    this.currentLevel = Game.options.startLevel
    this.cleanFromAll()
    this.runLevel()
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

  runLevel (increment?: boolean): void {
    this.cleanFromAll()
    if (increment === true) {
      this.currentLevel++
    }
    if (this.currentLevel > 3) {
      this.currentLevel = 1
    }
    const { collisionPoints, playerPosition, doorPosition } = this.level.initLevel(this.currentLevel)

    collisionPoints.forEach(cp => {
      this.collisionBlocks.addChild(new CollisionBlock({
        initX: cp.x,
        initY: cp.y,
        cell: MapSettings.options.cell
      }))
    })

    this.player.setPosition(playerPosition)
    this.player.setState(EPlayerState.idleRight)

    const door = new Door()
    door.setPosition(doorPosition)

    this.doors.addChild(door)

    this.statusBar.updateLevel(this.currentLevel)
  }
}
