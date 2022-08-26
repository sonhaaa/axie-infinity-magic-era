import dynamic from 'next/dynamic'

export const AxieTeams = dynamic(() => import('./AxieTeams').then((module) => module.AxieTeams), {
  ssr: false,
  loading: () => <></>,
})
