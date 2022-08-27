import dynamic from 'next/dynamic'

export const AxieBoss = dynamic(() => import('./AxieBoss').then((module) => module.AxieBoss), {
  ssr: false,
  loading: () => <></>,
})
