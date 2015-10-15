# TypeODM module for Microframework

Adds integration between [typeodm](http://github.com/PLEEROCK/typeodm) and 
[microframework](https://github.com/PLEEROCK/microframework).

## Usage

1. Install module:

    `npm install --save microframework-typeodm`

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

3. Now you can use [typeodm](http://github.com/PLEEROCK/typeodm) module in your microframework.

## Todos

* cover with tests
* add more docs