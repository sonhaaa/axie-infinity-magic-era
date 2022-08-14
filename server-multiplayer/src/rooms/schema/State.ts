import { MapSchema, Schema, type } from '@colyseus/schema'
import { Player } from './Player'

export class State extends Schema {
  @type({ map: Player })
  players = new MapSchema<Player>()

  something = "This attribute won't be sent to the client-side"

  createPlayer(
    sessionId: string,
    options: {
      address: string
      axie: string
      animation: string
      spell: string
      health: number
    },
  ) {
    const { address, axie, animation, spell, health } = options
    this.players.set(sessionId, new Player(address, axie, animation, spell, health))
  }

  setHealth(address: string, options: { health: number }) {
    const { health } = options
    this.players.forEach((player) => {
      if (player.address === address) player.health = health
    })
  }

  getHealth(address: string) {
    let health = 0
    this.players.forEach((player) => {
      if (player.address === address) health = player.health
    })
    return health
  }

  setSpell(sessionId: string, options: { spell: string }) {
    const { spell } = options
    this.players.get(sessionId).spell = spell
  }

  getSpell(address: string) {
    let spell = 'shield'
    this.players.forEach((player) => {
      if (player.address === address) spell = player.spell
    })
    return spell
  }

  setAnimation(sessionId: string, options: { address: string; axie: string; animation: string }) {
    const { animation } = options
    this.players.get(sessionId).animation = animation
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId)
  }
}
