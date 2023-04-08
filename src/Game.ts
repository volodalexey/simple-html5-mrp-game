import { Container, Graphics, type Texture } from 'pixi.js'
import { Level } from './Level'
import { type IPlayerOptions, Player } from './Player'
import { StatusBar } from './StatusBar'
import { StartModal } from './StartModal'
import { InputHandler } from './InputHandler'
import { EPlayerState } from './playerStates'
import { CollisionBlock } from './CollisionBlock'
import { MapSettings } from './MapSettings'
import { Door } from './Door'
import { logLayout } from './logger'

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
  public transitionToOverlay = false
  public transitionToLevel = false

  static options = {
    startLevel: 1,
    maxTime: 20000
  }

  public currentLevel = Game.options.startLevel

  public player!: Player
  public inputHandler!: InputHandler
  public level!: Level
  public statusBar!: StatusBar
  public startModal!: StartModal
  public collisionBlocks = new Container<CollisionBlock>()
  public doors = new Container<Door>()
  public overlay = new Graphics()
  constructor (options: IGameOptions) {
    super()

    Door.texturesCache = options.textures.doopOpenTextures

    this.setup(options)

    this.addEventLesteners()

    this.runLevel()

    this.statusBar.position.set(this.width / 2 - this.statusBar.width, this.level.y)
    this.startModal.position.set(this.width / 2 - this.startModal.width / 2, this.height / 2 - this.startModal.height / 2)

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

    this.overlay.beginFill(0x000000)
    this.overlay.drawRect(0, 0, this.width, this.height)
    this.overlay.endFill()
    this.overlay.alpha = 0
    this.addChild(this.overlay)

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
    this.transitionToOverlay = false
    this.transitionToLevel = false
    this.overlay.alpha = 0
  }

  endGame (): void {
    this.gameEnded = true
    this.player.stop()
    this.startModal.visible = true
    const success = this.currentLevel > 3
    this.startModal.reasonText.text = success ? 'Win!!' : 'Time out!'
  }

  handleResize ({ viewWidth, viewHeight }: {
    viewWidth: number
    viewHeight: number
  }): void {
    const availableWidth = viewWidth
    const availableHeight = viewHeight
    const totalWidth = this.level.width
    const totalHeight = this.level.height
    let scale = 1
    if (totalHeight >= totalWidth) {
      scale = availableHeight / totalHeight
      if (scale * totalWidth > availableWidth) {
        scale = availableWidth / totalWidth
      }
      logLayout(`By height (sc=${scale})`)
    } else {
      scale = availableWidth / totalWidth
      logLayout(`By width (sc=${scale})`)
      if (scale * totalHeight > availableHeight) {
        scale = availableHeight / totalHeight
      }
    }
    const occupiedWidth = Math.floor(totalWidth * scale)
    const occupiedHeight = Math.floor(totalHeight * scale)
    const x = availableWidth > occupiedWidth ? (availableWidth - occupiedWidth) / 2 : 0
    const y = availableHeight > occupiedHeight ? (availableHeight - occupiedHeight) / 2 : 0
    logLayout(`aw=${availableWidth} (ow=${occupiedWidth}) x=${x} ah=${availableHeight} (oh=${occupiedHeight}) y=${y}`)
    this.overlay.visible = false
    this.statusBar.visible = false
    this.x = x
    this.width = occupiedWidth
    this.y = y
    this.height = occupiedHeight
    logLayout(`x=${x} y=${y} w=${this.width} h=${this.height}`)
    this.overlay.visible = true
    this.statusBar.visible = true
    this.overlay.width = this.width
    this.overlay.height = this.height
  }

  handleUpdate (deltaMS: number): void {
    if (this.gameEnded) {
      this.handleTransition(false)
      return
    }
    this.time += deltaMS
    this.statusBar.updateTime(this.time)
    if (this.time > Game.options.maxTime) {
      this.endGame()
    }
    this.player.handleUpdate(deltaMS)
    this.handleTransition(true)
  }

  handleTransition (runLevel = false): void {
    if (this.transitionToOverlay) {
      if (this.overlay.alpha < 0.9) {
        this.overlay.alpha += 0.01
      } else {
        this.overlay.alpha = 1
        if (runLevel) {
          this.runLevel(true)
        }
      }
    }
    if (this.transitionToLevel) {
      if (this.overlay.alpha > 0.1) {
        this.overlay.alpha -= 0.01
      } else {
        this.overlay.alpha = 0
        this.transitionToOverlay = false
        this.transitionToLevel = false
      }
    }
  }

  completeTransition (): void {
    if (this.transitionToOverlay) {
      this.transitionToOverlay = false
      this.transitionToLevel = true
    }
  }

  runLevel (increment?: boolean): void {
    if (increment === true) {
      this.currentLevel++
    }
    if (this.currentLevel > 3) {
      this.endGame()
      this.completeTransition()
      return
    }
    this.cleanFromAll()
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

    this.completeTransition()
  }
}
