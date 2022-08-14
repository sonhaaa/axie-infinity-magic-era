import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import 'dotenv/config'
import routes from './routes/routes.js'

const mongoString = process.env.DATABASE_URL

mongoose.connect(mongoString)
const database = mongoose.connection

// console.log(database)

database.on('error', (error) => {
  console.log(error)
})

database.once('connected', () => {
  console.log('Database Connected')
})

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', routes)

const port = Number(process.env.port) || 3501

app.listen(port, () => {
  console.log(`Server Started at ${port}`)
})
