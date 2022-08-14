import React from 'react'
import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

const appId = 'd548520c-0e64-4b1b-842b-03e9be004504'
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId)
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition)

const Dictaphone = () => {
  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition()
  const startListening = () => SpeechRecognition.startListening({ continuous: true })

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser does not support speech recognition.</span>
  }

  return (
    <div>
      <p style={{ color: 'black' }}>Microphone: {listening ? 'on' : 'off'}</p>
      <p style={{ color: 'black' }}>{transcript}</p>

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
export default Dictaphone
