import Router from 'express'
import queueRoute from './track/queue'
import trackRoute from './track'

const router = Router()

router.use('/track', trackRoute);
router.use('/track/queue', queueRoute);

export default router;