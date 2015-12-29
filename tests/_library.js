var exampleData = {
    system: 'system',
    identity: 'identity',
    oldItem: '{"v":"oldval"}',
    newItem: '{"v":"newval"}'
};

var getExampleData = function(){
    var cloneData = JSON.parse(JSON.stringify(exampleData));
    cloneData.createDate = new Date();
    return cloneData;
};

var getAdapterMysqlPoolOptions = function(pool){
    return {
        pool: pool,
        tableName: 'table',
        columnSystem: 'system',
        columnIdentity: 'identity',
        columnCreateDate: 'create_date',
        columnOldItem: 'old_item',
        columnNewItem: 'new_item',
    }; 
};

var poolConnectionMock = function(pool){
    this.pool = pool;
    var self = this;
    this.release = function(){
        self.pool.allowGetConnection = true;
    };
    this.query = function(sql, params, cb){
        var expectSql = 'INSERT INTO ?? (??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?)';
        var exampleData = getExampleData();
        var expectParams = [
            'table','system','identity','create_date','old_item','new_item',
            exampleData['system'], exampleData['identity'], '__DATE__', exampleData['oldItem'], exampleData['newItem']
        ];
        if (sql !== expectSql) {
            cb(new Error('Bad sql, expect: ' + expectSql + ', recive: ' + sql));
        } else {
            for (var i=0;i < expectParams.length;i++) {
                var errObj = new Error('Invalid parameter: ' + i + ', expect: ' + expectParams[i] + ', recive: ' + params[i]);
                if (expectParams[i] === '__DATE__') {
                    if (!(params[i] instanceof Date)) {
                        return cb(errObj);
                    }
                } else if (expectParams[i] !== params[i]) {
                    return cb(errObj);
                }
            }
            cb(null);
        } 
    };
};

var poolMock = function(){
    this.allowGetConnection = true;
    var self = this;
    this.errorGetConnection = 0;
    this.getConnection = function(cb){
        if (self.errorGetConnection > 0) {
            self.errorGetConnection--;
            return cb(new Error('Error get connection [mock]'));
        }
        if (self.allowGetConnection) {
            self.allowGetConnection = false;
            var conn = new poolConnectionMock(self);
            cb(null, conn);
        } else {
            cb(new Error('Connection not release'));
        }
    };
};
poolMock.prototype.setErrorGetConnectionTry = function(num) {
    this.errorGetConnection = num;
};
poolMock.prototype.clearErrorGetConnectionTry = function() {
    this.errorGetConnection = 0;
};

var poolMockInstance = new poolMock();

exports.getAdapterMysqlPoolOptions = getAdapterMysqlPoolOptions;
exports.getExampleData = getExampleData;
exports.getPoolMock = function(){
    return poolMockInstance;
};