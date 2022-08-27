import * as PIXI from 'pixi.js'

import { contain, Key } from '../../utils/helper'
import { CurrentFigure } from './CurrentFigure'
import { Figure } from './Figure'
import { FigureContainer } from './FigureContainer'
import { AxieDirection, Mixer } from './types'

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
  main: FigureContainer
  soulRight: FigureContainer
  soulLeft: FigureContainer

  constructor(options) {
    super(options)
    this.offsetWidth = options.width
    this.offsetHeight = options.height
    this.keys = null
    this.axieDirection = AxieDirection.Right
  }

  startGame() {
    this.stage.interactive = true
    this.renderer.view.style.touchAction = 'auto'
    this.renderer.plugins.interaction.autoPreventDefault = false
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

    if (type === 'main') this.main = figureContainer
    if (type === 'soul-left') this.soulLeft = figureContainer
    if (type === 'soul-right') this.soulRight = figureContainer
  }

  remove(figureContainer: FigureContainer) {
    this.stage?.removeChild(figureContainer)
  }

  addTextureTo(type: string, imageUri: string) {
    const texture = PIXI.Texture.from(imageUri)

    const image = new PIXI.Sprite(texture)

    if (type === 'ally') this.ally.addChild(image)
    if (type === 'enemy') this.enemy.addChild(image)
  }
}
