class UserController {
    constructor() {}
  
    async add(ctx, next) {
      ctx.body = "用户新增";
    }
  
    async remove(ctx, next) {
      ctx.body = "用户移除";
    }
  
    async update(ctx, next) {
      ctx.body = "用户更新";
    }
  }
  
  module.exports = UserController;
  