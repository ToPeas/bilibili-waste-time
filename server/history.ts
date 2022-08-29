import axios from "axios";
import {RecordModel} from './model/record'
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import config from 'config'
import * as schedule from 'node-schedule'
import {promisify} from 'es6-promisify'

dayjs.extend(duration)

// 定时任务
let job = null


const ApiUrl = 'https://api.bilibili.com/x/web-interface/history/cursor'

/**
 * 获取历史记录的方法
 * @param lastViewEdAt
 */
export const fetchHistory = async (lastViewEdAt: number = 0) => {
    let last_viewed_at = lastViewEdAt
    const res = await axios.get(ApiUrl, {
        headers: {
            Cookie: config.cookie
        },
        params: {
            ps: 30,
            view_at: last_viewed_at,
        }
    })

    if (res?.data?.code === 0) {
        const list = res.data.data.list
        try {
            for (let item of list) {
                const one = await RecordModel.create(item)
                const findOne = await RecordModel.findOne({
                    view_at: one.view_at,
                    history: {
                        bvid: one.history.bvid,
                    }
                })
                if (!findOne) {
                    await one.save()
                } else {
                    // 如果有重复的数据就直接终止
                    return
                }
            }
        } catch (e) {
            return {
                status: -2,
                message: '发生内部错误'
            }
        }
        const last = list?.length || 0
        if (last) {
            await fetchHistory(list[last - 1].view_at)
        }
    }
}

/**
 * 根据时间范围筛选时间
 * @param first_at
 * @param last_at
 */
export const filterHistory = async (first_at: string, last_at ?: string) => {
    let offset = 6 * 60 * 60
    let first_at_time = dayjs(first_at).unix() + offset
    let last_at_time = first_at_time + 24 * 60 * 60
    if (last_at) {
        last_at_time = dayjs(last_at).unix() + offset
    }
    const res = await RecordModel.find({
        view_at: {
            $gte: first_at_time,
            $lte: last_at_time
        }
    })
    //
    let count = 0
    const result = res.forEach(item => {
        if (item.progress === -1) {
            count = count + item.duration
        } else {
            count = count + item.progress
        }
    })

    return {
        time: count,
        time_zh: dayjs.duration(count * 1000).format('HH:mm:ss'),
        first_at: dayjs(first_at_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
        last_at: dayjs(last_at_time * 1000).format('YYYY-MM-DD HH:mm:ss'),
        list: res
    }
}

/**
 * 开始定时任务
 */
export const startRegularTask = async () => {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, new schedule.Range(0, 6)];
    rule.hour = 6;
    rule.minute = 0;
    job = await schedule.scheduleJob(rule, function () {
        return Promise.resolve()
    })
    return {
        status: 0,
        data: null,
    }

}

/**
 * 结束定时任务
 */
export const stopRegularTask = async () => {
    if (job) {
        job.cancel()
        return {
            status: 0,
            data: null,
        }
    } else {
        return {
            status: -3,
            message: '没有定时任务',
        }
    }

}

