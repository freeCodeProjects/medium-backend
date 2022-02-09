require('dotenv').config()
import express from 'express'
import { logger } from './utils/logger'
import router from './routes/index'
import { connectToDb } from './utils/connectToDb'

const port = process.env.PORT || 3001
const app = express()
app.use(express.json())
app.use(router)

app.listen(port, () => {
	logger.info('Server is up on port ' + port)
	connectToDb()
})
