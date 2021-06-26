const Koa = require('koa');
const KoaRouter = require('koa-router');
const KoaStaticCache = require('koa-static-cache');
const tpl = require('./middlewares/tpl');
const mysql = require('mysql2/promise');

// 在node中使用rewuire加载一个json文件数据时，node会自动转成对象
const datas = require('./data/data.json');


// 函数自执行
~async function () {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Aa123456',
    database: 'news'
  })
  // for (let i = 0; i < datas.length; i++) {
  //   const item = datas[i];
  //   await connection.execute('insert into `datas` (`title`,`imgUrl`,`from`,`newTime`) values (?,?,?,?)', [
  //     item.title,
  //     item.imgUrl,
  //     item.from,
  //     item.newTime,
  //   ]);
  // }
  const [rows, fields] = await connection.execute('SELECT *  FROM `datas`', []);


  console.log("rows", rows);
}()



// 创建server对象
const server = new Koa();
// 创建静态文件代理服务
server.use(KoaStaticCache('./public', {
  prefix: '/public',
  gzip: true,
  dynamic: true
}))

// 除了以./public开头的url，创建动态资源（使用router来为动态资源做映射）
// 创建一个router对象
const router = new KoaRouter();

server.use(tpl('views'));

// 用router来注册各种需要用到的url资源处理函数
// router.get('/',ctx=>{
//   ctx.body = '{"name":"koa"}';
// })

// 首页
router.get('/', ctx => {
  ctx.render('index.html', {
    datas
  })
})

// 详情页
router.get('/detail/:id(\\d+)', ctx => {
  let id = Number(ctx.params.id);
  let data = datas.find(d => d.id == id);
  if (!data) {
    return ctx.render('404');
  }
  ctx.render('detail.html', {
    data
  })
})

// 练习
// router.get('/getData',ctx=>{
//   ctx.set('Content-Type','application/json;charset=utf-8');
//   ctx.body = '{"name":"koa"}';
// })

// 把router对象的routes中间件注册到koa中
server.use(router.routes());


// 启动服务，监听指定端口
server.listen(3000, () => {
  console.log('服务器启动成功，http://localhost:3000');
});