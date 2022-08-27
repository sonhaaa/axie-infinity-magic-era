// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import 'pixi-spine'
import { PuffLoading } from '../puff-loading/PuffLoading'
import hit1 from './effects/hit-1/explosion-2-mi-round.json'
import hit2 from './effects/hit-2/sparks_13_v02.json'
import hit3 from './effects/hit-3/energy-3-mi-round.json'
import { FigureContainer } from './FigureContainer'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'
import { AxieDirection } from './types'

import { sound } from '@pixi/sound'

import { useRouter } from 'next/router'
import { randomInRange } from '../../utils/helper'
import { AXIE_ID } from '../../utils/sampleData'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieBoss = () => {
  const [loading, setLoading] = useState<boolean>()
  const [mainPlayer, setMainPlayer] = useState<Player>()

  const mainPlayerAxie = localStorage.getItem('mainPlayerAxie')

  const router = useRouter()

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const MAX_BOSS_HEALTH = 1_000_000_000
  const [bossHealth, setBossHealth] = useState(MAX_BOSS_HEALTH)
  const [yourDamage, setYourDamage] = useState(0)

  const attackAnimations = [
    'attack/melee/horn-gore',
    'attack/melee/mouth-bite',
    'attack/melee/multi-attack',
    'attack/melee/normal-attack',
    'attack/melee/shrimp',
    'attack/melee/tail-multi-slap',
    'attack/melee/tail-roll',
    'attack/melee/tail-smash',
    'attack/melee/tail-thrash',
    'attack/ranged/cast-fly',
    'attack/ranged/cast-high',
    'attack/ranged/cast-low',
    'attack/ranged/cast-multi',
  ]

  // SOUND
  useEffect(() => {
    sound.add('background', {
      url: 'sounds/background.mp3',
      loop: true,
      autoPlay: true,
      volume: 0.1,
    })

    return () => sound.removeAll()
  }, [])

  useEffect(() => {
    let bossInterval
    let damageInterval
    if (gameRef.current) {
      bossInterval = setInterval(() => {
        gameRef.current.boss.state.setAnimation(1, 'attack/melee/normal-attack', false)
        gameRef.current.boss.state.setAnimation(0, 'action/idle/counter-state', true, 2)
      }, 5000)
      damageInterval = setInterval(() => {
        setBossHealth((prev) => prev - randomInRange(100000, 1000000))
        setYourDamage((prev) => prev + randomInRange(1000, 10000))
      }, 200)
    }
    return () => {
      clearInterval(bossInterval)
      clearInterval(damageInterval)
    }
  }, [gameRef.current])

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

    gameRef.current.addBoss('boss/bear-dad/bear-dad.png')
    gameRef.current.boss.state.setAnimation(0, 'action/idle/counter-state', true)

    // Add hit effect
    for (let i = 0; i < 7; i++) {
      gameRef.current.addHitEffect(
        { x: randomInRange(500, 700), y: randomInRange(150, 400) },
        randomInRange(0.2, 1),
        'effects/hit-1/explosion-2-mi-round.png',
        `
      explosion-2-mi-round.png
      size: 1024,1024
      format: RGBA8888
      filter: Linear,Linear
      repeat: none
      explosion-8-mi-round_00
        rotate: false
        xy: 2,2
        size: 256,256
        orig: 256,256
        offset: 0, 0
        index: -1
      explosion-8-mi-round_01
        rotate: false
        xy: 820,262
        size: 118,123
        orig: 118,123
        offset: 0, 0
        index: -1
      explosion-8-mi-round_02
        rotate: false
        xy: 213,455
        size: 169,169
        orig: 169,169
        offset: 0, 0
        index: -1
      explosion-8-mi-round_03
        rotate: false
        xy: 213,262
        size: 189,189
        orig: 189,189
        offset: 0, 0
        index: -1
      explosion-8-mi-round_04
        rotate: false
        xy: 2,684
        size: 201,201
        orig: 201,201
        offset: 0, 0
        index: -1
      explosion-8-mi-round_05
        rotate: false
        xy: 2,262
        size: 207,207
        orig: 207,207
        offset: 0, 0
        index: -1
      explosion-8-mi-round_06
        rotate: false
        xy: 694,2
        size: 209,207
        orig: 209,207
        offset: 0, 0
        index: -1
      explosion-8-mi-round_07
        rotate: false
        xy: 2,473
        size: 207,207
        orig: 207,207
        offset: 0, 0
        index: -1
      explosion-8-mi-round_08
        rotate: false
        xy: 479,2
        size: 211,211
        orig: 211,211
        offset: 0, 0
        index: -1
      explosion-8-mi-round_09
        rotate: false
        xy: 262,2
        size: 213,213
        orig: 213,213
        offset: 0, 0
        index: -1
      explosion-8-mi-round_10
        rotate: false
        xy: 213,628
        size: 149,135
        orig: 149,135
        offset: 0, 0
        index: -1
      explosion-8-mi-round_11
        rotate: false
        xy: 2,889
        size: 138,133
        orig: 138,133
        offset: 0, 0
        index: -1
      explosion-8-mi-round_12
        rotate: false
        xy: 213,767
        size: 134,129
        orig: 134,129
        offset: 0, 0
        index: -1
      explosion-8-mi-round_13
        rotate: false
        xy: 406,262
        size: 134,128
        orig: 134,128
        offset: 0, 0
        index: -1
      explosion-8-mi-round_14
        rotate: false
        xy: 544,262
        size: 134,126
        orig: 134,126
        offset: 0, 0
        index: -1
      explosion-8-mi-round_15
        rotate: false
        xy: 682,262
        size: 134,124
        orig: 134,124
        offset: 0, 0
        index: -1
      explosion-8-mi-round_16
        rotate: false
        xy: 213,900
        size: 131,121
        orig: 131,121
        offset: 0, 0
        index: -1
      explosion-8-mi-round_17
        rotate: false
        xy: 907,2
        size: 94,91
        orig: 94,91
        offset: 0, 0
        index: -1
      explosion-8-mi-round_18
        rotate: false
        xy: 907,97
        size: 89,88
        orig: 89,88
        offset: 0, 0
        index: -1
      explosion-8-mi-round_19
        rotate: false
        xy: 406,394
        size: 89,86
        orig: 89,86
        offset: 0, 0
        index: -1
      explosion-8-mi-round_20
        rotate: false
        xy: 499,394
        size: 88,82
        orig: 88,82
        offset: 0, 0
        index: -1
      explosion-8-mi-round_21
        rotate: false
        xy: 144,889
        size: 60,80
        orig: 60,80
        offset: 0, 0
        index: -1
      explosion-8-mi-round_22
        rotate: false
        xy: 907,189
        size: 59,68
        orig: 59,68
        offset: 0, 0
        index: -1
      explosion-8-mi-round_23
        rotate: false
        xy: 262,219
        size: 14,15
        orig: 14,15
        offset: 0, 0
        index: -1
      explosion-8-mi-round_24
        rotate: false
        xy: 262,238
        size: 7,7
        orig: 7,7
        offset: 0, 0
        index: -1
      `,
        JSON.stringify(hit1),
        randomInRange(1, 5),
      )
    }

    for (let i = 0; i < 7; i++) {
      gameRef.current.addHitEffect(
        { x: randomInRange(500, 700), y: randomInRange(150, 400) },
        randomInRange(0.2, 1),
        'effects/hit-2/sparks_13_v02.png',
        `
        sparks_13_v02.png
        size: 512,512
        format: RGBA8888
        filter: Linear,Linear
        repeat: none
        sparks_13_v02_00000
          rotate: false
          xy: 78,284
          size: 25,26
          orig: 25,26
          offset: 0, 0
          index: -1
        sparks_13_v02_00001
          rotate: false
          xy: 2,284
          size: 72,84
          orig: 72,84
          offset: 0, 0
          index: -1
        sparks_13_v02_00002
          rotate: false
          xy: 2,175
          size: 137,105
          orig: 137,105
          offset: 0, 0
          index: -1
        sparks_13_v02_00003
          rotate: false
          xy: 346,2
          size: 160,155
          orig: 160,155
          offset: 0, 0
          index: -1
        sparks_13_v02_00004
          rotate: false
          xy: 176,2
          size: 166,166
          orig: 166,166
          offset: 0, 0
          index: -1
        sparks_13_v02_00005
          rotate: false
          xy: 2,2
          size: 170,169
          orig: 170,169
          offset: 0, 0
          index: -1
        `,
        JSON.stringify(hit2),
        randomInRange(3, 8),
      )
    }

    for (let i = 0; i < 3; i++) {
      gameRef.current.addHitEffect(
        { x: randomInRange(500, 700), y: randomInRange(150, 400) },
        randomInRange(0.2, 1),
        'effects/hit-3/energy-3-mi-round.png',
        `
        energy-3-mi-round.png
        size: 2048,1024
        format: RGBA8888
        filter: Linear,Linear
        repeat: none
        energy-5-mi-round_00
          rotate: false
          xy: 262,262
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_01
          rotate: false
          xy: 782,869
          size: 118,108
          orig: 118,108
          offset: 0, 0
          index: -1
        energy-5-mi-round_02
          rotate: false
          xy: 782,698
          size: 171,167
          orig: 171,167
          offset: 0, 0
          index: -1
        energy-5-mi-round_03
          rotate: false
          xy: 782,256
          size: 209,197
          orig: 209,197
          offset: 0, 0
          index: -1
        energy-5-mi-round_04
          rotate: false
          xy: 262,782
          size: 227,215
          orig: 227,215
          offset: 0, 0
          index: -1
        energy-5-mi-round_05
          rotate: false
          xy: 2,782
          size: 243,230
          orig: 243,230
          offset: 0, 0
          index: -1
        energy-5-mi-round_06
          rotate: false
          xy: 782,2
          size: 251,250
          orig: 251,250
          offset: 0, 0
          index: -1
        energy-5-mi-round_07
          rotate: false
          xy: 2,522
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_08
          rotate: false
          xy: 262,522
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_09
          rotate: false
          xy: 522,2
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_10
          rotate: false
          xy: 2,2
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_11
          rotate: false
          xy: 2,262
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_12
          rotate: false
          xy: 262,2
          size: 256,256
          orig: 256,256
          offset: 0, 0
          index: -1
        energy-5-mi-round_13
          rotate: false
          xy: 522,262
          size: 256,251
          orig: 256,251
          offset: 0, 0
          index: -1
        energy-5-mi-round_14
          rotate: false
          xy: 522,517
          size: 256,250
          orig: 256,250
          offset: 0, 0
          index: -1
        energy-5-mi-round_15
          rotate: false
          xy: 522,771
          size: 256,247
          orig: 256,247
          offset: 0, 0
          index: -1
        energy-5-mi-round_16
          rotate: false
          xy: 1037,2
          size: 256,245
          orig: 256,245
          offset: 0, 0
          index: -1
        energy-5-mi-round_17
          rotate: false
          xy: 782,457
          size: 149,237
          orig: 149,237
          offset: 0, 0
          index: -1
        `,
        JSON.stringify(hit3),
        randomInRange(2, 10),
      )
    }

    // Add axies
    gameRef.current.addAxie(mainPlayerAxie, { x: 100, y: 450 }, 'attack/melee/tail-multi-slap')

    AXIE_ID.map((axie) => {
      gameRef.current.addAxie(
        axie,
        { x: randomInRange(100, 300), y: randomInRange(200, 450) },
        attackAnimations[Math.floor(Math.random() * attackAnimations.length)],
      )
      // setTimeout(() => {
      // }, 200)
    })

    setLoading(false)

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>Boss</span>

        <img
          onClick={() => router.push('/')}
          className={s.backBtn}
          src='/ui/back.png'
          alt='Smooth Love Postion'
          width={97}
          height={42}
        />
      </div>

      <div className={s.infoHeader}>
        <>
          <span className={s.allyAddress}>Big bear - {Math.floor(bossHealth)}</span>
          <div className={s.healthBarAlly}>
            <div
              className={s.healthBarAllyLayer}
              style={{
                transform: `scaleX(${Math.max(bossHealth / MAX_BOSS_HEALTH, 0)})`,
                backgroundColor:
                  bossHealth > MAX_BOSS_HEALTH / 3
                    ? '#83e26b'
                    : bossHealth > MAX_BOSS_HEALTH / 3
                    ? '#E2A56B'
                    : '#E26B6B',
              }}></div>
          </div>
        </>
      </div>
      <div ref={container} className={s.canvas}>
        {loading && <PuffLoading size={200} />}
      </div>

      <span className={s.damage}>Your damage: {Math.floor(yourDamage)}</span>
    </div>
  )
}
