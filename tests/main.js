describe('Test adapters', function() {
    var library = require('./../lib/main'); 
    var testLib = require('./_library');
    var createLogger = function(opts){
        var conf = testLib.getAdapterMysqlPoolOptions(testLib.getPoolMock());
        if (opts && opts.tries) {
            conf.maxTries = opts.tries;
        }
        var adapter = new library.adapters.AdapterPoolMysql(conf);
        var exampleData = testLib.getExampleData();
        var loggerConfig = {system: exampleData['system']};
        if (opts && opts.errorHandler) {
            loggerConfig.errorHandler = opts.errorHandler;
        }
        var logger = new library.Logger(adapter, loggerConfig);
        return logger;
    };
    it("Create logger", function(done){
        try {
            createLogger();
        } catch (err) {
            return done(err);
        }
        done();
    });
    it("Prepare item without data and put data one after one and save", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        var item = logger.prepareItem();
        item.setIdentity(exampleData['identity']);
        item.setOldItem(exampleData['oldItem']);
        item.setNewItem(exampleData['newItem']);
        item.save(function(err){
            done((err) ? err : null);
        });
    });
    it("Prepare item with identity data and put another data one after one and save", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        var item = logger.prepareItem(exampleData['identity']);
        item.setOldItem(exampleData['oldItem']);
        item.setNewItem(exampleData['newItem']);
        item.save(function(err){
            done((err) ? err : null);
        });
    });
    it("Prepare item with identity, oldItem data and put newItem after and save", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        var item = logger.prepareItem(exampleData['identity'], exampleData['oldItem']);
        item.setNewItem(exampleData['newItem']);
        item.save(function(err){
            done((err) ? err : null);
        });
    });
    it("Prepare item with all data and save after", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        var item = logger.prepareItem(exampleData['identity'], exampleData['oldItem'], exampleData['newItem']);
        item.save(function(err){
            done((err) ? err : null);
        });
    });
    it("Prepare item with all data and save", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        var item = logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem'], function(err){
            done((err) ? err : null);
        });
    });
    it("Prepare item with all data and save, without callback", function(done){
        var adapter = new library.adapters.AdapterConsole();
        var consoleErrorRef = console.error;
        var consoleLogRef = console.log;
        var consoleLastMessages;
        console.error = function(){
            consoleLastMessages = arguments
        };
        console.log = undefined;
        var exampleData = testLib.getExampleData();
        var logger = new library.Logger(adapter, {system: exampleData['system']});
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem'])
        setTimeout(function(){
            console.error = consoleErrorRef;
            console.log = consoleLogRef;
            if (consoleLastMessages && (typeof consoleLastMessages === 'object') && (consoleLastMessages.length === 4)) {
                done();
            } else {
                done(new Error('Expect last message on output error is object with four parameters'));
            }
        }, 5);
    });
    it("Prepare item with all data and save, without callback, but defined custom error handler", function(done){
        var adapter = new library.adapters.AdapterConsole();
        var consoleLogRef = console.log;
        console.log = undefined;
        var exampleData = testLib.getExampleData();
        var lastErrors;
        var logger = new library.Logger(adapter, {system: exampleData['system'], errorHandler: function(data, err){lastErrors=[data, err];}});
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem'])
        setTimeout(function(){
            console.log = consoleLogRef;
            if (
                (typeof lastErrors === 'object') && lastErrors && (lastErrors.length === 2)
                &&
                (typeof lastErrors[0] === 'object') && lastErrors[0] && (lastErrors[0]['identity'] === exampleData['identity'])
                &&
                (typeof lastErrors[1] === 'object' && lastErrors[1] && (lastErrors[1].toString().indexOf('undefined is not a function') > 0))
            ) {
                done();
            } else {
                done(new Error('Expect lastErrors data get data and error'));
            }
        }, 5);
    });
    it("Prepare item with invalid mock data two times", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        logger.prepareItemSave('invalid', exampleData['oldItem'], exampleData['newItem'], function(err){
            if (err && (err.toString().indexOf('Invalid parameter') > 0)) {
                done();
            } else if (err) {
                done(err);
            } else {
                done(new Error('Expect error: Invalid parameter'));
            }
        });
    })
    it("Save item, but get connection error, expect data write to stderr", function(done){
        var consoleErrorRef = console.error;
        var lastErrors;
        console.error = function(){
            lastErrors = arguments;
        };
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        logger.adapter.pool.setErrorGetConnectionTry(1);
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem']);
        setTimeout(function(){
            console.error = consoleErrorRef;
            logger.adapter.pool.clearErrorGetConnectionTry();
            if ((typeof lastErrors === 'object') && lastErrors && (lastErrors.length === 4)) {
                done();
            } else {
                done(new Error('Expect last error object has four arguemnts'));
            }
        }, 5);
    });
    it("Save item, but get connection error, also error stderr output", function(done){
        var consoleErrorRef = console.error;
        console.error = undefined;
        var exampleData = testLib.getExampleData();
        var logger = createLogger();
        logger.adapter.pool.setErrorGetConnectionTry(1);
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem']);
        setTimeout(function(){
            console.error = consoleErrorRef;
            logger.adapter.pool.clearErrorGetConnectionTry();
            done();
        }, 5);
    });
    it("Save item, but get connection error twice times, success on third time", function(done){
        var exampleData = testLib.getExampleData();
        var logger = createLogger({tries:3});
        logger.adapter.pool.setErrorGetConnectionTry(2);
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem'], function(err){
            logger.adapter.pool.clearErrorGetConnectionTry();
            done((err) ? err : null);
        });
    });
    it("Save item, but get connection error third times and write to stderr", function(done){
        var exampleData = testLib.getExampleData();
        var dataError = null;
        var logger = createLogger({tries:3, errorHandler: function(data, err){
            dataError = [data, err];
        }});
        logger.adapter.pool.setErrorGetConnectionTry(3);
        logger.prepareItemSave(exampleData['identity'], exampleData['oldItem'], exampleData['newItem']);
        setTimeout(function(){
            logger.adapter.pool.clearErrorGetConnectionTry();
            if ((dataError !== null) && (dataError.length === 2) && (dataError[1].toString().indexOf('Error get connection [mock]') > 0)) {
                done();
            } else {
                done(new Error('Expect method error handle error third try save data in database mock'));
            }
        }, 5);
    });
});