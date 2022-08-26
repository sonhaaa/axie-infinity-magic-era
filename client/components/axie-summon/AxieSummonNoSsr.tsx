import dynamic from 'next/dynamic'

export const AxieSummon = dynamic(() => import('./AxieSummon').then((module) => module.AxieSummon), {
  ssr: false,
  loading: () => <></>,
})
