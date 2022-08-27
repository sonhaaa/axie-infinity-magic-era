import { Server, LobbyRoom, RedisPresence } from 'colyseus'
import { monitor } from '@colyseus/monitor'
import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import { BattleRoom } from './rooms/BattleRoom'

const port = Number(process.env.PORT) || 5000

const app = express()
app.use(cors())
app.use(express.json())

const gameServer = new Server({
  server: createServer(app),
})

gameServer.define('battle', BattleRoom).enableRealtimeListing()

app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Listening on :${port}`)
