/* tree-shaking的原理就是这样一个作用域链条  */
class Scope {
  constructor(options = {}) {
    this.scopeName = options.scopeName;
    this.parent = options.parent;
    this.identifiers = options.params || [];
    this.isBlockScope = Boolean(options.block);
  }

  /**
   *
   * @param {*} identifier
   * @param {*} isBlockDeclaration 是否为块级声明 let const
   */
  add(identifier, isBlockDeclaration) {
    /**
     * 1. 不是块级声明
     * 2. 并且当前为块级作用域
     *
     * 那么这是一个var或者function的函数声明 此时向父级提升
     */
    if (!isBlockDeclaration && this.isBlockScope) {
      this.parent.add(identifier, isBlockDeclaration);
    } else {
      this.identifiers.push(identifier);
    }
  }

  findDefiningScope(identifier) {
    // 首先在当前自己的作用域中查询 如果查询到就返回当前作用域实例
    if (this.identifiers.includes(identifier)) {
      return this;
    }
    // 如果查不到 再去当前作用域的父级作用域查询 沿着parent这个链表的next变量向上查询
    if (this.parent) {
      return this.parent.findDefiningScope(identifier);
    }
    // 如果父级也查不到 那么返回null
    return null;
  }
}

module.exports = Scope;
