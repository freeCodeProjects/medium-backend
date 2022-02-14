import express from 'express'
import user from './user.route'
import blog from './blog.route'

const router = express.Router()

router.get('/api/healthcheck', (_, res) => {
	res.status(200).send('Server is running!')
})

router.use(user)
router.use(blog)
export default router
