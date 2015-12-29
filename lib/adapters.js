var AdapterConsole = function(options) {
    this.separator = ((typeof options === 'object') && options && (typeof options.separator))
        ? options.separator
        : '|';
};

AdapterConsole.prototype.save = function(data, cb) {
    var lists = [
        data.system,
        data.identity,
        data.createDate,
        data.oldItem,
        data.newItem
    ];
    try {
        console.log(lists.join('|'));
    } catch (err) {
        return cb(err);
    }
    cb(null);
};

var AdapterPoolMysql = function(options) {
    if ((typeof options === 'object') && options && (typeof options.pool === 'object')) {
        this.pool = options.pool;
    } else {
        throw new Error('Required mysql pool connection properties');
    }
    
    this.maxTries = ((typeof options.maxTries === 'number') && (options.maxTries > 1)) ? Math.round(options.maxTries) : 1;
    
    var requiredOptions = ['tableName', 'columnSystem', 'columnIdentity', 'columnCreateDate', 'columnOldItem', 'columnNewItem'];
    for (var i=0;i < requiredOptions.length;i++) {
        if (typeof options[requiredOptions[i]] !== 'string') {
            throw new Error('Required property ' + requiredOptions[i] + ' string');
        }
        this[requiredOptions[i]] = options[requiredOptions[i]];
    }
};

AdapterPoolMysql.prototype.save = function(data, cb) {
    var transporter = {
        sql: 'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?)',
        params: [
            this.tableName,
            this.columnSystem, this.columnIdentity, this.columnCreateDate, this.columnOldItem, this.columnNewItem,
            data.system, data.identity, data.createDate, data.oldItem, data.newItem
        ],
        counter: 0,
        error: null
    };
    this._saveByTryCounter(transporter, cb);
};

AdapterPoolMysql.prototype._saveByTryCounter = function(transporter, cb) {
    if (transporter.counter < this.maxTries) {
        var self = this;
        this.pool.getConnection(function(err, connection){
            if (err) {
                transporter.counter++;
                transporter.error = err;
                return self._saveByTryCounter(transporter, cb);
            }
            connection.query(
                transporter.sql,
                transporter.params,
                function(err) {
                    connection.release();
                    if (err) {
                        transporter.counter++;
                        transporter.error = err;
                        self._saveByTryCounter(transporter, cb);
                    } else {
                        cb(null);
                    }
                }
            );
        });
    } else if (transporter.counter === this.maxTries) {
        cb((transporter.error) ? transporter.error : new Error('Log history excedeed maximum tries save data'));
    }
};

exports.AdapterConsole = AdapterConsole;
exports.AdapterPoolMysql = AdapterPoolMysql;