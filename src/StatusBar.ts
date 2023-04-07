import { Container, Text } from 'pixi.js'

export class StatusBar extends Container {
  static options = {
    padding: 20,
    textColor: 0xbb5857,
    textColorShadow: 0x98cbd8,
    textShadowOffset: 0.5,
    textSize: 20
  }

  public levelText!: Text
  public levelTextShadow!: Text
  public timeText!: Text
  public timeTextShadow!: Text

  constructor () {
    super()
    this.setup()
  }

  static getLevelText (append: string | number): string {
    return `Level: ${append}`
  }

  static getTimeText (append: string | number): string {
    return `Time: ${append}`
  }

  setup (): void {
    const {
      options: {
        padding,
        textSize,
        textColor,
        textShadowOffset,
        textColorShadow
      }
    } = StatusBar

    const levelTextShadow = new Text(StatusBar.getLevelText('-'), {
      fontSize: textSize,
      fill: textColorShadow
    })
    levelTextShadow.position.set(padding, padding)
    this.addChild(levelTextShadow)
    this.levelTextShadow = levelTextShadow
    const levelText = new Text(StatusBar.getLevelText('-'), {
      fontSize: textSize,
      fill: textColor
    })
    levelText.position.set(padding + textShadowOffset, padding + textShadowOffset)
    this.addChild(levelText)
    this.levelText = levelText

    const timeTextShadow = new Text(StatusBar.getTimeText(0), {
      fontSize: textSize * 0.8,
      fill: textColorShadow
    })
    timeTextShadow.position.set(levelTextShadow.x, levelTextShadow.y + levelTextShadow.height)
    timeTextShadow.alpha = 1
    this.addChild(timeTextShadow)
    this.timeTextShadow = timeTextShadow
    const timeText = new Text(StatusBar.getTimeText(0), {
      fontSize: textSize * 0.8,
      fill: textColor
    })
    timeText.position.set(levelText.x, levelText.y + levelText.height)
    this.addChild(timeText)
    this.timeText = timeText
  }

  updateLevel (level: number): void {
    this.levelText.text = StatusBar.getLevelText(level)
    this.levelTextShadow.text = StatusBar.getLevelText(level)
  }

  updateTime (time: number): void {
    const timeTxt = (time * 0.001).toFixed(1)
    this.timeText.text = StatusBar.getTimeText(timeTxt)
    this.timeTextShadow.text = StatusBar.getTimeText(timeTxt)
  }
}
