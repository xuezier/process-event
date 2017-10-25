'use strict';

var ProcessEvent = require('../index');

ProcessEvent(function() {
  console.log(123);
  this.emit('1', 1);
}).register('1', function(r) {
  console.log(1, r);
  if (r == 1)
    this.emit('2', 2);
  else throw new Error('heiheihei');
}).register('2', function(r) {
  console.log(2, r);
  this.emit('1', 3);
}).catch(function(e) {
  console.error(e);
});
