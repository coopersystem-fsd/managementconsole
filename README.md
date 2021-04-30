# Console Managment

## INSTALL DEPENDENCIES

`npm install`

## DEV on localhost:3000

`npm start -- --port 3000`

## BUILD to dist/ directory

* `npm run build`

## Environment

* production
* test
* development
* hmr-development


## Mocking for development

If you need mocked api use for example

```javascript
import { getAcdrPromise, getAppVersionPromise } from '../../services/__mocks__/api'
```
