import { Schema, type } from '@colyseus/schema'

interface IAxie {
  id: string
  spells: [string]
}

export class Axie extends Schema {}

export class Player extends Schema {
  @type('string') address: string
  @type('string') axie: string
  @type('string') animation: string
  @type('string') spell: string
  @type('number') health: number

  constructor(address: string, axie: string, animation: string, spell: string, health: number) {
    super()
    this.address = address
    this.axie = axie
    this.animation = animation
    this.spell = spell
    this.health = health
  }
}
