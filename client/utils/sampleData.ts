export const SPELL_MAPPING = {
  bug: {
    type: 'hit',
    eyes: {
      spell: 'immobulus',
    },
    mouth: {
      spell: 'expelliarmus',
    },
    horn: {
      spell: 'alarte ascendare',
    },
  },
  beast: {
    type: 'hit',
    eyes: {
      spell: 'rictusempra',
    },
    mouth: {
      spell: 'serpensortia',
    },
    horn: {
      spell: 'stupefy',
    },
  },
  bird: {
    type: 'heal',
    eyes: {
      spell: 'lumos maxima',
    },
    mouth: {
      spell: 'reducto',
    },
    horn: {
      spell: 'levicorpus',
    },
  },
  plant: {
    type: 'heal',
    eyes: {
      spell: 'wingardium leviosa',
    },
    mouth: {
      spell: 'oculus reparo',
    },
    horn: {
      spell: 'episkey',
    },
  },
  aquatic: {
    type: 'shield',
    eyes: {
      spell: 'aresto momentum',
    },
    mouth: {
      spell: 'ascendio',
    },
    horn: {
      spell: 'salvio hexia',
    },
  },
  reptile: {
    type: 'shield',
    eyes: {
      spell: 'expecto patronum',
    },
    mouth: {
      spell: 'periculum',
    },
    horn: {
      spell: 'protego totalum',
    },
  },
}

export const AXIE_ID = [
  '354656',
  '354621',
  '10207679',
  '6095422',
  '9404096',
  '9024006',
  '8844539',
  '8677874',
  '10204136',
  '8435069',
  '10556926',
  '10654628',
  '11413038',
  '11238070',
  '11375329',
  '7074030',
]

export const BEST_TEAMS = [
  {
    name: 'beast-bird-aquatic',
    classes: ['beast', 'bird', 'aquatic'],
    ultimateSpell: 'avarda kedarva',
  },
  {
    name: 'beast-plant-reptile',
    classes: ['beast', 'plant', 'reptile'],
    ultimateSpell: 'alohomora',
  },
  {
    name: 'bug-plant-aquatic',
    classes: ['bug', 'plant', 'aquatic'],
    ultimateSpell: 'bombardo',
  },
  {
    name: 'bug-bird-reptile',
    classes: ['bug', 'bird', 'reptile'],
    ultimateSpell: 'crucio',
  },
]
