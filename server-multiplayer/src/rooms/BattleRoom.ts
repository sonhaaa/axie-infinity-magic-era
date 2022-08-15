import { Client, Delayed, Room } from 'colyseus'
import { State } from './schema/State'

export class BattleRoom extends Room<State> {
  public delayedInterval!: Delayed
  private isGameStart = false

  onCreate(options: any): void | Promise<any> {
    console.log('BattleRoom created', options)

    this.setState(new State())

    this.onMessage('hit', (client, data) => {
      const damage = data.value

      const enemyHealth = this.state.getHealth(data.receiver)
      const enemySpell = this.state.getSpell(data.receiver)

      let health = 0
      if (enemySpell === 'shield') {
        if (damage > 20) health = enemyHealth - (damage - 20)
        if (damage < 20) health = enemyHealth
      } else {
        health = enemyHealth - damage
      }

      this.state.setHealth(data.receiver, {
        health: health,
      })

      if (this.state.getHealth(data.sender) <= 0 || this.state.getHealth(data.receiver) <= 0) {
        this.broadcast('game-end', {
          winner: this.state.getHealth(data.sender) <= 0 ? data.receiver : data.sender,
        })
      }

      this.state.setAnimation(client.sessionId, data)
      this.state.setSpell(client.sessionId, { spell: data.type })

      this.broadcast('update-axie', {
        sender: data.sender,
        receiver: data.receiver,
        animation: data.animation,
        type: data.type,
      })

      this.broadcast('update-health', [
        {
          address: data.sender,
          health: this.state.getHealth(data.sender),
        },
        {
          address: data.receiver,
          health: this.state.getHealth(data.receiver),
        },
      ])
    })

    this.onMessage('heal', (client, data) => {
      const allyHealth = this.state.getHealth(data.sender)

      this.state.setAnimation(client.sessionId, data)
      this.state.setSpell(client.sessionId, { spell: data.type })

      this.state.setHealth(data.receiver, { health: allyHealth + data.value > 100 ? 100 : allyHealth + data.value })

      this.broadcast('update-axie', {
        sender: data.sender,
        animation: data.animation,
        type: data.type,
      })

      this.broadcast('update-health', [
        {
          address: data.sender,
          health: this.state.getHealth(data.sender),
        },
        {
          address: data.receiver,
          health: this.state.getHealth(data.receiver),
        },
      ])
    })

    this.onMessage('shield', (client, data) => {
      this.state.setAnimation(client.sessionId, data)
      this.state.setSpell(client.sessionId, { spell: data.type })

      this.broadcast('update-axie', {
        sender: data.sender,
        receiver: data.receiver,
        animation: data.animation,
        type: data.type,
      })
    })

    this.onMessage('ultimate', (client, data) => {
      const damage = data.value

      const enemyHealth = this.state.getHealth(data.receiver)
      const enemySpell = this.state.getSpell(data.receiver)

      let health = 0
      if (enemySpell === 'shield') {
        if (damage > 20) health = enemyHealth - (damage - 20)
        if (damage < 20) health = enemyHealth
      } else {
        health = enemyHealth - damage
      }

      this.state.setHealth(data.receiver, {
        health: health,
      })

      if (this.state.getHealth(data.sender) <= 0 || this.state.getHealth(data.receiver) <= 0) {
        this.broadcast('game-end', {
          winner: this.state.getHealth(data.sender) <= 0 ? data.receiver : data.sender,
        })
      }

      this.state.setAnimation(client.sessionId, data)
      this.state.setSpell(client.sessionId, { spell: data.type })

      this.broadcast('update-axie', {
        sender: data.sender,
        receiver: data.receiver,
        animation: data.animation,
        type: data.type,
      })

      this.broadcast('update-health', [
        {
          address: data.sender,
          health: this.state.getHealth(data.sender),
        },
        {
          address: data.receiver,
          health: this.state.getHealth(data.receiver),
        },
      ])
    })
  }

  onJoin(client: Client, options?: any, auth?: any): void | Promise<any> {
    this.state.createPlayer(client.sessionId, options)
    console.log(`--> ${client.sessionId} joined`, options)

    this.broadcast('player-joined', this.state.players)

    // let counter = 0
    // if (this.state.players.size === 2 && !this.isGameStart) {
    //   console.log('Full players')

    //   this.clock.start()

    //   this.delayedInterval = this.clock.setInterval(() => {
    //     counter++
    //     this.broadcast('action-start-game', { counter })
    //   }, 1000)

    //   this.clock.setTimeout(() => {
    //     this.delayedInterval.clear()
    //   }, 5000)
    // }
  }

  onLeave(client: Client, consented?: boolean): void | Promise<any> {
    this.state.removePlayer(client.sessionId)
    console.log(`<-- ${client.sessionId} leave`)
  }

  onDispose(): void | Promise<any> {
    console.log('Dispose BattleRoom')
  }
}
