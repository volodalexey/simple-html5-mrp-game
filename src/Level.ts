import { Assets, type IPointData, Sprite, type Texture } from 'pixi.js'
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

  initLevel (levelIndex: number): {
    collisionPoints: ReturnType<typeof MapSettings['mapTileToPositions']>
    playerPosition: IPointData
    doorPosition: IPointData
  } {
    const background: Texture = Assets.get(`level${levelIndex}Background`)
    const settings: IMapSettings = Assets.get(`level${levelIndex}Settings`)

    this.texture = background

    const collisionPoints = MapSettings.mapTileToPositions({ mapSettings: settings, layerName: 'Collisions' })

    const playerAndDoorLayer = MapSettings.findObjectGroupLayer({ name: 'Player and Door', mapSettings: settings })
    const playerObject = playerAndDoorLayer.objects.find(o => o.gid === 292)
    if (playerObject == null) {
      throw new Error('Unable to find initial player position')
    }
    const doorObject = playerAndDoorLayer.objects.find(o => o.gid === 290)
    if (doorObject == null) {
      throw new Error('Unable to find initial door position')
    }

    return {
      collisionPoints,
      playerPosition: { x: playerObject.x, y: playerObject.y - playerObject.height },
      doorPosition: { x: doorObject.x, y: doorObject.y - doorObject.height }
    }
  }
}
