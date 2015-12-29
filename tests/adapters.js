describe('Test adapters', function() {
    var adapters = require('./../lib/adapters');
    var testLib = require('./_library');
    describe('Console adapter', function () {
        it('Write sample data', function (done) {
            var adapter = new adapters.AdapterConsole();
            var consoleLogRef = console.log;
            var consoleLastMessage;
            console.log = function(message){
                consoleLastMessage = message;
            };
            adapter.save(testLib.getExampleData(), function(err){
                console.log = consoleLogRef;
                if (err) {
                    done(err);
                } else if (/^system\|identity\|([^\|]+)\|([^\|]+)\|([^\|]+)$/.test(consoleLastMessage)) {
                    done();
                } else {
                    done(new Error('String send to output not valid'));
                }
            });
        });
        it("Write sample data, recive error", function(done){
            var adapter = new adapters.AdapterConsole();
            var consoleLogRef = console.log;
            console.log = null;
            adapter.save({
                system: 'system',
                identity: 'identity',
                createDate: new Date(),
                oldItem: '{"v":"oldval"}',
                newItem: '{"v":"newval"}'
            }, function(err){
                console.log = consoleLogRef;
                if (err && (err.toString().indexOf('object is not a function') > 0)) {
                    done();
                } else if (err) {
                    done(err);
                } else {
                    done(new Error('Expect TypeError: object is not a function'));
                }
            });
        });
    });
    describe('MysqlPool adapter', function () {
        it('Write sample data', function (done) {
            var adapter = new adapters.AdapterPoolMysql({
                pool: new testLib.getPoolMock(),
                tableName: 'table',
                columnSystem: 'system',
                columnIdentity: 'identity',
                columnCreateDate: 'create_date',
                columnOldItem: 'old_item',
                columnNewItem: 'new_item',
            });
            adapter.save(testLib.getExampleData(), function(err){
                done((err) ? err : null);
            });
        });
        it("Write sample data, but invalid date object", function(done){
            var adapter = new adapters.AdapterPoolMysql({
                pool: new testLib.getPoolMock(),
                tableName: 'table',
                columnSystem: 'system',
                columnIdentity: 'identity',
                columnCreateDate: 'create_date',
                columnOldItem: 'old_item',
                columnNewItem: 'new_item',
            });
            var cloneData = testLib.getExampleData();
            cloneData['createDate'] = 'invalid';
            adapter.save(cloneData, function(err){
                if (err && (err.toString().indexOf('Invalid parameter') > 0)) {
                    done();
                } else if (err) {
                    done(err);
                } else {
                    done(new Error('Expect error: Invalid parameter'))
                }
            });
        });
        it("Try create adapter without required options", function(done){
            try {
                var adapter = new adapters.AdapterPoolMysql();
            } catch (err) {
                if (err.toString().indexOf('Required') > 0) {
                    done();
                } else if (err) {
                    done(err);
                } else {
                    done(new Error('Expect errror: Required'));
                }
            }
        });
    });
});
