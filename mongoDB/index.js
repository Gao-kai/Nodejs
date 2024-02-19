/*****
 * 
 * ## 关系型数据库和非关系型数据库
 * 关系型数据库 代表为MySQL sqlServer oracle 用一种关系模型来组织数据的数据库 特点是查询方便 还是不容易扩展 也就是key-value键值对
 * 非关系型数据库 代表为mongoDB NoSql redis 不同于传统的关系型数据库 存储的是对象 容易拓展但是不容易查询
 * 
 * ## mongo特点
 * 1. 使用简单 就像在前端操作对象一样
 * 2. 文档类型
 * 3. 存储的值就是对象类型 BSON也可以理解为JSON 可存储复杂类型的数据结构
 * 4. 性能高 减少了SQL查询语句的分析过程 不需要通过SQL层来进行解析
 * 5. 数据之间都是独立的 没有耦合 分布式存储 容易拓展
 * 6. 不适合做复杂的查询 查询速度没有关系型数据库快
 * 
 * ## mongodb安装
 * 1. 官网下载 安装 并勾选service 每次开启mongo服务端会自己启动
 * 2. 安装完成之后打开系统环境变量 会发现path中多了一条C:\Program Files\MongoDB\Server\4.4\bin  也就是为什么我们再终端执行mongo可以执行
 * 3. 终端win+r执行后输入service.msc 打开服务列表 里面有一条服务名称为MongoDB的服务 启动类型为自动启动 可执行文件的路径：
 * C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --config "C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg" --service
 * 说明mogoed服务启动的配置文件在mongod.cfg文件中
 * 表示mongo服务在后台是默认启动的 服务运行在：127.0.0.1的27017端口上 并且声明了数据存储的路径和日志路径
 * 
 * 4. 配置文件修改 需要重新启动window service服务
 * 
 * ## 关系和命令
 * MySQL 库 表 行和列
 * mongo 库 集合 BSON 对象
 */
