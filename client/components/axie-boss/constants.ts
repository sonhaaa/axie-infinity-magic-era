import animations from '../../node_modules/@axieinfinity/mixer/dist/data/axie-2d-v3-stuff-animations.json'
import key from './key.json'
import { Color } from './types'

export const animationList: string[] = animations.items.header
  .map((obj) => obj.name)
  .filter((obj) => obj.substring(0, 10) !== 'action/mix')

export const colorsArray: Color[] = key.items.colors
export const summerColors: Color[] = [
  {
    key: 'aquatic-summer',
    primary1: 'Aquatic',
    primary2: '',
  },
  {
    key: 'bird-summer',
    primary1: 'Bird',
    primary2: '',
  },
  {
    key: 'dawn-summer',
    primary1: 'Dawn',
    primary2: '',
  },
  {
    key: 'mech-summer',
    primary1: 'Mech',
    primary2: '',
  },
  {
    key: 'reptile-summer',
    primary1: 'Reptile',
    primary2: '',
  },
  {
    key: 'beast-summer',
    primary1: 'Beast',
    primary2: '',
  },
  {
    key: 'bug-summer',
    primary1: 'Bug',
    primary2: '',
  },
  {
    key: 'dusk-summer',
    primary1: 'Dusk',
    primary2: '',
  },
  {
    key: 'plant-summer',
    primary1: 'Plant',
    primary2: '',
  },
]

export const SAMPLE_PLAYER_DATA = [
  {
    address: 'add287Gjhsi2176',
    axies: [
      {
        id: '1000',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '1020',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '304567',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
  {
    address: 'addLkasqrn124Fa',
    axies: [
      {
        id: '1300',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '1061',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '3567',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
  {
    address: 'addpO123se1jsJa',
    axies: [
      {
        id: '9274',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '82047',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '96382',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
  {
    address: 'addkLqo37Jh892p',
    axies: [
      {
        id: '75982',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '20154',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '34625',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
  {
    address: 'add0ownxhFs62jA',
    axies: [
      {
        id: '6425',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '93480',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '24567',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
  {
    address: 'add0FjaMsl1236A',
    axies: [
      {
        id: '29837',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '62049',
        spells: ['BANANA', 'MISKI'],
      },
      {
        id: '827309',
        spells: ['BANANA', 'MISKI'],
      },
    ],
  },
]
