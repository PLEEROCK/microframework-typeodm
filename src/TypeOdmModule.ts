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

    onBootstrap(): Promise<any> {
        return this.setupODM();
    }

    afterBootstrap(): Promise<any> {
        this._connectionManager.importDocumentsFromDirectories(this.getOdmDocumentDirectories());
        this._connectionManager.importSubscribersFromDirectories(this.getOdmSubscriberDirectories());
        return Promise.resolve();
    }

    onShutdown(): Promise<any> {
        return this.closeConnections();
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
        return this.connect();
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

    private closeConnections(): Promise<any> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().close());

        if (this.configuration.connections)
            promises.concat(this.configuration
                .connections
                .map(connection => this._connectionManager.getConnection(connection.name).close()));

        return Promise.all(promises);
    }

    private connect(): Promise<void> {
        let promises: Promise<any>[] = [];
        if (this.configuration.connection)
            promises.push(this._connectionManager.getConnection().connect(this.configuration.connection));

        if (this.configuration.connections) {
            promises.concat(this.configuration.connections.map(connection => {
                return this._connectionManager.getConnection(connection.name).connect(connection.options);
            }));
        }
        return Promise.all(promises).then(() => {});
    }

    private getOdmDocumentDirectories(): string[] {
        if (!this.configuration || !this.configuration.documentsDirectories)
            return [this.getSourceCodeDirectory() + TypeOdmModule.DEFAULT_ODM_DOCUMENT_DIRECTORY];

        return this.configuration.documentsDirectories;
    }

    private getOdmSubscriberDirectories(): string[] {
        if (!this.configuration || !this.configuration.subscribersDirectories)
            return [this.getSourceCodeDirectory() + TypeOdmModule.DEFAULT_ODM_SUBSCRIBER_DIRECTORY];

        return this.configuration.subscribersDirectories;
    }

    private getSourceCodeDirectory() {
        let dir = this.options.frameworkSettings.baseDirectory + '/';
        if (this.options.frameworkSettings.srcDirectory)
            dir += this.options.frameworkSettings.srcDirectory + '/';
        return dir;
    }

}
