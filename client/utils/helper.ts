import { AxieMixer } from '@axieinfinity/mixer'
import { getAxieGenes } from './axie'

export interface Key {
  code: string
  isDown: boolean
  isUp: boolean
  press: any
  release: any
  downHandler: (event: KeyboardEvent) => void
  upHandler: (event: KeyboardEvent) => void
}

export const keyboard = (keyCode: string) => {
  const key = {} as Key
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined

  key.downHandler = (event: KeyboardEvent) => {
    if (event.key === key.code) {
      if (key.isUp && key.press) {
        key.press()
      }
      key.isDown = true
      key.isUp = false
    }
  }

  key.upHandler = (event: KeyboardEvent) => {
    if (event.key === key.code) {
      if (key.isDown && key.release) {
        key.release()
      }
      key.isDown = false
      key.isUp = true
    }
  }

  return key
}

export const hitTestRectangle = (r1: any, r2: any) => {
  //Define the variables we'll need to calculate
  let hit: boolean, combinedHalfWidths, combinedHalfHeights, vx, vy

  //hit will determine whether there's a collision
  hit = false

  //Find the center points of each sprite
  r1.centerX = r1.x + r1.width / 2
  r1.centerY = r1.y + r1.height / 2
  r2.centerX = r2.x + r2.width / 2
  r2.centerY = r2.y + r2.height / 2

  //Find the half-widths and half-heights of each sprite
  r1.halfWidth = r1.width / 2
  r1.halfHeight = r1.height / 2
  r2.halfWidth = r2.width / 2
  r2.halfHeight = r2.height / 2

  //Calculate the distance vector between the sprites
  vx = r1.centerX - r2.centerX
  vy = r1.centerY - r2.centerY

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1.halfWidth + r2.halfWidth
  combinedHalfHeights = r1.halfHeight + r2.halfHeight

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {
    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {
      //There's definitely a collision happening
      hit = true
    } else {
      //There's no collision on the y axis
      hit = false
    }
  } else {
    //There's no collision on the x axis
    hit = false
  }

  //`hit` will be either `true` or `false`
  return hit
}

export const getRandom = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

export const contain = (sprite: any, container: any) => {
  let collision = undefined
  //Left
  if (sprite.x - sprite.halfWidth < container.x) {
    sprite.x = container.x + sprite.halfWidth
    collision = 'left'
  }

  //Right
  if (sprite.position.x + sprite.halfWidth * -1 > container.width) {
    sprite.x = container.width - sprite.halfWidth * -1
    collision = 'right'
  }

  return collision
}

const wordCountMap = (str: string) => {
  let words = str.split(' ')
  let wordCount = {}
  words.forEach((w) => {
    wordCount[w] = (wordCount[w] || 0) + 1
  })
  return wordCount
}

const addWordsToDictionary = (wordCountmap, dict) => {
  for (let key in wordCountmap) {
    dict[key] = true
  }
}

const wordMapToVector = (map, dict) => {
  let wordCountVector = []
  for (let term in dict) {
    wordCountVector.push(map[term] || 0)
  }
  return wordCountVector
}

const dotProduct = (vecA, vecB) => {
  let product = 0
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i]
  }
  return product
}

const magnitude = (vec) => {
  let sum = 0
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i]
  }
  return Math.sqrt(sum)
}

const cosineSimilarity = (vecA, vecB) => {
  return dotProduct(vecA, vecB) / (magnitude(vecA) * magnitude(vecB))
}

const textCosineSimilarity = (txtA: string, txtB: string) => {
  const wordCountA = wordCountMap(txtA)
  const wordCountB = wordCountMap(txtB)
  let dict = {}
  addWordsToDictionary(wordCountA, dict)
  addWordsToDictionary(wordCountB, dict)
  const vectorA = wordMapToVector(wordCountA, dict)
  const vectorB = wordMapToVector(wordCountB, dict)
  return cosineSimilarity(vectorA, vectorB)
}

const getSimilarityScore = (val: number) => {
  return val * 100
}

const formatText = (text: string) => {
  return text.toLowerCase().split('').join(' ')
}

export const getCosineSimilarityScore = (text1: string, text2: string) => {
  const similarityScore = getSimilarityScore(textCosineSimilarity(formatText(text1), formatText(text2)))
  return similarityScore
}

export const checkCosineSimilarity = (text1: string, text2: string, THRESHOLD: number) => {
  const similarityScore = getSimilarityScore(textCosineSimilarity(formatText(text1), formatText(text2)))
  return similarityScore > THRESHOLD
}

export const randomAxieId = async () => {
  const randomId = Math.floor(Math.random() * 1000000)
  const genes = await getAxieGenes(randomId.toString())

  const mixer = new AxieMixer(genes).getAssets()
  if (!mixer) randomAxieId()
  return randomId.toString()
}

export const randomInRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}
