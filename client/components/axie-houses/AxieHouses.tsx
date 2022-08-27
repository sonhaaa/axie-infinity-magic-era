// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import 'pixi-spine'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'

import { sound } from '@pixi/sound'

import { useRouter } from 'next/router'
import { SpellCard } from '../spell-card/SpellCard'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieHouses = () => {
  const [mainPlayer, setMainPlayer] = useState<Player>()

  const router = useRouter()

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const [selected, setSelected] = useState(localStorage.getItem('house') || 'gryffindor')

  const houses = {
    gryffindor: {
      damage: 30,
      heal: 10,
      shield: 10,
      ultimate: 10,
      spells: [
        {
          spell: 'dissendium',
          type: 'hit',
        },
        {
          spell: 'incendio',
          type: 'hit',
        },
        {
          spell: 'expulso',
          type: 'hit',
        },
        {
          spell: 'diffindo',
          type: 'ultimate',
        },
      ],
    },
    ravenclaw: {
      damage: 10,
      heal: 10,
      shield: 30,
      ultimate: 10,
      spells: [
        {
          spell: 'repello muggletum',
          type: 'shield',
        },
        {
          spell: 'muffliato',
          type: 'shield',
        },
        {
          spell: 'muffliato',
          type: 'shield',
        },
        {
          spell: 'diffindo',
          type: 'ultimate',
        },
      ],
    },
    slytherin: {
      damage: 10,
      heal: 30,
      shield: 10,
      ultimate: 10,
      spells: [
        {
          spell: 'conffingo',
          type: 'heal',
        },
        {
          spell: 'aguamenti',
          type: 'heal',
        },
        {
          spell: 'Anapneo',
          type: 'heal',
        },
        {
          spell: 'anteoculatia',
          type: 'ultimate',
        },
      ],
    },
    hufflerpuff: {
      damage: 10,
      heal: 10,
      shield: 10,
      ultimate: 30,
      spells: [
        {
          spell: 'brackium emendo',
          type: 'heal',
        },
        {
          spell: 'arania exumai',
          type: 'hit',
        },
        {
          spell: 'avenseguim',
          type: 'shield',
        },
        {
          spell: 'aqua eructo',
          type: 'ultimate',
        },
      ],
    },
  }

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

  // Init game
  useEffect(() => {
    if (!container) return
    if (!container.current) return
    const canvasContainer = container.current
    if (canvasContainer.childElementCount > 0) {
      canvasContainer.lastChild?.remove()
    }

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

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  const joinHouse = () => {
    localStorage.setItem('house', selected)
    localStorage.setItem('housesSpells', JSON.stringify(houses[selected].spells))
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>Houses</span>
        <img
          className={s.backBtn}
          onClick={() => router.replace('/')}
          src='/ui/back.png'
          alt='Back'
          width={97}
          height={42}
        />
      </div>
      <div ref={container} className={s.canvas}></div>
      <>
        <div
          className={s.gryf}
          onClick={() => setSelected('gryffindor')}
          style={{ borderColor: selected === 'gryffindor' ? '#fff' : '#887d87' }}>
          <img className={s.backBtn} src='/ui/gryffindor.png' alt='Gryffindor' width={98} height={160} />
        </div>

        <div
          className={s.slyt}
          onClick={() => setSelected('slytherin')}
          style={{ borderColor: selected === 'slytherin' ? '#fff' : '#887d87' }}>
          <img className={s.backBtn} src='/ui/slytherin.png' alt='Slytherin' width={118} height={121} />
        </div>
        <div
          className={s.rave}
          onClick={() => setSelected('ravenclaw')}
          style={{ borderColor: selected === 'ravenclaw' ? '#fff' : '#887d87' }}>
          <img className={s.backBtn} src='/ui/ravenclaw.png' alt='Ravenclaw' width={102} height={133} />
        </div>
        <div
          className={s.huff}
          onClick={() => setSelected('hufflerpuff')}
          style={{ borderColor: selected === 'hufflerpuff' ? '#fff' : '#887d87' }}>
          <img className={s.backBtn} src='/ui/hufflerpuff.png' alt='Hufflerpuff' width={100} height={111} />
        </div>
      </>

      <img
        className={s.joinHouse}
        src='/ui/join-house.png'
        alt='Join house'
        width={177}
        height={42}
        onClick={joinHouse}
      />

      <>
        <span className={s.houseName}>{selected.charAt(0).toUpperCase() + selected.slice(1)}</span>
        <span className={s.sub1}>Increase for each spell</span>
        <div className={s.spec}>
          <span className={s.specDetail}>Damage</span>
          <span className={s.specDetail}>+{houses[selected].damage}%</span>
        </div>
        <div className={s.spec} style={{ top: 410 }}>
          <span className={s.specDetail}>Heal</span>
          <span className={s.specDetail}>+{houses[selected].heal}%</span>
        </div>
        <div className={s.spec} style={{ top: 450 }}>
          <span className={s.specDetail}>Shield</span>
          <span className={s.specDetail}>+{houses[selected].shield}%</span>
        </div>
        <div className={s.spec} style={{ top: 490 }}>
          <span className={s.specDetail}>Ultimate</span>
          <span className={s.specDetail}>+{houses[selected].ultimate}%</span>
        </div>

        <span className={s.sub2}>House&apos;s spell</span>

        <div className={s.spells}>
          {houses[selected].spells.map((spell, index) => (
            <SpellCard
              scale={0.7}
              key={index}
              type={spell.type}
              countdown={1}
              onFinish={() => {}}
              spellName={spell.spell}
            />
          ))}
        </div>
      </>
    </div>
  )
}
