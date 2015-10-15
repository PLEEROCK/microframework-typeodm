import {ConnectionOptions} from "typeodm/connection/ConnectionOptions";

/**
 * Configuration for typeodm module.
 */
export interface TypeOdmModuleConfig {

    /**
     * List of directories where from odm documents will be loaded.
     */
    documentsDirectories?: string[];

    /**
     * List of directories where from odm subscribers will be loaded.
     */
    subscribersDirectories?: string[];

    /**
     * Sets the options for the default typeodm connection.
     */
    connection: ConnectionOptions;

    /**
     * Sets the driver for the default connection. Defaults to "mongodb".
     */
    connectionDriver?: string;

    /**
     * Used in the case when multiple odm connections are required.
     */
    connections: {

        /**
         * Driver to be used by this connection. Defaults to "mongodb".
         */
        driver?: string;

        /**
         * Connection name.
         */
        name: string;

        /**
         * Connection options.
         */
        options: ConnectionOptions;
    }[];

}
