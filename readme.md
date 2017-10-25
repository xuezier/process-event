# ProcessEvent
[![NPM version][npm-image]][npm-url]
为事件流程添加分支结构和回溯功能
## Example
```javascript
ProcessEvent(function(){
  console.log('start');

  this.emit('1', 1);
}).register('1', function(d){
  console.log(1, d);

  if(d == 1)
    this.emit('2', 2);
  else
    throw new Error('end');
}).register('2', function(d){
  console.log(2, d);

  this.emit('1', 3);
}).catch(function(error){
  console.log(error);
});

// out put
// start
// 1, 1
// 2, 2
// 1, 3
// Error: end
```

## 对比 *Promise* 链式结构
```javascript
new Promise(function(resolve){
  console.log('start‘);

  resolve(1);
}).then(function(d){
  console.log(1, d);

  resolve(2)
}).then(function(d){
  console.log(2, d);

  resolve(3);
}).then(function(d){
  console.log(1, d);

  throw new Error('end');
}).catch(function(error){
  console.log(error);
});

// out put
// start
// 1, 1
// 2, 2
// 1, 3
// Error: end
```
*Promise* 的链式结构类似一条主线从头走到尾，事件没有分支处理，走过的流程无法回溯，只能再之后重新进行。

![processevent](http://ofn8y0v16.bkt.clouddn.com/processevent.jpg?imageView2/2/w/800/q/99)

[npm-image]: https://img.shields.io/npm/v/process-event.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/process-event