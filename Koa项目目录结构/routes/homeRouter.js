const Router = require('koa-router')
const HomeController = require('../controller/homeController')


const router = new Router({prefix:'/home'});
const homeController = new HomeController();


router.get('/add',homeController.add)

router.get('/update',homeController.update)

router.get('/remove',homeController.remove)


module.exports = router;