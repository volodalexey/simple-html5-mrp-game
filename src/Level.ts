import { Assets, Sprite, type Texture } from 'pixi.js'
import { manifest } from './LoaderScene'
import { MapSettings, type IMapSettings } from './MapSettings'

export class Level extends Sprite {
  async idleLoad (): Promise<void> {
    await Assets.loadBundle(manifest.bundles
      .map(b => b.name)
      .filter((_, idx) => {
        return idx > 0
      }))
  }

  initLevel (levelIndex: number, layerName = 'Collisions'): ReturnType<typeof MapSettings['mapTileToPositions']> {
    const background: Texture = Assets.get(`level${levelIndex}Background`)
    const settings: IMapSettings = Assets.get(`level${levelIndex}Settings`)

    this.texture = background

    return MapSettings.mapTileToPositions({ mapSettings: settings, layerName })
  }
}
