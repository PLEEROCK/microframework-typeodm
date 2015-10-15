import {Module, ModuleInitOptions} from "microframework/Module";
import {ConnectionManager} from "typeodm/connection/ConnectionManager";
import {MongodbDriver} from "typeodm/driver/MongodbDriver";
import {TypeOdmModuleConfig} from "./TypeOdmModuleConfig";

/**
 * TypeODM module integration with microframework.
 */
export class TypeOdmModule implements Module {

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    public static DEFAULT_ODM_DOCUMENT_DIRECTORY = 'document';
    public static DEFAULT_ODM_SUBSCRIBER_DIRECTORY = 'subscriber';

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private options: ModuleInitOptions;
    private configuration: TypeOdmModuleConfig;
    private _connectionManager: ConnectionManager;

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    getName(): string {
        return 'TypeOdmModule';
    }

    getConfigurationName(): string {
        return 'typeodm';
    }

    isConfigurationRequired(): boolean {
        return true;
    }

    init(options: ModuleInitOptions, configuration: TypeOdmModuleConfig): void {
        this.options = options;
        this.configuration = configuration;
    }

    onBootstrap(dependentModules?: Module[]): Promise<any> {
        return this.setupODM();
    }

    onShutdown(): Promise<any> {
        this.closeConnections();
        return Promise.resolve();
    }

    // -------------------------------------------------------------------------
    // Accessors
    // -------------------------------------------------------------------------

    /**
     * Gets the connection manager.
     */
     get connectionManager(): ConnectionManager {
        return this._connectionManager;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private setupODM(): Promise<any> {
        this._connectionManager = this.options.container.get(ConnectionManager);
        this._connectionManager.container = this.options.container;
        this.addConnections();
        this._connectionManager.importDocumentsFromDirectories(this.getOdmDocumentDirectories());
        this._connectionManager.importSubscribersFromDirectories(this.getOdmSubscriberDirectories());
        return Promise.all(this.connect());
    }

    private addConnections() {
        if (this.configuration.connection) {
            if (!this.configuration.connectionDriver || this.configuration.connectionDriver === 'mongodb')
                this._connectionManager.addConnection(new MongodbDriver());
        }

        if (this.configuration.connections) {
            this.configuration.connections
                .filter(connection => !connection.driver || connection.driver === 'mongodb')
                .forEach(connection => this._connectionManager.addConnection(connection.name, new MongodbDriver()));
        }
    }

    private closeConnections() {
        if (this.configuration.connection)
                this._connectionManager.getConnection().close();

        if (this.configuration.connections)
            this.configuration
                .connections
                .forEach(connection => this._connectionManager.getConnection(connection.name).close());
    }

    private connect(): Promise<any>[] {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().connect(this.configuration.connection));

        if (this.configuration.connections) {
            promises.concat(this.configuration.connections.map(connection => {
                return this._connectionManager.getConnection(connection.name).connect(connection.options);
            }));
        }
        return promises;
    }

    private getOdmDocumentDirectories(): string[] {
        if (!this.configuration || !this.configuration.documentsDirectories)
            return [this.options.frameworkSettings.baseDirectory + '/' + TypeOdmModule.DEFAULT_ODM_DOCUMENT_DIRECTORY];

        return this.configuration.documentsDirectories;
    }

    private getOdmSubscriberDirectories(): string[] {
        if (!this.configuration || !this.configuration.subscribersDirectories)
            return [this.options.frameworkSettings.baseDirectory + '/' + TypeOdmModule.DEFAULT_ODM_SUBSCRIBER_DIRECTORY];

        return this.configuration.subscribersDirectories;
    }

}