import express from 'express'
import user from './user.route'

const router = express.Router()

router.get('/api/healthcheck', (_, res) => {
	res.status(200).send('Server is running!')
})

router.use(user)
export default router
