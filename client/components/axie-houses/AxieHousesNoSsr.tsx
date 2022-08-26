import dynamic from 'next/dynamic'

export const AxieHouses = dynamic(() => import('./AxieHouses').then((module) => module.AxieHouses), {
  ssr: false,
  loading: () => <></>,
})
