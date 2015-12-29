var adapters = require('./adapters');

var LoggerItem = function(logger) {
    this.logger = logger;
    this.identity = null;
    this.oldItem = null;
    this.newItem = null;
};

LoggerItem.prototype.setIdentity = function(identity){
    try {
        this.identity = identity.toString();
    } catch (err) {
        this.identity = null;
    }
    return this;
};

LoggerItem.prototype.setOldItem = function(oldItem){
    this.oldItem = this._parseToString(oldItem);
    return this;
};

LoggerItem.prototype.setNewItem = function(newItem){
    this.newItem = this._parseToString(newItem);
    return this;
};

LoggerItem.prototype.save = function(cb){
    this.logger._saveObject({
        identity: this.identity,
        oldItem: this.oldItem,
        newItem: this.newItem
    }, cb);
};

LoggerItem.prototype._parseToString = function(obj){
    if (obj === null) {
        return null;
    }
    if (typeof obj === 'undefined') {
        return '{UNDEFINED}'
    }
    if (typeof obj === 'string') {
        return obj;
    }
    return JSON.stringify(obj);
};

var Logger = function(adapter, options) {
    if (typeof options.system !== 'string') {
        throw new Error('Logger required system property in options');
    }
    if (typeof options.errorHandler === 'function') {
        this.errorHandler = options.errorHandler;
    }
    this.system = options.system;
    this.adapter = adapter;
};

Logger.prototype.prepareItem = function(identity, oldItem, newItem) {
    var item = new LoggerItem(this);
    if (typeof identity !== 'undefined') {
        item.setIdentity(identity);
        if (typeof oldItem !== 'undefined') {
            item.setOldItem(oldItem)
            if (typeof newItem !== 'undefined') {
                item.setNewItem(newItem);
            }
        }
    }
    return item;
};

Logger.prototype.prepareItemSave = function(identity, oldItem, newItem, cb) {
    this.prepareItem(identity, oldItem, newItem).save(cb);
};

Logger.prototype._saveObject = function(data, cb) {
    data.system = this.system;
    data.createDate = new Date();
    if (typeof cb === 'function') {
        this.adapter.save(data, cb);
    } else {
        var self = this;
        this.adapter.save(data, function(err){
            if (err) {
                if (self.errorHandler) {
                    self.errorHandler(data, err);
                } else {
                    try {
                        console.error('[LogHistoryError]', err, 'Error save data', JSON.stringify(data));
                    } catch (err) {
                        
                    }
                }
            }
        });
    }
};

exports.Logger = Logger;
exports.adapters = adapters;