# TypeODM module for Microframework

Adds integration between [typeodm](http://github.com/pleerock/typeodm) and
[microframework](https://github.com/pleerock/microframework).

## Usage

1. Install module:

    `npm install microframework-typeodm --save`

2. Simply register module in the microframework when you are bootstrapping it.
    
    ```typescript
    
        import {MicroFrameworkBootstrapper} from "microframework/MicroFrameworkBootstrapper";
        import {TypeOdmModule} from "microframework-typeodm/TypeOdmModule";
        
        new MicroFrameworkBootstrapper({ baseDirectory: __dirname })
            .registerModules([
                new TypeOdmModule()
            ])
            .bootstrap()
            .then(result => console.log('Module is running. TypeODM is available now.'))
            .catch(error => console.error('Error: ', error));
    ```

3. ES6 features are used, so you may want to install [es6-shim](https://github.com/paulmillr/es6-shim) too:

    `npm install es6-shim --save`

    you may need to `require("es6-shim");` in your app.

4. Now you can use [typeodm](http://github.com/pleerock/typeodm) module in your microframework.

## Todos

* cover with tests
* add more docs