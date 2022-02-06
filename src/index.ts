require('dotenv').config()
import express, { Request, Response } from 'express'

import { logger } from './utils/logger'

const app = express()
const port = process.env.PORT || 3001

app.get('/healthcheck', (req: Request, res: Response) => {
	res.status(200).send('Server is running!')
})

app.listen(port, () => {
	logger.info('Server is up on port ' + port)
})
