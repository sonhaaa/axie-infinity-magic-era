import { Key, keyboard } from '../../utils/helper'
import { Figure } from './Figure'
import { AxieDirection, Mixer } from './types'

export class FigureContainer extends PIXI.Container {
  currentSpine?: Figure
  currentAnimation: string
  keys: Record<string, Key>
  vx: number
  direction: AxieDirection
  currentSpell: PIXI.extras.AnimatedSprite

  constructor() {
    super()
    this.direction = AxieDirection.Left
    this.currentAnimation = 'action/idle/normal'
    this.vx = 0
  }

  async changeSpine(loader: PIXI.loaders.Loader, id: string) {
    this.removeChild(this.currentSpine)
    const prevSpine = this.currentSpine

    const newFigure = await Figure.fromAxieId(loader, id)
    if (!newFigure) throw new Error('Invalid Axie ID')
    this.currentSpine = newFigure

    this.addChild(this.currentSpine)
    this.currentSpine.scale.x = 0.18 * this.direction
    this.changeCurrentAnimation(this.currentAnimation, true)
    this.removeChild(prevSpine)
  }

  async changeSpell(type: string, spellType: string, spellFrames: string[]) {
    this.removeChild(this.currentSpell)
    const prevSpell = this.currentSpell

    // const texture = PIXI.Texture.from(spellImageUrl)

    let textureArray = []

    let frame = 0

    if (spellType === 'hit') frame = 7
    if (spellType === 'heal' || spellType === 'ultimate') frame = 12
    if (spellType === 'shield') frame = 15
    if (spellType === 'default') frame = 1

    for (let i = 0; i < frame; i++) {
      let texture = PIXI.Texture.from(spellFrames[i])
      textureArray.push(texture)
    }

    let animatedSprite = new PIXI.extras.AnimatedSprite(textureArray)

    animatedSprite.play()
    animatedSprite.animationSpeed = 0.25

    if (spellType !== 'shield') {
      animatedSprite.onComplete = () => animatedSprite.destroy()
      animatedSprite.loop = false
    }

    this.currentSpell = animatedSprite

    this.addChild(this.currentSpell)
    if (type === 'ally') {
      if (spellType === 'heal') {
        this.currentSpell.scale.set(3, 3)
        this.currentSpell.position.set(-180, -335)
      }

      if (spellType === 'hit') {
        this.currentSpell.scale.set(2 * this.direction, 2)
        this.currentSpell.position.set(370, -320)
      }

      if (spellType === 'shield') {
        this.currentSpell.scale.set(0.85 * -this.direction, 0.85)
        this.currentSpell.position.set(140, -135)
      }

      if (spellType === 'ultimate') {
        this.currentSpell.scale.set(2, 6)
        this.currentSpell.position.set(650, -550)
        this.currentSpell.rotation = 45
      }
    }

    if (type === 'enemy') {
      if (spellType === 'heal') {
        this.currentSpell.scale.set(3, 3)
        this.currentSpell.position.set(-170, -335)
      }

      if (spellType === 'hit') {
        this.currentSpell.scale.set(2 * -this.direction, 2)
        this.currentSpell.position.set(-370, 110)
      }

      if (spellType === 'shield') {
        this.currentSpell.scale.set(0.85 * this.direction, 0.85)
        this.currentSpell.position.set(-140, -135)
      }

      if (spellType === 'ultimate') {
        this.currentSpell.scale.set(2, 6)
        this.currentSpell.position.set(-700, 480)
        this.currentSpell.rotation = 4.2
      }
    }

    // console.log(animatedSprite.currentFrame)

    this.removeChild(prevSpell)
  }

  async changeSpineFromMixer(loader: PIXI.loaders.Loader, mixer: Mixer) {
    this.removeChild(this.currentSpine)
    const prevSpine = this.currentSpine

    const newFigure = await Figure.fromMixer(loader, mixer)
    if (!newFigure) throw new Error('Invalid input')
    this.currentSpine = newFigure

    this.addChild(this.currentSpine)
    this.currentSpine.scale.x = 0.18 * this.direction
    this.changeCurrentAnimation(this.currentAnimation, true)
    this.removeChild(prevSpine)
  }

  registerKeyBoardController() {
    this.keys = {
      left: keyboard('ArrowLeft'),
      right: keyboard('ArrowRight'),
      space: keyboard(' '),
      e: keyboard('e'),
    }

    const { left, right, space, e } = this.keys

    for (let key in this.keys) {
      window.addEventListener('keydown', this.keys[key].downHandler, false)
      window.addEventListener('keyup', this.keys[key].upHandler, false)
    }

    left.press = () => {
      this.currentSpine.scale.x = 0.18 * AxieDirection.Left
      this.changeCurrentAnimation('draft/run-origin', true)
      this.vx = -10

      this.direction = AxieDirection.Left
    }

    left.release = () => {
      if (!right.isDown) {
        this.vx = 0
        this.changeCurrentAnimation('action/idle/normal', true, 0.8)
      }
    }

    right.press = () => {
      this.currentSpine.scale.x = 0.18 * AxieDirection.Right
      this.changeCurrentAnimation('draft/run-origin', true)
      this.vx = 10

      this.direction = AxieDirection.Right
    }

    right.release = () => {
      if (!left.isDown) {
        this.vx = 0
        this.changeCurrentAnimation('action/idle/normal', true, 0.8)
      }
    }

    space.press = () => {
      this.changeCurrentAnimation('attack/ranged/cast-fly', false)
    }

    space.release = () => {
      this.changeCurrentAnimation('action/idle/normal', true, 1)
    }

    e.press = () => {
      this.changeCurrentAnimation('attack/melee/tail-smash', false)
    }

    e.release = () => {
      this.changeCurrentAnimation('action/idle/normal', true, 1)
    }
  }

  changeCurrentAnimation(keyId: string, loop: boolean, delay?: number) {
    this.currentAnimation = keyId
    if (delay) {
      this.currentSpine.state.addAnimation(0, keyId, loop, delay)
    } else {
      this.currentSpine.state.setAnimation(0, keyId, loop)
    }
  }
}
