import Koa from 'koa'
import mongoose from "mongoose";

const app = new Koa();
import historyRouter from './history-routes'

mongoose.connect('mongodb://127.0.0.1:27017/bilibili', function (err) {
    if (err) {
        console.log('连接数据库失败');
    } else {
        console.log('连接数据库成功');
    }
})


app
    .use(historyRouter.routes())
    .use(historyRouter.allowedMethods());

app.use(async ctx => {
    ctx.body = 'Hello World';
});

app.listen(3000);
