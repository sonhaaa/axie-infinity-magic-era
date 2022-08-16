// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import * as Colyseus from 'colyseus.js'
import Image from 'next/image'
import 'pixi-spine'
import { checkCosineSimilarity, getCosineSimilarityScore, randomAxieId, randomInRange } from '../../utils/helper'
import { PuffLoading } from '../puff-loading/PuffLoading'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'
import { AxieDirection } from './types'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { FigureContainer } from './FigureContainer'

import { sound } from '@pixi/sound'

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
  const [enemyPlayerAddress, setEnemyPlayerAddress] = useState<string>()
  const [isGameStart, setIsGameStart] = useState<boolean>(false)
  const [allyHealth, setAllyHealth] = useState<number>(100)
  const [enemyHealth, setEnemyHealth] = useState<number>(100)
  const [isWin, setIsWin] = useState<boolean>(false)
  const [currentSpell, setCurrentSpell] = useState<string>()

  const spells = ['stupefy', 'episkey', 'expecto patronum', 'avada kedavra']

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const { finalTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    continuous: false,
  })
  const startListening = () => SpeechRecognition.startListening()

  // SOUND
  useEffect(() => {
    sound.add('background', {
      url: 'sounds/background.mp3',
      loop: true,

      // autoPlay: true,
    })
    sound.add('hit', 'sounds/hit.mp3')
    sound.add('heal', 'sounds/heal.mp3')
    sound.add('shield', 'sounds/shield.mp3')
    sound.add('ultimate', 'sounds/ultimate.mp3')
    sound.play('background', {
      volume: 0.1,
    })
  }, [])

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
    // setClient(new Colyseus.Client('ws://localhost:2567'))
    setClient(new Colyseus.Client('https://aime-multiplayer.herokuapp.com/'))

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  //#region ADD & REMOVE AXIE
  const addMainAxieToScene = (axieId: string, animation) => {
    gameRef.current.add('ally', axieId, { x: 160, y: 420 }, AxieDirection.Right, animation)
  }

  const addAxieToScene = (axieId: string, animation: string) => {
    gameRef.current.add('enemy', axieId, { x: 640, y: 200 }, AxieDirection.Left, animation)
  }

  const removeAxieFromScene = (axieContainer: FigureContainer) => {
    gameRef.current.remove(axieContainer)
  }

  //#endregion

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

      setIsGameStart(true)
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

      setIsGameStart(true)
      setRoom(room)
    } catch (error) {
      console.error('join error', error)
    }
  }

  const handleMainPlayerAddress = async () => {
    localStorage.setItem('address', mainPlayerAddress)
    const axieId = await randomAxieId()
    setMainPlayer({
      address: mainPlayerAddress,
      axie: axieId,
    })
  }

  useEffect(() => {
    if (mainPlayer) addMainAxieToScene(mainPlayer.axie, 'activity/appear')
  }, [mainPlayer])

  // ROOM EVENT HANDLER
  useEffect(() => {
    if (room) {
      let enemyAddress
      room.state.players.onAdd = function (player, sessionId) {
        // if (mainPlayer.address !== player.address) {
        //   addAxieToScene(player.axie, player.animation)
        //   enemyAddress = player.address
        //   setEnemyPlayerAddress(player.address)
        // }
      }

      room.onMessage('update-axie', ({ sender, receiver, animation, type }) => {
        if (mainPlayer.address === sender) {
          gameRef.current.ally.changeCurrentAnimation(animation, false)
          gameRef.current.ally.changeCurrentAnimation('action/idle/normal', true, 1)
          // gameRef.current.ally.changeSpell('ally', `/spells-assets/${type}.png`)

          sound.play(type)

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

      room.onMessage('player-joined', (players) => {
        Object.values(players).map((player) => {
          if (player.address !== mainPlayer.address && gameRef.current.enemy === undefined) {
            console.log('add enemy')
            addAxieToScene(player.axie, player.animation)
            enemyAddress = player.address
            setEnemyPlayerAddress(player.address)
          }
        })
      })

      room.onMessage('action-taken', ({ sender, allyHealth }) => {
        if (room.sessionId === sender) setAllyHealth(allyHealth)
      })

      room.onMessage('game-end', ({ winner }) => {
        console.log('winner: ', winner)
        if (winner === mainPlayer.address) {
          gameRef.current.ally.changeCurrentAnimation('activity/victory-pose-back-flip', true, 1)
          setIsWin(true)
        } else {
          gameRef.current.enemy.changeCurrentAnimation('activity/victory-pose-back-flip', true, 1)
          setIsWin(false)
        }
      })

      room.state.players.onRemove = function (player, sessionId) {
        removeAxieFromScene(gameRef.current.enemy)
        gameRef.current.enemy = undefined
        setEnemyPlayerAddress('')
        setEnemyHealth(100)
        setAllyHealth(100)
      }

      room.onLeave((code) => {
        removeAxieFromScene(gameRef.current.enemy)
        gameRef.current.enemy = undefined
        setEnemyPlayerAddress('')
        setEnemyHealth(100)
        setAllyHealth(100)
      })
    }
  }, [room])

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
    console.log('Spell: ', highestScoreSpell)
    // currentSpell.current = highestScoreSpell
    setCurrentSpell(highestScoreSpell)
    if (highestScoreSpell === spells[0].toLowerCase()) hit()
    if (highestScoreSpell === spells[1].toLowerCase()) heal()
    if (highestScoreSpell === spells[2].toLowerCase()) shield()
    if (highestScoreSpell === spells[3].toLowerCase()) ultimate()
  }, [finalTranscript])

  const leaveRoom = async () => {
    if (room) room.leave()
    setIsGameStart(false)
  }

  useEffect(() => {
    let timer
    if (allyHealth <= 0 || enemyHealth <= 0) {
      timer = setTimeout(() => {
        leaveRoom()
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [allyHealth, enemyHealth])

  const copyRoomId = () => {
    navigator.clipboard.writeText(room.id)
  }

  //#region ACTION
  const hit = () => {
    if (room)
      room.send('hit', {
        type: 'hit',
        animation: 'attack/ranged/cast-fly',
        value: randomInRange(5, 15),
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
        value: randomInRange(5, 30),
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
        value: randomInRange(15, 30),
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
        value: randomInRange(20, 50),
        sender: mainPlayer.address,
        receiver: enemyPlayerAddress,
      })
    else console.log('cannot send ultimate')
  }

  //#endregion

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>
  }

  return (
    <div className={s.container}>
      <div className={s.roomInfoHeader}>
        {isGameStart && (
          <>
            <span className={s.roomId}>{room?.id}</span>
            <img
              className={s.copy}
              src='/ui/copy.png'
              alt='Landscape picture'
              width={28}
              height={28}
              onClick={copyRoomId}
            />
            {room?.id && (
              <img
                className={s.outRoom}
                src='/ui/out.png'
                alt='Landscape picture'
                width={113}
                height={42}
                onClick={leaveRoom}
              />
            )}
          </>
        )}
      </div>
      <div className={s.infoHeader}>
        {!isGameStart ? (
          <>
            <img
              className={s.createRoom}
              src='/ui/create.png'
              alt='Landscape picture'
              width={203}
              height={42}
              onClick={createRoom}
            />
            <span className={s.splitText}>OR</span>
            <input
              placeholder='Room id'
              className={s.roomIdInput}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <img
              className={s.joinRoom}
              src='/ui/join.png'
              alt='Landscape picture'
              width={203}
              height={42}
              onClick={joinById}
            />
          </>
        ) : (
          <>
            <span className={s.allyAddress}>
              {mainPlayer?.address.length > 7 ? `${mainPlayer?.address.slice(0, 7)}...` : mainPlayer?.address}
            </span>
            <div className={s.healthBarAlly} style={{}}>
              <div
                className={s.healthBarAllyLayer}
                style={{
                  transform: `scaleX(${Math.max(allyHealth / 100, 0)})`,
                  backgroundColor: allyHealth > 70 ? '#83e26b' : allyHealth > 70 ? '#E2A56B' : '#E26B6B',
                }}></div>
            </div>
            <span className={s.vsText}>VS</span>
            <span className={s.enemyAddress}>
              {enemyPlayerAddress?.length > 7 ? `${enemyPlayerAddress?.slice(0, 7)}...` : enemyPlayerAddress}
            </span>
            <div className={s.healthBarEnemy} style={{}}>
              <div
                className={s.healthBarEnemyLayer}
                style={{
                  transform: `scaleX(${Math.max(enemyHealth / 100, 0)})`,
                  backgroundColor: enemyHealth > 70 ? '#83e26b' : enemyHealth > 70 ? '#E2A56B' : '#E26B6B',
                }}></div>
            </div>
          </>
        )}
      </div>

      <div ref={container} className={s.canvas}>
        {loading && <PuffLoading size={200} />}
      </div>

      {!mainPlayer && (
        <div className={s.overlay}>
          <div className={s.inputAddressContainer}>
            <img style={{ marginTop: 23 }} src='/ui/logo.png' alt='Landscape picture' width={278} height={176} />
            <input
              placeholder='Wallet address'
              className={s.walletAddressInput}
              value={mainPlayerAddress}
              onChange={(e) => setMainPlayerAddress(e.target.value)}
            />
            <img
              className={s.bringMeMagic}
              src='/ui/bringmemagic.png'
              alt='Landscape picture'
              width={265}
              height={42}
              onClick={handleMainPlayerAddress}
            />
          </div>
        </div>
      )}

      <div className={s.result}>
        {isWin && enemyPlayerAddress && room && enemyHealth <= 0 && allyHealth >= 0 && (
          <Image src='/ui/victory.png' alt='Landscape picture' width={272} height={180} />
        )}

        {!isWin && enemyPlayerAddress && room && enemyHealth >= 0 && allyHealth <= 0 && (
          <Image src='/ui/defeat.png' alt='Landscape picture' width={272} height={197} />
        )}
      </div>

      <div style={{ display: 'flex', width: 800, height: 93, justifyContent: 'space-between', marginTop: 8 }}>
        {isGameStart && (
          <>
            <Image
              src='/ui/hit.png'
              alt='Landscape picture'
              width={134}
              height={93}
              style={{ opacity: currentSpell === spells[0] ? 1 : 0.5 }}
            />
            <Image
              src='/ui/heal.png'
              alt='Landscape picture'
              width={120}
              height={92}
              style={{ opacity: currentSpell === spells[1] ? 1 : 0.5 }}
            />
            <Image
              src='/ui/shield.png'
              alt='Landscape picture'
              width={265}
              height={93}
              style={{ opacity: currentSpell === spells[2] ? 1 : 0.5 }}
            />
            <Image
              src='/ui/ultimate.png'
              alt='Landscape picture'
              width={220}
              height={93}
              style={{ opacity: currentSpell === spells[3] ? 1 : 0.5 }}
            />
          </>
        )}
      </div>
      <div
        className={s.mic}
        onTouchStart={startListening}
        onMouseDown={startListening}
        onTouchEnd={SpeechRecognition.stopListening}
        onMouseUp={SpeechRecognition.stopListening}
        style={{ marginTop: 8, cursor: 'pointer', height: 147 }}>
        {isGameStart && <Image src='/ui/mic.png' alt='Landscape picture' width={235} height={147} />}
      </div>
    </div>
  )
}
