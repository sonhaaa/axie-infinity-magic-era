import * as PIXI from 'pixi.js'

import { contain, Key } from '../../utils/helper'
import { CurrentFigure } from './CurrentFigure'
import { Figure } from './Figure'
import { FigureContainer } from './FigureContainer'
import { AxieDirection, Mixer } from './types'
import jsonFile from './boss/bear-dad.json'

class ContainerWithVelocity extends PIXI.Container {
  vx?: number
}

interface IAxie {
  id: string
  spells: string[]
}

export class PlaygroundGame extends PIXI.Application {
  offsetWidth: number
  offsetHeight: number
  keys: Record<string, Key>
  axieContainer: ContainerWithVelocity
  axieDirection: AxieDirection
  currentFigure: FigureContainer
  axieContiner: PIXI.Container
  axies: IAxie[]
  currentAxiesId: string
  ally: FigureContainer
  enemy: FigureContainer
  boss: PIXI.spine.Spine

  constructor(options) {
    super(options)
    this.offsetWidth = options.width
    this.offsetHeight = options.height
    this.keys = null
    this.axieDirection = AxieDirection.Right
  }

  startGame() {
    this.view.style.width = `${this.offsetWidth}px`
    this.view.style.height = `${this.offsetHeight}px`

    let state

    const play = (delta) => {
      if (this.currentFigure) {
        this.currentFigure.x += this.currentFigure.vx
      }
    }

    state = play
    const gameLoop = (delta) => state(delta)
    this?.ticker?.add((delta) => gameLoop(delta))
    this.start()
  }

