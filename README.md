[![Build Status](https://travis-ci.org/pascalsystem/loghistory.svg?branch=master)](https://travis-ci.org/pascalsystem/loghistory)
[![npm version](https://badge.fury.io/js/loghistory.svg)](http://badge.fury.io/js/loghistory)

# LogHistory

Save history log for modify object with user identifier / id

# Documentation

You can see bellow, or for more informaction see to TypeScript definition file: loghistory.d.ts

# Initialize 

For initialize another adapter ( example mysql or custom ) see bellow.

Create object logger example code:
```code
var loghistory = require('loghistory');
var adapter = new loghistory.adapters.AdapterConsole();

// paramter system is required (example: this is your custom name of application, this is very good when use for many application)
// paramter errorHandler is optional, this is default handler which is execute when item save catch error
var logger = new LogHistory.Logger(adapter, {
    system: 'systemname'
    errorHandler: function(data, err){
        // send data to another method
        anotherMethodSaveData(data);
        // write error to std error
        console.error(err);
    }
});

// save data with custom handler for item
logger.prepareItemSave('user_identifier', 'object_type', 'object_uuid', {"value":"oldvalue"}, {"value":"newvalue"}, function(err){
    console.error('Error save data', err);
});

// save data without custom handler for item
// if catch error this module execute errorHandler method with data and error
logger.prepareItemSave('user_identifier', 'object_type', 'object_uuid', {"value":"oldvalue"}, {"value":"newvalue"});

// create item logger and save after
var item = logger.prepareItem('user_identifier', 'object_type', 'object_uuid', {"value":"oldvalue"});
item.setNewItem({"value":"newvalue"});
// if this metod call without callback method then errorHandler methos is execute
item.save(function(err){
    console.error('Error save data', err);
});
```

# Saving data priority

You can use callback method for save trust save or wihtout send callback.
When used second type (without callback) this is also very safety, becouse:
~~~
1. First priority is save by adater
2. Second priority ( if first finished by error ) is execute errorHandler from Logger object ( if defined )
3. Third priority ( if first and second finished by error ) send data with error to std error 
~~~

# Adapter Console std output

Send data to console output.
Data can be seperate by spereate by seperator.

Example base init:
```code
var loghistory = require('loghistory');
var adapter = new loghistory.adapters.AdapterConsole();
```

Example with custom separator (default seperator: |):
```code
var loghistory = require('loghistory');
var adapter = new loghistory.adapters.AdapterConsole({separator: '#'});
```

# Adapter Mysql

Adapter mysql required external database pool connection:
~~~
getConnection(function(err, connection){
    ...
});
~~~
and connection object get method:
~~~
query(sql, params, function(err){
    ...
});
~~~
~~~
release()
~~~

Example library which best to used with this module:
[GitHub](https://github.com/felixge/node-mysql)
[NPM](https://www.npmjs.com/package/mysql)

Example code create pool connection by this library:
```code
var mysql = require('mysql');
var poolConnectionObject = mysql.createPool({
     .....
});
```


Example initialize code:
```code
var loghistory = require('loghistory');
var adapter = new loghistory.adapters.AdapterPoolMysql({
    pool: poolConnectionObject
    tableName: 'table_name',
    columnSystem: 'log_system',
    columnIdentity: 'log_identity',
    columnCreateDate: 'log_create_date',
    columnObjectType: 'log_object_type',
    columnObjectIdentity: 'log_object_identity',
    columnOldItem: 'log_old_item',
    columnNewItem: 'log_new_item',
    maxTries: 3 // Maximum try save data in database, option is optional, default value 1
});
```

# Adapter custom

If you need create custom adapter:

~~~
1. Create object which has methods: save
2. Method save must save data (first parameter "data" in example below). 
3. Method save must execute callback (second parameter "cb" in example below) after try save data with first argument is error or null on success
~~~

Data object properties types:
~~~
data['system'] - always is string
data['identity'] - string or null ( when you pass number, logger parse this to string )
data['createDate'] - always javascript Date object
data['objectType'] - string or null ( when you pass number value is cast to string)
data['objectIdentity'] - string or null ( when you pass number value is cast to string)
data['oldItem'] - always string ( when you object this object is convert to JSON ) or null
data['newItem'] - always string ( when you object this object is convert to JSON ) or null
~~~

Example simple save method ( write data to std output ):
```code
save = function(data, cb) {
    try {
        console.log(
            data.system,
            data.identity,
            data.createDate,
            data.objectType,
            data.objectIdentity,
            data.oldItem,
            data.newItem
        );
    } catch (err) {
        return cb(err);
    }
    cb(null);
};
```

# Import TypeScript definition

Example code:
```code
/// <reference path='./node_modules/loghistory/loghistory.d.ts' /> 
```
