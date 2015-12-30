var adapters = require('./adapters');

var LoggerItem = function(logger) {
    this.logger = logger;
    this.identity = null;
    this.objectType = null;
    this.objectIdentity = null;
    this.oldItem = null;
    this.newItem = null;
};

LoggerItem.prototype.setIdentity = function(identity){
    this.identity = this._parseToString(identity);
    return this;
};

LoggerItem.prototype.setObjectType = function(objectType) {
    this.objectType = this._parseToString(objectType);
    return this;
}

LoggerItem.prototype.setObjectIdentity = function(objectIdentity) {
    this.objectIdentity = this._parseToString(objectIdentity);
    return this;
}

LoggerItem.prototype.setOldItem = function(oldItem){
    this.oldItem = this._parseDataToString(oldItem);
    return this;
};

LoggerItem.prototype.setNewItem = function(newItem){
    this.newItem = this._parseDataToString(newItem);
    return this;
};

LoggerItem.prototype.save = function(cb){
    this.logger._saveObject({
        identity: this.identity,
        objectType: this.objectType,
        objectIdentity: this.objectIdentity,
        oldItem: this.oldItem,
        newItem: this.newItem
    }, cb);
};

LoggerItem.prototype._parseToString = function(obj) {
    try {
        return obj.toString();
    } catch (err) {
        return null;
    }
}

LoggerItem.prototype._parseDataToString = function(obj){
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

Logger.prototype.prepareItem = function(identity, objectType, objectIdentity, oldItem, newItem) {
    var item = new LoggerItem(this);
    if (typeof identity !== 'undefined') {
        item.setIdentity(identity);
        if (typeof objectType !== 'undefined') {
            item.setObjectType(objectType)
            if (typeof objectIdentity !== 'undefined') {
                item.setObjectIdentity(objectIdentity)
            }
            if (typeof oldItem !== 'undefined') {
                item.setOldItem(oldItem)
                if (typeof newItem !== 'undefined') {
                    item.setNewItem(newItem);
                }
            }
        }
    }
    return item;
};

Logger.prototype.prepareItemSave = function(identity, objectType, objectIdentity, oldItem, newItem, cb) {
    this.prepareItem(identity, objectType, objectIdentity, oldItem, newItem).save(cb);
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