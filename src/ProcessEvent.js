'use strict';

function ProcessEvent(fun) {
  if (!(this instanceof ProcessEvent)) return new ProcessEvent(fun);

  this._eventMap = new Map();
  this._emited = new Map();
  this._eventIdGrow = 0;
  this._catch = undefined;

  var self = this;
  if (fun instanceof Function)
    setTimeout(function() {
      fun.call(self);
    });
}

/**
 * register an event
 * @param {String|Number} eventName
 * @param {Function} event
 * @return {ProcessEvent}
 */
ProcessEvent.prototype.register = function(eventName, event) {
  this._eventMap.set(eventName, event);

  return this;
};

/**
 * emit an event
 * @param {String|Number} eventName
 * @param data
 */
ProcessEvent.prototype.emit = function(eventName, data) {
  var eventId = this._eventIdGrow++;

  return this._run(eventId, eventName, data);
};

ProcessEvent.prototype._emit = ProcessEvent.prototype.emit;

/**
 * run event
 * @param {Number} eventId
 * @param {String|Number} eventName
 * @param data
 */
ProcessEvent.prototype._run = function(eventId, eventName, data) {
  if (this._emited.has(eventId)) {
    var _emitedName = this._emited.get(eventId);

    if (_emitedName === eventName) return;
    else return this._emit(eventName, data);
  }

  var event = this._eventMap.get(eventName);

  if (event instanceof Function) {
    try {
      event.call(this, data);
      this._emited.set(eventId, eventName);
    } catch (e) {
      this._runCatch(eventName, e);
    }
  } else {
    this._runCatch(eventName, new Error(eventName + ' is not a registered event'));
  }
  return this;
};

/**
 * run catch
 * @param {String|Number} eventName
 * @param {Error} error
 */
ProcessEvent.prototype._runCatch = function(eventName, error) {
  if (!(error instanceof Error)) return;
  if (this._catch instanceof Function) {
    console.error('event ' + eventName + ' error');
    this._catch(error);
  } else {
    console.warn('uncatch error: ' + eventName);
    console.warn(error.stack);
  }
};

/**
 * add catch event
 * @param {Function} fun
 */
ProcessEvent.prototype.catch = function(fun) {
  this._catch = fun.bind(this);
};

module.exports = ProcessEvent;