  addBoss(imagePath: string) {
    var rawSkeletonData = JSON.parse(JSON.stringify(jsonFile))
    var rawAtlasData = `
bear-dad.png
size: 2048,2048
format: RGBA8888
filter: Linear,Linear
repeat: none
Slash-fx/2
  rotate: false
  xy: 688, 1194
  size: 431, 366
  orig: 431, 366
  offset: 0, 0
  index: -1
Slash-fx/3
  rotate: false
  xy: 855, 59
  size: 241, 369
  orig: 241, 369
  offset: 0, 0
  index: -1
Slash-fx/4
  rotate: false
  xy: 2, 25
  size: 266, 380
  orig: 266, 380
  offset: 0, 0
  index: -1
Slash-fx/5
  rotate: false
  xy: 1098, 196
  size: 198, 284
  orig: 198, 284
  offset: 0, 0
  index: -1
arm-left
  rotate: false
  xy: 1356, 726
  size: 207, 310
  orig: 207, 310
  offset: 0, 0
  index: -1
arm-right
  rotate: false
  xy: 1147, 725
  size: 207, 311
  orig: 207, 311
  offset: 0, 0
  index: -1
back
  rotate: false
  xy: 2, 913
  size: 540, 433
  orig: 540, 433
  offset: 0, 0
  index: -1
body
  rotate: false
  xy: 2, 1348
  size: 684, 697
  orig: 684, 697
  offset: 0, 0
  index: -1
brace
  rotate: false
  xy: 1385, 298
  size: 243, 107
  orig: 243, 107
  offset: 0, 0
  index: -1
ear-left
  rotate: false
  xy: 544, 960
  size: 77, 86
  orig: 77, 86
  offset: 0, 0
  index: -1
ear-right
  rotate: false
  xy: 1810, 1541
  size: 77, 86
  orig: 77, 86
  offset: 0, 0
  index: -1
eye-left
  rotate: false
  xy: 629, 411
  size: 20, 17
  orig: 20, 17
  offset: 0, 0
  index: -1
eye-right
  rotate: false
  xy: 1619, 1268
  size: 20, 17
  orig: 20, 17
  offset: 0, 0
  index: -1
eyebrow-left
  rotate: false
  xy: 1920, 1896
  size: 97, 73
  orig: 97, 73
  offset: 0, 0
  index: -1
eyebrow-right
  rotate: false
  xy: 1920, 1971
  size: 100, 74
  orig: 100, 74
  offset: 0, 0
  index: -1
foot-left
  rotate: false
  xy: 1565, 728
  size: 165, 81
  orig: 165, 81
  offset: 0, 0
  index: -1
foot-right
  rotate: false
  xy: 1565, 728
  size: 165, 81
  orig: 165, 81
  offset: 0, 0
  index: -1
forearm-left
  rotate: false
  xy: 323, 402
  size: 304, 509
  orig: 304, 509
  offset: 0, 0
  index: -1
forearm-right
  rotate: false
  xy: 2, 407
  size: 319, 504
  orig: 319, 504
  offset: 0, 0
  index: -1
greb
  rotate: false
  xy: 544, 1208
  size: 140, 138
  orig: 140, 138
  offset: 0, 0
  index: -1
hand-left
  rotate: false
  xy: 1273, 7
  size: 204, 186
  orig: 204, 186
  offset: 0, 0
  index: -1
hand-right-under
  rotate: false
  xy: 1406, 407
  size: 205, 188
  orig: 205, 188
  offset: 0, 0
  index: -1
hand-right-upper
  rotate: false
  xy: 1098, 7
  size: 173, 187
  orig: 173, 187
  offset: 0, 0
  index: -1
handler
  rotate: false
  xy: 980, 482
  size: 424, 100
  orig: 424, 100
  offset: 0, 0
  index: -1
head
  rotate: false
  xy: 270, 15
  size: 379, 385
  orig: 379, 385
  offset: 0, 0
  index: -1
head-shadow
  rotate: false
  xy: 629, 430
  size: 349, 201
  orig: 349, 201
  offset: 0, 0
  index: -1
lace
  rotate: false
  xy: 1018, 596
  size: 127, 584
  orig: 127, 584
  offset: 0, 0
  index: -1
lace-left
  rotate: false
  xy: 1565, 811
  size: 147, 369
  orig: 147, 369
  offset: 0, 0
  index: -1
lace-right
  rotate: false
  xy: 1298, 195
  size: 85, 285
  orig: 85, 285
  offset: 0, 0
  index: -1
leg-left
  rotate: false
  xy: 1613, 476
  size: 151, 156
  orig: 151, 156
  offset: 0, 0
  index: -1
leg-right
  rotate: false
  xy: 1479, 46
  size: 151, 158
  orig: 151, 158
  offset: 0, 0
  index: -1
mangosteen
  rotate: false
  xy: 1791, 1629
  size: 132, 135
  orig: 132, 135
  offset: 0, 0
  index: -1
moustache
  rotate: false
  xy: 1147, 584
  size: 249, 139
  orig: 249, 139
  offset: 0, 0
  index: -1
moustache2
  rotate: false
  xy: 2, 8
  size: 41, 15
  orig: 41, 15
  offset: 0, 0
  index: -1
mouth-bite
  rotate: false
  xy: 1385, 206
  size: 284, 90
  orig: 284, 90
  offset: 0, 0
  index: -1
mouth-open1
  rotate: false
  xy: 1698, 1766
  size: 150, 71
  orig: 150, 71
  offset: 0, 0
  index: -1
mouth-open2
  rotate: false
  xy: 1398, 597
  size: 179, 127
  orig: 179, 127
  offset: 0, 0
  index: -1
necklace
  rotate: false
  xy: 688, 1562
  size: 439, 483
  orig: 439, 483
  offset: 0, 0
  index: -1
nose
  rotate: false
  xy: 1579, 634
  size: 132, 92
  orig: 132, 92
  offset: 0, 0
  index: -1
pant
  rotate: false
  xy: 1129, 1762
  size: 567, 283
  orig: 567, 283
  offset: 0, 0
  index: -1
pant-left
  rotate: false
  xy: 1698, 1839
  size: 220, 206
  orig: 220, 206
  offset: 0, 0
  index: -1
pant-right
  rotate: false
  xy: 1619, 1287
  size: 218, 206
  orig: 218, 206
  offset: 0, 0
  index: -1
shadow
  rotate: false
  xy: 1147, 1038
  size: 403, 142
  orig: 403, 142
  offset: 0, 0
  index: -1
shield
  rotate: false
  xy: 629, 633
  size: 387, 413
  orig: 387, 413
  offset: 0, 0
  index: -1
shield-left
  rotate: false
  xy: 651, 2
  size: 202, 426
  orig: 202, 426
  offset: 0, 0
  index: -1
shuriken
  rotate: false
  xy: 1632, 109
  size: 43, 95
  orig: 43, 95
  offset: 0, 0
  index: -1
tomato
  rotate: false
  xy: 1630, 327
  size: 131, 147
  orig: 131, 147
  offset: 0, 0
  index: -1
trunk-01
  rotate: false
  xy: 544, 1048
  size: 468, 144
  orig: 468, 144
  offset: 0, 0
  index: -1
trunk-02
  rotate: false
  xy: 1121, 1182
  size: 554, 81
  orig: 554, 81
  offset: 0, 0
  index: -1
trunk-03
  rotate: false
  xy: 1129, 1495
  size: 679, 127
  orig: 679, 127
  offset: 0, 0
  index: -1
trunk-04
  rotate: false
  xy: 1129, 1624
  size: 660, 136
  orig: 660, 136
  offset: 0, 0
  index: -1
water-drop
  rotate: false
  xy: 980, 457
  size: 49, 23
  orig: 49, 23
  offset: 0, 0
  index: -1
weapon
  rotate: false
  xy: 1121, 1265
  size: 496, 228
  orig: 496, 228
  offset: 0, 0
  index: -1

    `

    var spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, function (line, callback) {
      console.log(imagePath)
      callback(PIXI.BaseTexture.from(imagePath))
    })

