### 1. Content-Type 内容格式字段
HTTP/1.0规定了请求和响应的头信息必须是ASCII编码格式是不可以被压缩的，但是头部后面的正文可以是任何格式的数据，所以客户端需要告诉服务器自己可以解析哪些格式的数据，而服务器反过来也可以告诉客户端自己响应的数据是何种格式。

常见的Content-Type的值如下：
```
text/plain
text/html
text/css

image/jpeg
image/png
image/svg+xml

audio/mp4
video/mp4

application/javascript
application/pdf
application/zip
application/atom+xml

```

MIME type还可以在尾部使用分号，添加参数：
```
Content-Type:text/html;charset:utf-8
```

客户端在请求的时候，可以使用Accept请求头字段告诉服务器自己可接收的数据格式：
```
Accept:*/*;  代表可以接受任意类型的数据格式
```

关于Content-Type还可以用在HTML文本中的meta标签中，用来指定HTTP传输的标题信息：
```html
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"  />
```

### 2. Content-Encoding 内容编码方式字段
由于传输的正文可以是任何格式的数据，所以在有的情况下可以将正文数据进行压缩后进行传输，Content-Encoding字段就是在HTTP中用来对采用那种编码格式传输正文进行协定的一对头部字段。

内容编码格式可选值有：
```
gzip
compress
deflate
```

客户端发起请求的时候通过Accept-Encoding告诉服务端自己支持的内容编码格式列表,并用逗号隔开：
```
Accept-Encoding:gzip,deflate;
```
服务端在接受请求之后，从中选出一种内容编码格式Content-Encoding对响应的信息进行编码：
```
Content-Encoding:gzip;
```

内容编码格式gzip 和deflate的区别
gzip 是指 GZIP 格式，deflate 是指 ZLIB 格式。HTTP/1.1 的作者或许应该将后者称之为 zlib，从而避免与原始的 DEFLATE 数据格式产生混淆。虽然 HTTP/1.1 RFC 2016 正确指出，Content-Encoding 中的 deflate 就是 RFC 1950 描述的 ZLIB，但仍然有报告显示部分服务器及浏览器错误地生成或期望收到原始的 DEFLATE 格式，特别是微软。所以虽然使用 ZLIB 更为高效（实际上这正是 ZLIB 的设计目标），但使用 GZIP 格式可能更为可靠，这一切都是因为 HTTP/1.1 的作者不幸地选择了错误的命名。
结论：在 HTTP/1.1 的 Content-Encoding 中，请使用 gzip。
