declare module "express-mysql-session" {
    import { Store } from "express-session";
    import * as expressSession from "express-session";

    interface MySQLStoreOptions {
        host?: string;
        port?: number;
        user?: string;
        password?: string;
        database?: string;
        schema?: {
            tableName?: string;
            columnNames?: {
                session_id?: string;
                expires?: string;
                data?: string;
            };
        };
        clearExpired?: boolean;
        checkExpirationInterval?: number;
        expiration?: number;
        createDatabaseTable?: boolean;
    }

    type MySQLStoreConstructor = new (
        options?: MySQLStoreOptions | undefined,
        connection?: any
    ) => Store;

    function MySQLStore(session: typeof expressSession): MySQLStoreConstructor;

    export = MySQLStore;
}