    var spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas)
    var spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader)

    spineJsonParser.scale = 0.19

    var spineData = spineJsonParser.readSkeletonData(rawSkeletonData)

    var spine = new PIXI.spine.Spine(spineData)
    spine.position.set(600, 440)
    // spine.state.setAnimation(0, 'attack/melee/normal-attack', true)
    console.log(spine.state)

    this.boss = spine

    this.stage.addChild(spine)
  }

  addHitEffect(
    position: { x: number; y: number },
    scale: number,
    imagePath: string,
    atlas: string,
    jsonFile: string,
    delay: number,
  ) {
    var rawSkeletonData = JSON.parse(jsonFile)
    var rawAtlasData = atlas

    var spineAtlas = new PIXI.spine.core.TextureAtlas(rawAtlasData, function (line, callback) {
      console.log(imagePath)
      callback(PIXI.BaseTexture.from(imagePath))
    })

    var spineAtlasLoader = new PIXI.spine.core.AtlasAttachmentLoader(spineAtlas)
    var spineJsonParser = new PIXI.spine.core.SkeletonJson(spineAtlasLoader)

    spineJsonParser.scale = scale

    var spineData = spineJsonParser.readSkeletonData(rawSkeletonData)

    var spine = new PIXI.spine.Spine(spineData)
    spine.position.set(position.x, position.y)

    spine.state.addAnimation(0, 'play', true, delay)
    spine.state.timeScale = 2
    spine.state
    console.log(spine.state)

    this.stage.addChild(spine)
  }

  changeSpine(axieId: string) {
    return this.currentFigure.changeSpine(this.loader, axieId)
  }

  changeSpineFromMixer(mixer: Mixer) {
    return this.currentFigure.changeSpineFromMixer(this.loader, mixer)
  }

  async add(
    type: string,
    axieId: string,
    position: { x: number; y: number },
    direction: AxieDirection,
    animation: string = 'action/idle/normal',
  ) {
    const figureContainer = new FigureContainer()
    const figure = (await Figure.fromAxieId(this.loader, axieId)) as Figure
    figure.scale.x = 0.18 * direction
    figureContainer.currentSpine = figure
    figureContainer.addChild(figure)
    figureContainer.changeCurrentAnimation(animation, false)
    figureContainer.changeCurrentAnimation('action/idle/normal', true, 0.5)
    figureContainer.vx = 0
    figureContainer.position.set(position.x, position.y)
    contain(figureContainer, { width: 700, height: 500 })

    this.stage?.addChild(figureContainer)

    if (type === 'ally') this.ally = figureContainer
    if (type === 'enemy') this.enemy = figureContainer
  }

  async addAxie(axieId: string, position: { x: number; y: number }, animation: string) {
    const figureContainer = new FigureContainer()
    const figure = (await Figure.fromAxieId(this.loader, axieId)) as Figure
    // figure.scale.x = -0.1
    // figure.scale.y = 0.1
    figureContainer.scale.set(-0.4, 0.4)
    figureContainer.currentSpine = figure
    figureContainer.addChild(figure)
    figureContainer.changeCurrentAnimation(animation, true)
    figureContainer.position.set(position.x, position.y)
    contain(figureContainer, { width: 700, height: 500 })

    this.stage?.addChild(figureContainer)
  }

  remove(figureContainer: FigureContainer) {
    this.stage?.removeChild(figureContainer)
  }
}
