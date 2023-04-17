require('dotenv').config()
import express from 'express'
import { logger } from './utils/logger'
import router from './routes/index'
import { connectToDb } from './utils/connectToDb'
import cors from 'cors'
import helmet from 'helmet'
import cookieparser from 'cookie-parser'

const port = process.env.PORT || 3001
const app = express()
app.use(
	cors({
		origin: '*',
		credentials: true
	})
)

app.use(helmet())
app.use(cookieparser())
app.use(express.json())
app.use(router)

app.listen(port, () => {
	logger.info('Server is up on port ' + port)
	connectToDb()
})
