import mongoose from 'mongoose'

const { Schema, model } = mongoose

const playerSchema = new Schema({
  address: String,
  axies: [String],
})

export default model('Players', playerSchema)
