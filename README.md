## react-native-on-app-version-upgrade 

## Install
install react-native-device-info

```
npm install react-native-on-app-version-upgrade
```
## Usage

```
import { checkAppVersionUpgrade } from 'react-native-on-app-version-upgrade';

checkAppVersionUpgrade({ considerInstallAsUpgrade: true, storage: Storage }).then(
  ({ wasUpgraded }) => {
    if (wasUpgraded) {
      // for example do migrations on app upgrade
    }
  },
);
```
