import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import {} from 'colyseus.js'
import 'pixi-spine'
import { PuffLoading } from '../puff-loading/PuffLoading'
import { BodyOrAnimationDropdown } from './body-or-animation-dropdown/BodyOrAnimationDropdown'
import { animationList, SAMPLE_PLAYER_DATA } from './constants'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'
import { AxieDirection, Part } from './types'

import * as Colyseus from 'colyseus.js'
import { checkCosineSimilarity, checkSimilarity, getCosineSimilarityScore } from '../../utils/helper'

import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { FigureContainer } from './FigureContainer'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieFigure = () => {
  const [loading, setLoading] = useState<boolean>()

  const [client, setClient] = useState(null)
  const [roomId, setRoomId] = useState<string>('')

  const [mainPlayer, setMainPlayer] = useState<Player>()
  const [mainPlayerAddress, setMainPlayerAddress] = useState('')

  const [enemyPlayerAddress, setEnemyPlayerAddress] = useState<Player>()

  const [isGameStart, setIsGameStart] = useState<boolean>()

  const [room, setRoom] = useState()

  const [gameTimer, setGameTimer] = useState<number>()

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const [currentSpell, setCurrentSpell] = useState<string>()
  const [allyHealth, setAllyHealth] = useState<number>(100)
  const [enemyHealth, setEnemyHealth] = useState<number>(100)

  //#region Transcript

  const { finalTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    continuous: false,
  })
  const startListening = () => SpeechRecognition.startListening()

  //#endregion

  // Connect to multiplayer server
  useEffect(() => {
    setClient(new Colyseus.Client('ws://localhost:2567'))
  }, [])

  // Load game
  useEffect(() => {
    if (!container) return
    if (!container.current) return
    const canvasContainer = container.current
    if (canvasContainer.childElementCount > 0) {
      canvasContainer.lastChild?.remove()
    }
    setLoading(true)

    const { offsetWidth, offsetHeight } = canvasContainer
    const game = new PlaygroundGame({
      transparent: false,
      resolution: window.devicePixelRatio,
      autoStart: true,
      width: offsetWidth,
      height: offsetHeight,
      backgroundColor: 0x282b39,
    })

    gameRef.current = game
    // gameRef.current.currentAxiesId = currentAxie.id
    gameRef.current.startGame()
    canvasContainer.appendChild(game.view)

    setLoading(false)

    // Connect to server
    setClient(new Colyseus.Client('ws://localhost:2567'))

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  // Load axie
  const addMainAxieToScene = (axieId: string, animation) => {
    console.log('addMainAxieToScene')
    gameRef.current.add('ally', axieId, { x: 250, y: 390 }, AxieDirection.Right, animation)
  }

  const addAxieToScene = (axieId: string, animation: string) => {
    console.log('addAxieToScene')

    gameRef.current.add('enemy', axieId, { x: 550, y: 190 }, AxieDirection.Left, animation)
  }

  const removeAxieFromScene = (axieContainer: FigureContainer) => {
    gameRef.current.remove(axieContainer)
  }

  //#region Match Making

  const createRoom = async () => {
    if (!client) throw Error('Client not connected')
    try {
      const room = await client.create('battle', {
        address: mainPlayer.address,
        axie: mainPlayer.axie,
        animation: 'action/idle/normal',
        spell: 'normal',
        health: 100,
      })

      console.log(room.id)

      setRoom(room)
    } catch (error) {
      console.error('join error', error)
    }
  }

  const joinById = async () => {
    if (!client || !roomId) throw Error('Client or roomId not defined')
    try {
      const room = await client.joinById(roomId, {
        address: mainPlayer.address,
        axie: mainPlayer.axie,
        animation: 'activity/appear',
        spell: 'normal',
        health: 100,
      })
      setRoom(room)
    } catch (error) {
      console.error('join error', error)
    }
  }

  const handleMainPlayerAddress = () => {
    localStorage.setItem('address', mainPlayerAddress)
    setMainPlayer({
      address: mainPlayerAddress,
      axie: '23486',
    })
  }

  useEffect(() => {
    if (mainPlayer) addMainAxieToScene(mainPlayer.axie, 'activity/appear')
  }, [mainPlayer])

  useEffect(() => {
    if (room) {
      let enemyAddress
      room.state.players.onAdd = function (player, sessionId) {
        console.log(player)

        if (mainPlayer.address !== player.address) {
          addAxieToScene(player.axie, player.animation)
          enemyAddress = player.address
          setEnemyPlayerAddress(player.address)
        }
      }

      room.onMessage('update-axie', ({ sender, receiver, animation, type }) => {
        if (mainPlayer.address === sender) {
          gameRef.current.ally.changeCurrentAnimation(animation, false)
          gameRef.current.ally.changeCurrentAnimation('action/idle/normal', true, 1)
          gameRef.current.ally.changeSpell('ally', `/spells-assets/${type}.png`)
        }
        if (mainPlayer.address === receiver) {
          // gameRef.current.ally.changeCurrentAnimation('defense/hit-by-normal', false)
          // gameRef.current.ally.changeCurrentAnimation('action/idle/normal', true, 1)
        }

        if (enemyAddress === sender) {
          gameRef.current.enemy.changeCurrentAnimation(animation, false)
          gameRef.current.enemy.changeCurrentAnimation('action/idle/normal', true, 1)
          gameRef.current.enemy.changeSpell('enemy', `/spells-assets/${type}.png`)
        }

        if (enemyAddress === receiver) {
          // gameRef.current.enemy.changeCurrentAnimation('defense/hit-by-normal', false)
          // gameRef.current.enemy.changeCurrentAnimation('action/idle/normal', true, 1)
        }
      })

      room.onMessage('update-health', (healths) => {
        healths.map((health) => {
          if (health.address === mainPlayer.address) setAllyHealth(health.health)
          if (health.address === enemyAddress) setEnemyHealth(health.health)
        })
      })

      room.state.players.onRemove = function (player, sessionId) {
        console.log('Player leave the room')
      }

      room.onMessage('action-start-game', ({ counter }) => {
        setGameTimer(counter)
      })

      room.onMessage('action-taken', ({ sender, allyHealth, enemyHealth }) => {
        if (room.sessionId === sender) setAllyHealth(allyHealth)
      })

      room.onMessage('game-end', ({ winner }) => {
        console.log('winner: ', winner)
      })
    }
  }, [room])

  useEffect(() => {
    if (gameTimer - 5 >= 0) setIsGameStart(true)
  }, [gameTimer])

  const spells = ['leviosa', 'lumos', 'avada kedavra']

  // Check what spell is calling
  useEffect(() => {
    let maxCosine = 0
    let highestScoreSpell = ''

    spells.map((spell) => {
      const score = getCosineSimilarityScore(spell, finalTranscript)
      if (checkCosineSimilarity(spell, finalTranscript, 70)) {
        if (maxCosine < score) {
          maxCosine = score
          highestScoreSpell = spell
        }
      }
    })
    console.log('highest: ', highestScoreSpell)
    if (highestScoreSpell === 'avada kedavra'.toLowerCase()) hit()

    if (highestScoreSpell === 'leviosa'.toLowerCase()) heal()
    if (highestScoreSpell === 'lumos'.toLowerCase()) shield()

    // setCurrentSpell(highestScoreSpell)
  }, [finalTranscript])

  const leaveRoom = async () => {
    if (!client || !roomId) throw Error('Client or roomId not defined')
    try {
      const room = await client.joinById(roomId, {
        address: '123',
        axies: '1000',
      })
      setRoom(room)
    } catch (error) {
      console.error('join error', error)
    }
  }
  //#endregion

  const hit = () => {
    if (room)
      room.send('hit', {
        type: 'hit',
        animation: 'attack/ranged/cast-fly',
        value: 10,
        sender: mainPlayer.address,
        receiver: enemyPlayerAddress,
      })
    else console.log('cannot send hit')
  }

  const heal = () => {
    if (room)
      room.send('heal', {
        type: 'heal',
        animation: 'battle/get-buff',
        value: 12,
        sender: mainPlayer.address,
        receiver: mainPlayer.address,
      })
    else console.log('cannot send heal')
  }

  const shield = () => {
    if (room)
      room.send('shield', {
        type: 'shield',
        animation: 'defense/hit-with-shield',
        value: 20,
        sender: mainPlayer.address,
        receiver: mainPlayer.address,
      })
    else console.log('cannot send shield')
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>
  }

  return (
    <div className={s.container}>
      <div ref={container} className={s.canvas}>
        {loading && <PuffLoading size={200} />}
      </div>

      <div>
        <p style={{ color: 'black' }}>Ally - {mainPlayer?.address}</p>
        <progress id='file' value={allyHealth} max='100'>
          {' '}
          {allyHealth}{' '}
        </progress>
      </div>

      <div>
        <p style={{ color: 'black' }}>Enemy - {enemyPlayerAddress}</p>
        <progress id='file' value={enemyHealth} max='100'>
          {' '}
          {enemyHealth}{' '}
        </progress>
      </div>

      {!mainPlayer && (
        <>
          <input value={mainPlayerAddress} onChange={(e) => setMainPlayerAddress(e.target.value)} />
          <button className={s.createButton} onClick={handleMainPlayerAddress}>
            Submit address
          </button>
        </>
      )}

      <h3 style={{ color: 'red' }}>{gameTimer}</h3>

      <button className={s.createButton} onClick={createRoom}>
        Create room
      </button>

      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} />

      <button className={s.createButton} onClick={joinById}>
        Join room by Id
      </button>

      <button className={s.createButton} onClick={leaveRoom}>
        leave room
      </button>

      <button className={s.createButton} onClick={hit}>
        HIT
      </button>

      <button className={s.createButton} onClick={heal}>
        HEAL
      </button>

      <button className={s.createButton} onClick={shield}>
        SHIELD
      </button>

      {/* <h3 style={{ color: 'red' }}>Transcript {transcript}</h3> */}
      <h3 style={{ color: 'red' }}>Final {finalTranscript}</h3>

      <button
        onTouchStart={startListening}
        onMouseDown={startListening}
        onTouchEnd={SpeechRecognition.stopListening}
        onMouseUp={SpeechRecognition.stopListening}>
        Hold to talk
      </button>
    </div>
  )
}
