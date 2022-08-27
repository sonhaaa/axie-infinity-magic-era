import dynamic from 'next/dynamic'

export const AxieSpells = dynamic(() => import('./AxieSpells').then((module) => module.AxieSpells), {
  ssr: false,
  loading: () => <></>,
})
