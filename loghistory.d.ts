declare module "loghistory" {
    export = LogHistory;
}

declare module LogHistory {
    export module adapters {
        /**
         * Interface abstract adapter
         */
        class AdapterAbstract {
            
        }
        
        /**
         * Options for adapter console
         */
        export interface AdapterConsoleOptions {
            /**
             * Separator between values
             */
            separator?:string;
        }
        
        /**
         * Adapter console
         */
        export class AdapterConsole extends AdapterAbstract {
            /**
             * Constructor for adapter
             */
            constructor(options?:AdapterConsoleOptions);
        }
        
        /**
         * Options for adapter mysql
         */
        export interface AdapterPoolMysqlOptions {
            /**
             * Mysql pool connection
             */
            pool:any;
            /**
             * Table name
             */
            tableName:string;
            /**
             * Column name for system
             */
            columnSystem:string;
            /**
             * Column name for identity app or user
             */
            columnIdentity:string;
            /**
             * Column name for create date
             */
            columnCreateDate:string;
            /**
             * Column name for object type
             */
            columnObjectType:string;
            /**
             * Column name for object identity
             */
            columnObjectIdentity:string;
            /**
             * Column name for old item object data
             */
            columnOldItem:string;
            /**
             * Column name for new item object data
             */
            columnNewItem:string;
            /**
             * Maximum tries save data in database, default only one time
             */
            maxTries?:number;
        }
        
        /**
         * Adapter database mysql
         */
        export class AdapterPoolMysql extends AdapterAbstract {
            /**
             * Constructor for adapter
             */
            constructor(options:AdapterPoolMysqlOptions);
        }
    }
    
    /**
     * Logger item
     */
    class LoggerItem {
        /**
         * Constructor
         */
        constructor(obj:Logger)
        /**
         * Set identity (ex: application or user), any object which can convert to string or null
         */
        setIdentity(identity:any):LoggerItem;
        /**
         * Set object type
         */
        setObjectType(objectType:string):LoggerItem;
        /**
         * Set object identity
         */
        setObjectIdentity(objectIdentity:any):LoggerItem;
        /**
         * Old item object data
         */
        setOldItem(oldItem:any):LoggerItem;
        /**
         * New item object data
         */
        setNewItem(newItem):LoggerItem;
        /**
         * Save item and execute callback if exists
         */
        save(cb?:(err:Error)=>void):void;
    }
    
    /**
     * Logger options
     */
    export interface LoggerOptions {
        /**
         * System name representation
         */
        system:string;
        /**
         * Error handler when not defined callback for item
         * If not defined default error handler and not defined callback for item
         * this module write error data to output
         */
        errorHandler?:(data:Object,err:Error)=>void;
    }
    
    /**
     * Logger main class
     */
    export class Logger {
        /**
         * Constructor
         */
        constructor(adapter:adapters.AdapterAbstract, options:LoggerOptions);
        /**
         * Prepare logger item by parameters
         */
        prepareItem(identity?:any, objectType?:string, objectIdentity?:any, oldItem?:any, newItem?:any):LoggerItem;
        /**
         * Save logger item
         */
        prepareItemSave(identity?:any, objectType?:string, objectIdentity?:any, oldItem?:any, newItem?:any, cb?:(err:Error)=>void);
    }
}