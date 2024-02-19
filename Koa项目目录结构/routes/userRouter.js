const Router = require('koa-router')
const UserController = require('../controller/userController')


const router = new Router({prefix:'/user'});
const userController = new UserController();


router.get('/add',userController.add)

router.get('/update',userController.update)

router.get('/remove',userController.remove)



module.exports = router;