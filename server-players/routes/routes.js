import express from 'express'
import Players from '../model/Players.js'

const router = express.Router()

//Post Method
router.post('/player', async (req, res) => {
  const player = await Players.findOne({ address: req.body.address })
  if (!player) {
    const newPlayer = new Players({
      address: req.body.address,
      axies: req.body.axies,
    })
    try {
      const dataToSave = newPlayer.save()
      res.status(200).json(dataToSave)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  }
})

//Get by ID Method
router.get('/player/:address', async (req, res) => {
  const player = await Players.findOne({ address: req.params.address })
  if (player) return res.status(200).json(player)
  if (!player) return res.status(500).send({ message: 'Error' })
})

export default router
