import express from 'express'
import user from './user.route'
import blog from './blog.route'
import clap from './clap.route'

const router = express.Router()

router.get('/api/healthcheck', (_, res) => {
	res.status(200).send('Server is running!')
})

router.use(user)
router.use(blog)
router.use(clap)
export default router
