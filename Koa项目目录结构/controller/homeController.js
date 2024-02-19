class HomeController {
  constructor() {}

  async add(ctx, next) {
    await ctx.render('index.html',{name:"lilei",age:18})
   }

  async remove(ctx, next) {
    ctx.body = "首页移除";
  }

  async update(ctx, next) {
    ctx.body = "首页更新";
  }
}

module.exports = HomeController;
