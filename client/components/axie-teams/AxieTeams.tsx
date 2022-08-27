// @ts-nocheck

import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

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

import { useRouter } from 'next/router'

interface Player {
  address: string
  axie: string
}

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH

export const AxieTeams = () => {
  const [loading, setLoading] = useState<boolean>()
  const [mainPlayer, setMainPlayer] = useState<Player>()

  const router = useRouter()

  const mainPlayerAxies = JSON.parse(localStorage.getItem('mainPlayerAxies'))

  const [mainPlayerAxie, setMainPlayerAxie] = useState(JSON.parse(localStorage.getItem('mainPlayerAxie')))
  const [mainPlayerAxieRight, setMainPlayerAxieRight] = useState(
    JSON.parse(localStorage.getItem('mainPlayerAxieSoulRight')),
  )
  const [mainPlayerAxieLeft, setMainPlayerAxieLeft] = useState(
    JSON.parse(localStorage.getItem('mainPlayerAxieSoulLeft')),
  )

  const container = useRef<HTMLDivElement>(null)
  const gameRef = useRef<PlaygroundGame>(null)

  const [selected, setSelected] = useState('main')
  const [axiePanelSelected, setAxiePanelSelected] = useState()

  // SOUND
  useEffect(() => {
    sound.add('background', {
      url: 'sounds/background.mp3',
      loop: true,
    })
  }, [])

  // Init game
  useEffect(() => {
    localStorage.setItem('isSaveTeam', false)
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

    addAxieToScene('main', mainPlayerAxie, 'action/idle/normal', { x: 170, y: 200 }, AxieDirection.Right)
    addAxieToScene('soul-right', mainPlayerAxieRight, 'action/idle/normal', { x: 250, y: 420 }, AxieDirection.Right)
    addAxieToScene('soul-left', mainPlayerAxieLeft, 'action/idle/normal', { x: 100, y: 420 }, AxieDirection.Right)

    setLoading(false)

    return () => {
      if (game) {
        game.destroy()
      }
    }
  }, [mainPlayer])

  useEffect(() => {
    if (gameRef.current.main && gameRef.current.soulLeft && gameRef.current.soulRight) {
      gameRef.current.main.changeCurrentAnimation('action/idle/normal', true, 1)
      gameRef.current.soulRight.changeCurrentAnimation('action/idle/normal', true, 1)
      gameRef.current.soulLeft.changeCurrentAnimation('action/idle/normal', true, 1)
      if (selected === 'main') gameRef.current.main.changeCurrentAnimation('action/run', true, 1)
      if (selected === 'soul-right') gameRef.current.soulRight.changeCurrentAnimation('action/run', true, 1)
      if (selected === 'soul-left') gameRef.current.soulLeft.changeCurrentAnimation('action/run', true, 1)
    }
  }, [selected])

  useEffect(() => {
    if (gameRef.current.main && gameRef.current.soulLeft && gameRef.current.soulRight) {
      if (selected === 'main') {
        gameRef.current.remove(gameRef.current.main)
        addAxieToScene('main', axiePanelSelected, 'battle/get-buff', { x: 170, y: 200 }, AxieDirection.Right)
        setMainPlayerAxie(axiePanelSelected)
      }
      if (selected === 'soul-right') {
        gameRef.current.remove(gameRef.current.soulRight)
        addAxieToScene('soul-right', axiePanelSelected, 'battle/get-buff', { x: 250, y: 420 }, AxieDirection.Right)
        setMainPlayerAxieRight(axiePanelSelected)
      }
      if (selected === 'soul-left') {
        gameRef.current.remove(gameRef.current.soulLeft)
        addAxieToScene('soul-left', axiePanelSelected, 'battle/get-buff', { x: 100, y: 420 }, AxieDirection.Right)
        setMainPlayerAxieLeft(axiePanelSelected)
      }
    }
  }, [axiePanelSelected])

  const saveTeam = () => {
    localStorage.setItem('mainPlayerAxieSoulLeft', mainPlayerAxieLeft)
    localStorage.setItem('mainPlayerAxieSoulRight', mainPlayerAxieRight)
    localStorage.setItem('mainPlayerAxie', mainPlayerAxie)
    localStorage.setItem('isSaveTeam', true)
  }

  const addAxieToScene = (
    type: string,
    axieId: string,
    animation: string,
    position: { x: number; y: number },
    direction: AxieDirection,
  ) => {
    gameRef.current.add(type, axieId, position, direction, animation)
  }

  const showGuide = () => {
    console.log('shown')
  }

  return (
    <div className={s.container}>
      <div className={s.header}>
        <span className={s.title}>Teams</span>
        <img
          onClick={() => router.push('/')}
          className={s.backBtn}
          src='/ui/back.png'
          alt='Back'
          width={97}
          height={42}
        />
      </div>
      <div ref={container} className={s.canvas}>
        {loading && <PuffLoading size={200} />}
      </div>

      <span className={s.fighter}>Fighter</span>
      <span className={s.souls}>Souls</span>

      <img onClick={saveTeam} className={s.saveTeam} src='/ui/save-team.png' alt='Save team' width={167} height={42} />

      {/* AXIE CLICKED OVERLAY */}
      <>
        <div className={s.clickedMain} onMouseEnter={showGuide} onClick={() => setSelected('main')}></div>
        <div className={s.clickedRight} onClick={() => setSelected('soul-right')}></div>
        <div className={s.clickedLeft} onClick={() => setSelected('soul-left')}></div>
      </>

      <div className={s.panel}>
        {mainPlayerAxies?.map((axie, index) => (
          <div
            key={`${axie} - ${index}`}
            className={s.panelCard}
            style={{
              borderColor:
                axie === mainPlayerAxie.toString() ||
                axie === mainPlayerAxieLeft.toString() ||
                axie === mainPlayerAxieRight.toString()
                  ? '#fff'
                  : '#887d87',
            }}
            onClick={() => setAxiePanelSelected(axie)}>
            <img
              className={s.pop}
              src={`https://axiecdn.axieinfinity.com/axies/${axie}/axie/axie-full-transparent.png`}
              alt='Axie'
              width={140}
              height={105}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
