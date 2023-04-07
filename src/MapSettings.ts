import { type IPointData } from 'pixi.js'

export interface ITileLayer {
  data: number[]
  height: number
  id: number
  name: string
  opacity: number
  type: 'tilelayer'
  visible: boolean
  width: number
  x: number
  y: number
}

export interface IGroupLayer {
  id: number
  layers: ITileLayer[]
  name: string
  opacity: number
  type: 'group'
  visible: boolean
  x: number
  y: number
}

export interface IPolylinePoint {
  x: number
  y: number
}

export interface IObject {
  class: string
  height: number
  id: number
  name: string
  polyline: IPolylinePoint[]
  rotation: number
  visible: boolean
  width: number
  x: number
  y: number
}

export interface IObjectGroupLayer {
  draworder: 'topdown'
  id: number
  name: string
  objects: IObject[]
  opacity: number
  type: 'objectgroup'
  visible: boolean
  x: number
  y: number
}

export interface IMapSettings {
  compressionlevel: number
  height: number
  infinite: boolean
  layers: Array<ITileLayer | IGroupLayer | IObjectGroupLayer>
  nextlayerid: number
  nextobjectid: number
  orientation: 'orthogonal'
  renderorder: 'right-down'
  tiledversion: number
  tileheight: number
}

export abstract class MapSettings {
  static options = {
    tilesPerRow: 20,
    cell: 64
  }

  static findTileLayer ({ name, mapSettings }: { name: string, mapSettings: IMapSettings }): ITileLayer {
    const layer = mapSettings.layers.find((l): l is ITileLayer => l.type === 'tilelayer' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" tile layer`)
    }
    return layer
  }

  static findObjectGroupLayer ({ name, mapSettings }: { name: string, mapSettings: IMapSettings }): IObjectGroupLayer {
    const layer = mapSettings.layers.find((l): l is IObjectGroupLayer => l.type === 'objectgroup' && l.name === name)
    if (layer == null) {
      throw new Error(`Unable to detect "${name}" object group layer`)
    }
    return layer
  }

  static mapTileToPositions ({
    mapSettings, layerName
  }: {
    mapSettings: IMapSettings
    layerName: string
  }): IPointData[] {
    const positions: IPointData[] = []
    const { tilesPerRow, cell } = MapSettings.options
    const tileLayer = MapSettings.findTileLayer({ name: layerName, mapSettings })
    for (let i = 0; i < tileLayer.data.length; i += tilesPerRow) {
      const row = tileLayer.data.slice(i, i + tilesPerRow)
      row.forEach((symbol, j) => {
        if (symbol === 14) {
          positions.push({ x: j * cell, y: i / tilesPerRow * cell })
        }
      })
    }
    return positions
  }
}
