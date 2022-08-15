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
  const [room, setRoom] = useState()
  const [mainPlayer, setMainPlayer] = useState<Player>()
  const [mainPlayerAddress, setMainPlayerAddress] = useState('')
  const [enemyPlayerAddress, setEnemyPlayerAddress] = useState<Player>()
  const [isGameStart, setIsGameStart] = useState<boolean>()
  const [gameTimer, setGameTimer] = useState<number>()
  const [allyHealth, setAllyHealth] = useState<number>(100)
  const [enemyHealth, setEnemyHealth] = useState<number>(100)

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const { finalTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    continuous: false,
  })
  const startListening = () => SpeechRecognition.startListening()

  // Init game
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
    gameRef.current.add('ally', axieId, { x: 160, y: 420 }, AxieDirection.Right, animation)
  }

  const addAxieToScene = (axieId: string, animation: string) => {
    gameRef.current.add('enemy', axieId, { x: 640, y: 200 }, AxieDirection.Left, animation)
  }

  const removeAxieFromScene = (axieContainer: FigureContainer) => {
    gameRef.current.remove(axieContainer)
  }

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
          // gameRef.current.ally.changeSpell('ally', `/spells-assets/${type}.png`)

          if (type === 'hit')
            gameRef.current.ally.changeSpell('ally', type, [
              '/spells-assets/hit/0.png',
              '/spells-assets/hit/1.png',
              '/spells-assets/hit/2.png',
              '/spells-assets/hit/3.png',
              '/spells-assets/hit/4.png',
              '/spells-assets/hit/5.png',
              '/spells-assets/hit/6.png',
              '/spells-assets/hit/7.png',
            ])

          if (type === 'heal')
            gameRef.current.ally.changeSpell('ally', type, [
              '/spells-assets/heal/0.png',
              '/spells-assets/heal/1.png',
              '/spells-assets/heal/2.png',
              '/spells-assets/heal/3.png',
              '/spells-assets/heal/4.png',
              '/spells-assets/heal/5.png',
              '/spells-assets/heal/6.png',
              '/spells-assets/heal/7.png',
              '/spells-assets/heal/8.png',
              '/spells-assets/heal/9.png',
              '/spells-assets/heal/10.png',
              '/spells-assets/heal/11.png',
              '/spells-assets/heal/12.png',
            ])

          if (type === 'shield')
            gameRef.current.ally.changeSpell('ally', type, [
              '/spells-assets/shield/0.png',
              '/spells-assets/shield/1.png',
              '/spells-assets/shield/2.png',
              '/spells-assets/shield/3.png',
              '/spells-assets/shield/4.png',
              '/spells-assets/shield/5.png',
              '/spells-assets/shield/6.png',
              '/spells-assets/shield/7.png',
              '/spells-assets/shield/8.png',
              '/spells-assets/shield/9.png',
              '/spells-assets/shield/10.png',
              '/spells-assets/shield/11.png',
              '/spells-assets/shield/12.png',
              '/spells-assets/shield/13.png',
              '/spells-assets/shield/14.png',
            ])

          if (type === 'ultimate')
            gameRef.current.ally.changeSpell('ally', type, [
              '/spells-assets/ultimate/0.png',
              '/spells-assets/ultimate/1.png',
              '/spells-assets/ultimate/2.png',
              '/spells-assets/ultimate/3.png',
              '/spells-assets/ultimate/4.png',
              '/spells-assets/ultimate/5.png',
              '/spells-assets/ultimate/6.png',
              '/spells-assets/ultimate/7.png',
              '/spells-assets/ultimate/8.png',
              '/spells-assets/ultimate/9.png',
              '/spells-assets/ultimate/10.png',
              '/spells-assets/ultimate/11.png',
              '/spells-assets/ultimate/12.png',
            ])
        }
        if (mainPlayer.address === receiver) {
          // gameRef.current.ally.changeCurrentAnimation('defense/hit-by-normal', false)
          // gameRef.current.ally.changeCurrentAnimation('action/idle/normal', true, 1)
        }

        if (enemyAddress === sender) {
          gameRef.current.enemy.changeCurrentAnimation(animation, false)
          gameRef.current.enemy.changeCurrentAnimation('action/idle/normal', true, 1)
          // gameRef.current.enemy.changeSpell('enemy', `/spells-assets/${type}.png`)

          if (type === 'hit')
            gameRef.current.ally.changeSpell('enemy', type, [
              '/spells-assets/hit/0.png',
              '/spells-assets/hit/1.png',
              '/spells-assets/hit/2.png',
              '/spells-assets/hit/3.png',
              '/spells-assets/hit/4.png',
              '/spells-assets/hit/5.png',
              '/spells-assets/hit/6.png',
              '/spells-assets/hit/7.png',
            ])

          if (type === 'heal')
            gameRef.current.ally.changeSpell('enemy', type, [
              '/spells-assets/heal/0.png',
              '/spells-assets/heal/1.png',
              '/spells-assets/heal/2.png',
              '/spells-assets/heal/3.png',
              '/spells-assets/heal/4.png',
              '/spells-assets/heal/5.png',
              '/spells-assets/heal/6.png',
              '/spells-assets/heal/7.png',
              '/spells-assets/heal/8.png',
              '/spells-assets/heal/9.png',
              '/spells-assets/heal/10.png',
              '/spells-assets/heal/11.png',
              '/spells-assets/heal/12.png',
            ])

          if (type === 'shield')
            gameRef.current.ally.changeSpell('enemy', type, [
              '/spells-assets/shield/0.png',
              '/spells-assets/shield/1.png',
              '/spells-assets/shield/2.png',
              '/spells-assets/shield/3.png',
              '/spells-assets/shield/4.png',
              '/spells-assets/shield/5.png',
              '/spells-assets/shield/6.png',
              '/spells-assets/shield/7.png',
              '/spells-assets/shield/8.png',
              '/spells-assets/shield/9.png',
              '/spells-assets/shield/10.png',
              '/spells-assets/shield/11.png',
              '/spells-assets/shield/12.png',
              '/spells-assets/shield/13.png',
              '/spells-assets/shield/14.png',
            ])

          if (type === 'ultimate')
            gameRef.current.ally.changeSpell('enemy', type, [
              '/spells-assets/ultimate/0.png',
              '/spells-assets/ultimate/1.png',
              '/spells-assets/ultimate/2.png',
              '/spells-assets/ultimate/3.png',
              '/spells-assets/ultimate/4.png',
              '/spells-assets/ultimate/5.png',
              '/spells-assets/ultimate/6.png',
              '/spells-assets/ultimate/7.png',
              '/spells-assets/ultimate/8.png',
              '/spells-assets/ultimate/9.png',
              '/spells-assets/ultimate/10.png',
              '/spells-assets/ultimate/11.png',
              '/spells-assets/ultimate/12.png',
            ])
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
        removeAxieFromScene(gameRef.current.enemy)
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

      room.onLeave((code) => {
        removeAxieFromScene(gameRef.current.enemy)
      })
    }
  }, [room])

  useEffect(() => {
    if (gameTimer - 5 >= 0) setIsGameStart(true)
  }, [gameTimer])

  const spells = ['stupefy', 'episkey', 'expecto patronum', 'avada kedavra']

  // Check what spell is calling
  useEffect(() => {
    let maxCosine = 0
    let highestScoreSpell = ''

    spells.map((spell) => {
      const score = getCosineSimilarityScore(spell, finalTranscript)
      if (checkCosineSimilarity(spell, finalTranscript, 60)) {
        if (maxCosine < score) {
          maxCosine = score
          highestScoreSpell = spell
        }
      }
    })
    console.log('highest: ', highestScoreSpell)
    if (highestScoreSpell === spells[0].toLowerCase()) hit()
    if (highestScoreSpell === spells[1].toLowerCase()) heal()
    if (highestScoreSpell === spells[2].toLowerCase()) shield()
    if (highestScoreSpell === spells[3].toLowerCase()) ultimate()

    // setCurrentSpell(highestScoreSpell)
  }, [finalTranscript])

  const leaveRoom = async () => {
    if (room) room.leave(false)
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

  const ultimate = () => {
    if (room)
      room.send('ultimate', {
        type: 'ultimate',
        animation: 'attack/melee/horn-gore',
        value: 50,
        sender: mainPlayer.address,
        receiver: enemyPlayerAddress,
      })
    else console.log('cannot send ultimate')
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

      <button className={s.createButton} onClick={ultimate}>
        ULTIMATE
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
