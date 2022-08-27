// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import Image from 'next/image'
import 'pixi-spine'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { checkCosineSimilarity, genSpellFromAxie, getCosineSimilarityScore } from '../../utils/helper'
import { PuffLoading } from '../puff-loading/PuffLoading'
import { PlaygroundGame } from './PlaygroundGame'
import s from './styles.module.css'
import { AxieDirection } from './types'

import { sound } from '@pixi/sound'

import { useRouter } from 'next/router'
import { SpellCard } from '../spell-card/SpellCard'
import { AXIE_ID } from '../../utils/sampleData'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieSummon = () => {
  const [loading, setLoading] = useState<boolean>()
  const [mainPlayer, setMainPlayer] = useState<Player>()

  const router = useRouter()

  const spells = ['aparecium']

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const [axieSpells, setAxieSpells] = useState([])
  const [axieSummoned, setAxieSummoned] = useState()

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

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  // Check what spell is calling
  useEffect(() => {
    let maxCosine = 0
    let highestScoreSpell = ''

    spells.map((spell) => {
      const score = getCosineSimilarityScore(spell, finalTranscript)
      if (checkCosineSimilarity(spell, finalTranscript, 50)) {
        if (maxCosine < score) {
          maxCosine = score
          highestScoreSpell = spell
        }
      }
    })
    console.log('Spell: ', highestScoreSpell)
    if (highestScoreSpell === spells[0].toLowerCase()) {
      const axieId = AXIE_ID[Math.floor(Math.random() * AXIE_ID.length)]
      setAxieSummoned(axieId)
      gameRef.current.add('ally', axieId, { x: 400, y: 280 }, AxieDirection.Right, 'activity/appear')
      genSpellFromAxie(axieId).then((spell) => {
        setAxieSpells(spell)
      })
    }
  }, [finalTranscript])

  const addAxieToTeam = () => {
    const mainPlayerAxies = JSON.parse(localStorage.getItem('mainPlayerAxies'))
    mainPlayerAxies.push(axieSummoned)
    localStorage.setItem('mainPlayerAxies', JSON.stringify(mainPlayerAxies))
  }

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>Summon</span>
        <img
          onClick={() => router.push('/')}
          className={s.backBtn}
          src='/ui/back.png'
          alt='Smooth Love Postion'
          width={97}
          height={42}
        />
      </div>
      <div ref={container} className={s.canvas}>
        {loading && <PuffLoading size={200} />}
      </div>

      {axieSpells?.length === 0 ? (
        <div className={s.guide}>
          <span className={s.tutorial}>Spell loud</span>
          <span className={s.spell}>{spells[0]}</span>
        </div>
      ) : (
        <>
          <div className={s.spellWrap}>
            {axieSpells.map((spell) => (
              <SpellCard
                key={spell.spell}
                type={spell.type}
                countdown={1}
                spellName={spell.spell}
                onFinish={() => {}}
              />
            ))}
          </div>
          <div className={s.light}>
            <img src='/ui/stage-light.png' alt='Stage light' width={588} height={420} />
          </div>
        </>
      )}

      {axieSpells?.length === 0 ? (
        <div
          className={s.mic}
          onTouchStart={startListening}
          onMouseDown={startListening}
          onTouchEnd={SpeechRecognition.stopListening}
          onMouseUp={SpeechRecognition.stopListening}
          style={{ marginTop: 8, cursor: 'pointer' }}>
          <Image src='/ui/mic.png' alt='Mic' width={235} height={147} />
        </div>
      ) : (
        <>
          <div className={s.mic} style={{ marginTop: 8, cursor: 'pointer' }} onClick={addAxieToTeam}>
            <Image src='/ui/bring.png' alt='Bring to team' width={245} height={147} />
          </div>
        </>
      )}
    </div>
  )
}
