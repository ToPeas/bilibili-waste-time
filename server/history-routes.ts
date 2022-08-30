import Router from '@koa/router'
import {fetchHistory, filterHistory, startRegularTask, stopRegularTask} from './history'

const router = new Router({
    prefix: '/history'
})

router.get('/start-task', async (ctx, next) => {
    const res = await startRegularTask()
    ctx.body = res
})

router.get('/stop-task', async (ctx, next) => {
    const res = await stopRegularTask()
    ctx.body = res
})

router.get('/start', async (ctx, next) => {
    fetchHistory()
    ctx.body = '开始执行拉取数据'
})

router.get('/filter', async (ctx, next) => {
    let first_at = ctx.request.query?.first_at
    if (!first_at) {
        ctx.body = {
            status: -1,
            message: '参数不对'
        }
    }
    const res = await filterHistory(first_at)
    ctx.body = {
        status: 0,
        data: res
    }
})

export default router
