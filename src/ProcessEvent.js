'use strict';

function ProcessEvent(fun) {
  if (!(this instanceof ProcessEvent)) return new ProcessEvent(fun);

  this._eventMap = new Map();
  this._emited = new Map();
  this._eventIdGrow = 0;
  this._running = new Map();
  this._waiting = new Map();
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
ProcessEvent.prototype.emit = function(process, eventName, data) {
  var self = this;
  if (process instanceof ProcessEvent) {
    self = ProcessEvent;
  } else {
    data = eventName;
    eventName = process;
  }

  var eventId = self._eventIdGrow++;

  if (self._emited.has(eventId)) {
    var _emitedName = self._emited.get(eventId);

    if (_emitedName === eventName) return;
    else return self._emit(eventName, data);
  }

  if (self._running.has(eventName)) return self._pushWaiting(eventId, eventName, data);

  else return self._run(eventId, eventName, data);
};

ProcessEvent.prototype._pushWaiting = function(eventId, eventName, data) {
  var next = { eventId: eventId, data: data };

  if (this._waiting.has(eventName)) {
    var eventWaiting = this._waiting.get(eventName);
    eventWaiting.push(next);
    this._waiting.set(name, eventWaiting);
  } else {
    this._waiting.set(eventName, [next]);
  }

  return this;
};

ProcessEvent.prototype._emit = ProcessEvent.prototype.emit;

/**
 * lock event running
 * @param {String|Number} eventName
 */
ProcessEvent.prototype._lockRun = function(eventName) {
  if (this._eventMap.has(eventName))
    this._running.set(eventName, true);
};

/**
 * unlock after event finished running
 * @param {String|Number} eventName
 */
ProcessEvent.prototype._unlock = function(eventName) {
  var eventWaiting = this._waiting.get(eventName);

  if (this._running.has(eventName) && eventWaiting && eventWaiting.length) {
    var next = eventWaiting.shift();
    this._run(next.eventId, eventName, next.data);
  } else {
    this._running.delete(eventName);
  }
};

/**
 * run event
 * @param {Number} eventId
 * @param {String|Number} eventName
 * @param data
 */
ProcessEvent.prototype._run = function(eventId, eventName, data) {
  this._lockRun(eventName);

  var event = this._eventMap.get(eventName);

  if (event instanceof Function) {
    var self = this;
    setTimeout(function() {
      try {
        var next = event.call(self, data);
        self._emited.set(eventId, eventName);
        if (next instanceof Promise) {
          next.catch(function(nextCatchedError) {
            if (nextCatchedError)
              self._runCatch(eventName, nextCatchedError);
          });
        } else {
          self._unlock(eventName);
        }
      } catch (e) {
        self._runCatch(eventName, e);
      }
    });
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
  this._unlock(eventName);

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
  return this;
};

module.exports = ProcessEvent;
