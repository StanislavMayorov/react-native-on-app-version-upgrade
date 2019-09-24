## react-native-on-app-version-upgrade 
React native utility to check first session after an app was upgraded, e.g from Google Play
or Apple Store.
## Install
Install [react-native-device-info](https://github.com/react-native-community/,eact-native-device-info). All versions are supported.

```
npm install react-native-on-app-version-upgrade
```
## Usage
Users must pass their storage engine in, e.g async-storage or [redux-persist-fs-storage](https://github.com/leethree/redux-persist-fs-storage).

**IMPORTANT!** `checkAppVersionUpgrade` have to be invoked at least once on every app start. 
```js
import AsyncStorage from '@react-native-community/async-storage';
import { checkAppVersionUpgrade } from 'react-native-on-app-version-upgrade';

checkAppVersionUpgrade({ storage: AsyncStorage, considerInstallAsUpgrade: true }).then(
  ({ wasUpgraded }) => {
    if (wasUpgraded) {
      // for example copy asserts
    }
  },
);

checkAppVersionUpgrade({ storage: AsyncStorage }).then(
  ({ prevBuildNumber, buildNumber }) => {
    if (prevBuildNumber < 10 && buildNumber >= 10) {
      // for example do migrations on app upgrade
    }
  },
);
```
## API
**Signature:**

`checkAppVersionUpgrade({{ storage: object, considerInstallAsUpgrade: bool }}): Promise`

`storage` is required.

`considerInstallAsUpgrade` is optional. Default is `false`. `true` value sets
`wasUpgraded` to `true`  when the app has just been installed. 


**Returns:** Promise with object 
`{  wasUpgraded,
    version,
    buildNumber,
    prevVersion,
    prevBuildNumber}`.
    
`wasUpgraded` is `true` on first session after app upgrade.
