// @ts-nocheck
import { memo, useEffect, useState } from 'react'
import 'pixi-spine'
import Image from 'next/image'

const spellTypes = {
  hit: {
    type: 'hit',
    color: '#CC6666',
    path: '/ui/hit-icon.png',
    background: '#E4CBBD',
  },
  heal: {
    type: 'heal',
    color: '#77B18B',
    path: '/ui/heal-icon.png',
    background: '#DCE9DD',
  },
  shield: {
    type: 'shield',
    color: '#4572B5',
    path: '/ui/shield-icon.png',
    background: '#E3E9F0',
  },
  ultimate: {
    type: 'ultimate',
    color: '#76559A',
    path: '/ui/ultimate-icon.png',
    background: '#4F0F0F',
  },
}

const Timer = memo(function Timer({ setIsTimerDone, seconds = 15, setIsAvailable }) {
  const [showSec, setShowSec] = useState(seconds)

  useEffect(() => setShowSec(seconds), [seconds])
  useEffect(() => {
    const timer = showSec > 0 && setTimeout(() => setShowSec(showSec - 1), 1000)
    if (showSec === 0) {
      setIsTimerDone(true)
      console.log('Countdown done! Spell available')

      setIsAvailable()
    }
    return () => clearInterval(timer)
  }, [setIsTimerDone, showSec])

  return <span>{showSec}</span>
})

export const SpellCard = ({ scale, type, countdown, spellName, onClick, onFinish }) => {
  const [isTimerDone, setIsTimerDone] = useState(false)

  useEffect(() => {
    setIsTimerDone(false)
  }, [countdown])

  return (
    <div
      style={{
        position: 'relative',
        opacity: !isTimerDone ? 0.5 : 1,
        transform: `scale(${scale})`,
      }}
      onClick={onClick}>
      <div
        style={{
          width: 44,
          height: 44,
          border: `4px solid ${spellTypes[type].color}`,
          borderRadius: '50%',
          position: 'absolute',
          left: '50%',
          transform: `translateX(-50%)`,
          display: 'flex',
          background: spellTypes[type].background,
          justifyContent: 'center',
          fontFamily: 'GUMDROP',
          alignItems: 'center',
          msUserSelect: 'none',
        }}>
        {isTimerDone && <Image src={spellTypes[type].path} alt='Icon' width={24} height={24} />}
        {!isTimerDone && <Timer setIsTimerDone={setIsTimerDone} seconds={countdown} setIsAvailable={onFinish} />}
      </div>

      <div
        style={{
          background: spellTypes[type].color,
          borderRadius: 12,
          marginTop: 20,
          padding: '28px 20px 12px 20px',
          fontFamily: 'GUMDROP',
          fontSize: 26,
          whiteSpace: 'nowrap',
          msUserSelect: 'none',
        }}>
        {spellName}
      </div>
    </div>
  )
}
