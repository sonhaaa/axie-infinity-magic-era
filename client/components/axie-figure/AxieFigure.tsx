// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import * as Colyseus from 'colyseus.js'
import Image from 'next/image'
import 'pixi-spine'
import {
  checkCosineSimilarity,
  genSpellFromAxie,
  getAxieClass,
  getCosineSimilarityScore,
  randomAxieId,
  randomInRange,
} from '../../utils/helper'
import { PuffLoading } from '../puff-loading/PuffLoading'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'
import { AxieDirection } from './types'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { FigureContainer } from './FigureContainer'

import { sound } from '@pixi/sound'
import { SpellCard } from '../spell-card/SpellCard'

import { useRouter } from 'next/router'
import { BEST_TEAMS } from '../../utils/sampleData'

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
  const [mainPlayerAddress, setMainPlayerAddress] = useState(localStorage.getItem('mainPlayerAddress') || '')
  const [enemyPlayerAddress, setEnemyPlayerAddress] = useState<string>()
  const [isGameStart, setIsGameStart] = useState<boolean>(false)
  const [allyHealth, setAllyHealth] = useState<number>(100)
  const [enemyHealth, setEnemyHealth] = useState<number>(100)
  const [isWin, setIsWin] = useState<boolean>(false)

  const [isHitAvailable, setIsHitAvailable] = useState(false)
  const [isHealAvailable, setIsHealAvailable] = useState(false)
  const [isShieldAvailable, setIsShieldAvailable] = useState(false)
  const [isUltimateAvailable, setIsUltimateAvailable] = useState(false)

  const [axieClasses, setAxieClasses] = useState([])

  const [spellStartFlag, setSpellStartFlag] = useState(false)
  const [timer, setTimer] = useState()

  const router = useRouter()

  const spells = [
    localStorage.getItem('hitSpell') || '',
    localStorage.getItem('healSpell') || '',
    localStorage.getItem('shieldSpell') || '',
    localStorage.getItem('ultimateSpell') === 'null' || !localStorage.getItem('ultimateSpell')
      ? ''
      : localStorage.getItem('ultimateSpell'),
  ]

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
    })
    sound.add('hit', 'sounds/hit.mp3')
    sound.add('heal', 'sounds/heal.mp3')
    sound.add('shield', 'sounds/shield.mp3')
    sound.add('ultimate', 'sounds/ultimate.mp3')
    sound.play('background', {
      volume: 0.1,
    })

    return () => sound.removeAll()
  }, [])

  const initMainPlayerAxies = async () => {
    let axies = []
    for (let i = 0; i < 5; i++) {
      const axieId = await randomAxieId()
      axies.push(axieId)
    }
    return axies
  }

  const pickAxieSoul = () => {
    const axies = JSON.parse(localStorage.getItem('mainPlayerAxies'))
    localStorage.setItem('mainPlayerAxieSoulLeft', axies[0])
    localStorage.setItem('mainPlayerAxieSoulRight', axies[2])
  }

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
    setClient(new Colyseus.Client('ws://localhost:5000'))
    // setClient(new Colyseus.Client('wss://aime-multiplayer.herokuapp.com/'))

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

  useEffect(() => {
    if (room) {
      if (mainPlayer?.address && enemyPlayerAddress) setSpellStartFlag(true)
    }
  }, [room, mainPlayer?.address, enemyPlayerAddress])

  useLayoutEffect(() => {
    if (localStorage.getItem('mainPlayerAddress') && localStorage.getItem('mainPlayerAxie')) {
      setMainPlayer({
        address: localStorage.getItem('mainPlayerAddress'),
        axie: localStorage.getItem('mainPlayerAxie'),
      })
    }
  }, [])

  const getAxieSpells = async () => {
    const mainAxie = JSON.parse(localStorage.getItem('mainPlayerAxie'))
    const left = JSON.parse(localStorage.getItem('mainPlayerAxieSoulLeft'))
    const right = JSON.parse(localStorage.getItem('mainPlayerAxieSoulRight'))

    await genSpellFromAxie(mainAxie.toString()).then((spell) => {
      localStorage.setItem('mainAxieSpell', JSON.stringify(spell))
    })
    await genSpellFromAxie(left.toString()).then((spell) => {
      localStorage.setItem('leftAxieSpell', JSON.stringify(spell))
    })
    await genSpellFromAxie(right.toString()).then((spell) => {
      localStorage.setItem('rightAxieSpell', JSON.stringify(spell))
    })
  }

  const setFirstSpellCombo = () => {
    const main = JSON.parse(localStorage.getItem('mainAxieSpell'))
    const left = JSON.parse(localStorage.getItem('leftAxieSpell'))
    const right = JSON.parse(localStorage.getItem('rightAxieSpell'))

    main.map((s) => {
      if (s.type === 'hit') localStorage.setItem('hitSpell', s.spell)
      if (s.type === 'heal') localStorage.setItem('healSpell', s.spell)
      if (s.type === 'shield') localStorage.setItem('shieldSpell', s.spell)
    })
    left.map((s) => {
      if (s.type === 'hit') localStorage.setItem('hitSpell', s.spell)
      if (s.type === 'heal') localStorage.setItem('healSpell', s.spell)
      if (s.type === 'shield') localStorage.setItem('shieldSpell', s.spell)
    })
    right.map((s) => {
      if (s.type === 'hit') localStorage.setItem('hitSpell', s.spell)
      if (s.type === 'heal') localStorage.setItem('healSpell', s.spell)
      if (s.type === 'shield') localStorage.setItem('shieldSpell', s.spell)
    })
  }

  useEffect(() => {
    const getClasses = async (main, left, right) => {
      const mainAxieClass = await getAxieClass(main)
      const leftAxieClass = await getAxieClass(left)
      const rightAxieClass = await getAxieClass(right)
      setAxieClasses([mainAxieClass, leftAxieClass, rightAxieClass])
    }
    const mainAxie = JSON.parse(localStorage.getItem('mainPlayerAxie'))
    const left = JSON.parse(localStorage.getItem('mainPlayerAxieSoulLeft'))
    const right = JSON.parse(localStorage.getItem('mainPlayerAxieSoulRight'))
    const isReselectedSpell = JSON.parse(localStorage.getItem('isSaveSpell'))
    const isReselectedTeam = JSON.parse(localStorage.getItem('isSaveTeam'))
    console.log(isReselectedTeam)
    if (!isReselectedSpell) {
      localStorage.removeItem('hitSpell')
      localStorage.removeItem('healSpell')
      localStorage.removeItem('shieldSpell')
    }
    if (mainAxie && left && right && !isReselectedSpell) {
      getAxieSpells().then(() => setFirstSpellCombo())
    }
    if (mainAxie && left && right) {
      getClasses(mainAxie.toString(), left.toString(), right.toString())
    }
  }, [])

  // Gen Ultimate Spell
  useEffect(() => {
    if (axieClasses)
      BEST_TEAMS.map((team) => {
        if (team.name === axieClasses.join('-')) localStorage.setItem('ultimateSpell', team.ultimateSpell)
      })
  }, [axieClasses])

  const handleMainPlayerAddress = async () => {
    localStorage.setItem('mainPlayerAddress', mainPlayerAddress)
    const axieId = await randomAxieId()
    setMainPlayer({
      address: mainPlayerAddress,
      axie: axieId,
    })
    localStorage.setItem('mainPlayerAxie', axieId)
    const axies = await initMainPlayerAxies()
    axies.push(axieId.toString())
    localStorage.setItem('mainPlayerAxies', JSON.stringify(axies))
    pickAxieSoul()
    getAxieSpells().then(() => setFirstSpellCombo())
  }

  // ADD MAINPLAYER TO SCENE
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
          sound.play(type)

          const lengthFrameTexture = {
            hit: 8,
            heal: 13,
            shield: 15,
            ultimate: 13,
          }

          let frames = []

          Array(lengthFrameTexture[type])
            .fill()
            .forEach((_, index) => {
              frames.push(`/spells-assets/${type}/${index}.png`)
            })

          gameRef.current.ally.changeSpell('ally', type, frames)
        }
        if (mainPlayer.address === receiver) {
          // gameRef.current.ally.changeCurrentAnimation('defense/hit-by-normal', false)
          // gameRef.current.ally.changeCurrentAnimation('action/idle/normal', true, 1)
        }

        if (enemyAddress === sender) {
          gameRef.current.enemy.changeCurrentAnimation(animation, false)
          gameRef.current.enemy.changeCurrentAnimation('action/idle/normal', true, 1)

          const lengthFrameTexture = {
            hit: 8,
            heal: 13,
            shield: 15,
            ultimate: 13,
          }

          let frames = []

          Array(lengthFrameTexture[type])
            .fill()
            .forEach((_, index) => {
              frames.push(`/spells-assets/${type}/${index}.png`)
            })

          gameRef.current.enemy.changeSpell('enemy', type, frames)
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

      room.onMessage('game-timer', ({ counter }) => {
        setTimer(counter)
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
      if (spell) {
        const score = getCosineSimilarityScore(spell, finalTranscript)
        if (checkCosineSimilarity(spell, finalTranscript, 60)) {
          if (maxCosine < score) {
            maxCosine = score
            highestScoreSpell = spell
          }
        }
      }
    })
    console.log('Spell: ', highestScoreSpell)
    if (highestScoreSpell === spells[0].toLowerCase() && isHitAvailable) {
      hit()
      setIsHitAvailable(false)
    }
    if (highestScoreSpell === spells[1].toLowerCase() && isHealAvailable) {
      heal()
      setIsHealAvailable(false)
    }
    if (highestScoreSpell === spells[2].toLowerCase() && isShieldAvailable) {
      shield()
      setIsShieldAvailable(false)
    }
    if (highestScoreSpell === spells[3].toLowerCase() && isUltimateAvailable) {
      ultimate()
      setIsUltimateAvailable(false)
    }
  }, [finalTranscript])

  const leaveRoom = async () => {
    if (room) room.leave()
    gameRef.current.ally.changeSpell('ally', 'default', ['/spells-assets/default.png'])
    setSpellStartFlag(false)
    setIsHitAvailable(false)
    setIsHealAvailable(false)
    setIsShieldAvailable(false)
    setIsUltimateAvailable(false)
    setTimer(undefined)
    setIsGameStart(false)
  }

  // After game finish
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
      {/* HOME UI OVERLAY */}
      {!isGameStart && (
        <>
          <div className={s.mainPlayerInfo}>
            <img className={s.avatar} src='/ui/avatar.png' alt='Avatar' width={58} height={58} />
            <span className={s.address}>{mainPlayer?.address}</span>
            <div className={s.slp}>
              <div className={s.slpWrapper}>
                <img className={s.slpIcon} src='/ui/slp.png' alt='Smooth Love Postion' width={24} height={24} />
                <span className={s.slpNumber}>3000</span>
              </div>
            </div>
          </div>
          <div className={s.uiOverlay}>
            <>
              <div className={s.houses} onClick={() => router.replace('/houses')}>
                <img src='/ui/houses.png' alt='Houses' width={230} height={230} />
              </div>
              <div className={s.classroom} onClick={() => router.replace('/school')}>
                <img src='/ui/school.png' alt='Classroom' width={230} height={230} />
              </div>
              <div className={s.wedding} onClick={() => router.replace('/wedding')}>
                <img src='/ui/wedding.png' alt='Wedding' width={220} height={220} />
              </div>
            </>
            <>
              <div className={s.axiesBtn} onClick={() => router.replace('/teams')}>
                <img src='/ui/axies-btn.png' alt='' width={50} height={57} />
              </div>
              <div className={s.summonBtn} onClick={() => router.replace('/summon')}>
                <img src='/ui/summon-btn.png' alt='' width={63} height={57} />
              </div>
              <div className={s.spellsBtn} onClick={() => router.replace('/spells')}>
                <img src='/ui/spells-btn.png' alt='' width={51} height={57} />
              </div>
              <div className={s.friendsBtn} onClick={() => router.replace('/wedding')}>
                <img src='/ui/friends-btn.png' alt='' width={58} height={57} />
              </div>
              <div className={s.settingsBtn}>
                <img src='/ui/settings-btn.png' alt='' width={64} height={57} />
              </div>
            </>
            <>
              <div className={s.bossBtn} onClick={() => router.replace('/boss')}>
                <img src='/ui/boss.png' alt='' width={111} height={81} />
              </div>
            </>
          </div>
        </>
      )}
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

      {/* TIMER */}
      {timer && <span className={s.timer}>{`${Math.floor(timer / 60)}:${timer - Math.floor(timer / 60) * 60}`}</span>}

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

      {/* SPELL CARD */}
      <div
        style={{
          display: 'flex',
          width: 800,
          height: 93,
          justifyContent: 'space-between',
          marginTop: 8,
        }}>
        {spellStartFlag && (
          <>
            {spells[0] && (
              <SpellCard
                key='hit'
                type='hit'
                countdown={isHitAvailable ? 0 : 5}
                onFinish={() => setIsHitAvailable(true)}
                spellName={spells[0]}
                onClick={hit}
              />
            )}
            {spells[1] && (
              <SpellCard
                key='heal'
                type='heal'
                countdown={isHealAvailable ? 0 : 10}
                onFinish={() => setIsHealAvailable(true)}
                spellName={spells[1]}
                onClick={heal}
              />
            )}
            {spells[2] && (
              <SpellCard
                key='shield'
                type='shield'
                countdown={isShieldAvailable ? 0 : 15}
                onFinish={() => setIsShieldAvailable(true)}
                spellName={spells[2]}
                onClick={shield}
              />
            )}
            {spells[3] && (
              <SpellCard
                key='ultimate'
                type='ultimate'
                countdown={isUltimateAvailable ? 0 : 30}
                onFinish={() => setIsUltimateAvailable(true)}
                spellName={spells[3]}
                onClick={ultimate}
              />
            )}
          </>
        )}
      </div>

      {/* HOLD TO SPEAK */}
      <div
        className={s.mic}
        onTouchStart={startListening}
        onMouseDown={startListening}
        onTouchEnd={SpeechRecognition.stopListening}
        onMouseUp={SpeechRecognition.stopListening}
        style={{ marginTop: 8, cursor: 'pointer' }}>
        {spellStartFlag && <Image src='/ui/mic.png' alt='Landscape picture' width={235} height={147} />}
      </div>
    </div>
  )
}
