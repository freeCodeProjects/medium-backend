import express from 'express'
import user from './user.route'
import blog from './blog.route'
import clap from './clap.route'
import follower from './follower.route'
import comment from './comment.route'
import notification from './notification.route'

const router = express.Router()

router.get('/api/healthcheck', (_, res) => {
	return res.status(200).send('Server is running!')
})

router.use(user)
router.use(blog)
router.use(clap)
router.use(follower)
router.use(comment)
router.use(notification)

export default router
