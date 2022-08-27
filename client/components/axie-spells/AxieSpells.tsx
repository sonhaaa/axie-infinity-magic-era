// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import 'pixi-spine'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'

import { sound } from '@pixi/sound'

import { useRouter } from 'next/router'
import { SpellCard } from '../spell-card/SpellCard'
import { genSpellFromAxie } from '../../utils/helper'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieSpells = () => {
  const [mainPlayer, setMainPlayer] = useState<Player>()

  const router = useRouter()

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const [mainAxieSpells, setMainAxieSpells] = useState([])
  const [soulRightSpells, setSoulRightSpells] = useState([])
  const [soulLeftSpells, setSoulLeftSpells] = useState([])
  const [housesSpells, setHousesSpells] = useState(JSON.parse(localStorage.getItem('housesSpells')))

  const [hitSelected, setHitSelected] = useState(localStorage.getItem('hitSpell'))
  const [healSelected, setHealSelected] = useState(localStorage.getItem('healSpell'))
  const [shieldSelected, setShieldSelected] = useState(localStorage.getItem('shieldSpell'))
  const [ultimateSelected, setUltimateSelected] = useState(localStorage.getItem('ultimateSpell'))

  const [uS, setUS] = useState(localStorage.getItem('ultimateSpell'))

  const mainPlayerAxie = JSON.parse(localStorage.getItem('mainPlayerAxie'))
  const mainPlayerAxieSoulRight = JSON.parse(localStorage.getItem('mainPlayerAxieSoulRight'))
  const mainPlayerAxieSoulLeft = JSON.parse(localStorage.getItem('mainPlayerAxieSoulLeft'))

  useLayoutEffect(() => {
    genSpellFromAxie(mainPlayerAxie).then((spell) => {
      setMainAxieSpells(spell)
    })
    genSpellFromAxie(mainPlayerAxieSoulRight).then((spell) => {
      setSoulRightSpells(spell)
    })
    genSpellFromAxie(mainPlayerAxieSoulLeft).then((spell) => {
      setSoulLeftSpells(spell)
    })
  }, [])

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
    localStorage.setItem('isSaveSpell', false)
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

  const saveSpell = () => {
    hitSelected && localStorage.setItem('hitSpell', hitSelected)
    healSelected && localStorage.setItem('healSpell', healSelected)
    shieldSelected && localStorage.setItem('shieldSpell', shieldSelected)
    ultimateSelected && localStorage.setItem('ultimateSpell', ultimateSelected)
    localStorage.setItem('isSaveSpell', true)
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>Spells</span>
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
        <div className={s.spellContainer}>
          <span className={s.titleSpell}>Hit</span>
          <div className={s.spellWrapper}>
            {mainAxieSpells?.map(
              (spell) =>
                spell.type === 'hit' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setHitSelected(spell.spell)
                    }}
                  />
                ),
            )}
            {soulLeftSpells?.map(
              (spell) =>
                spell.type === 'hit' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setHitSelected(spell.spell)
                    }}
                  />
                ),
            )}
            {soulRightSpells?.map(
              (spell) =>
                spell.type === 'hit' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setHitSelected(spell.spell)
                    }}
                  />
                ),
            )}
            {housesSpells?.map(
              (spell) =>
                spell.type === 'hit' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setHitSelected(spell.spell)
                    }}
                  />
                ),
            )}
          </div>
          <div className={s.pickedSpell}>
            {hitSelected && (
              <SpellCard type='hit' countdown={1} spellName={hitSelected} onFinish={() => {}} scale={0.7} />
            )}
          </div>
        </div>
        <div className={s.spellContainer} style={{ left: 208 }}>
          <span className={s.titleSpell}>Heal</span>
          <div className={s.spellWrapper}>
            {mainAxieSpells?.map(
              (spell) =>
                spell.type === 'heal' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setHealSelected(spell.spell)}
                  />
                ),
            )}
            {soulLeftSpells?.map(
              (spell) =>
                spell.type === 'heal' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setHealSelected(spell.spell)}
                  />
                ),
            )}
            {soulRightSpells?.map(
              (spell) =>
                spell.type === 'heal' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setHealSelected(spell.spell)}
                  />
                ),
            )}
            {housesSpells?.map(
              (spell) =>
                spell.type === 'heal' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setHealSelected(spell.spell)
                    }}
                  />
                ),
            )}
          </div>
          <div className={s.pickedSpell}>
            {healSelected && (
              <SpellCard type='heal' countdown={1} spellName={healSelected} onFinish={() => {}} scale={0.7} />
            )}
          </div>
        </div>
        <div className={s.spellContainer} style={{ left: 406 }}>
          <span className={s.titleSpell}>Shield</span>
          <div className={s.spellWrapper}>
            {mainAxieSpells?.map(
              (spell) =>
                spell.type === 'shield' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setShieldSelected(spell.spell)}
                  />
                ),
            )}
            {soulLeftSpells?.map(
              (spell) =>
                spell.type === 'shield' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setShieldSelected(spell.spell)}
                  />
                ),
            )}
            {soulRightSpells?.map(
              (spell) =>
                spell.type === 'shield' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => setShieldSelected(spell.spell)}
                  />
                ),
            )}
            {housesSpells?.map(
              (spell) =>
                spell.type === 'shield' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setShieldSelected(spell.spell)
                    }}
                  />
                ),
            )}
          </div>
          <div className={s.pickedSpell}>
            {shieldSelected && (
              <SpellCard type='shield' countdown={1} spellName={shieldSelected} onFinish={() => {}} scale={0.7} />
            )}
          </div>
        </div>
        <div className={s.spellContainer} style={{ left: 605 }}>
          <span className={s.titleSpell}>Ultimate</span>
          <div className={s.spellWrapper}>
            {uS !== 'null' && uS && (
              <SpellCard
                type='ultimate'
                countdown={1}
                spellName={uS}
                onFinish={() => {}}
                scale={0.7}
                onClick={() => {
                  setUltimateSelected(uS)
                }}
              />
            )}
            {housesSpells?.map(
              (spell) =>
                spell.type === 'ultimate' && (
                  <SpellCard
                    key={spell.spell}
                    type={spell.type}
                    countdown={1}
                    spellName={spell.spell}
                    onFinish={() => {}}
                    scale={0.7}
                    onClick={() => {
                      setUltimateSelected(spell.spell)
                    }}
                  />
                ),
            )}
          </div>
          <div className={s.pickedSpell}>
            {ultimateSelected && (
              <SpellCard type='ultimate' countdown={1} spellName={ultimateSelected} onFinish={() => {}} scale={0.7} />
            )}
          </div>
        </div>
      </>

      <img
        onClick={saveSpell}
        className={s.saveSpell}
        src='/ui/save-spell.png'
        alt='Save spell'
        width={166}
        height={42}
      />

      <></>
    </div>
  )
}
