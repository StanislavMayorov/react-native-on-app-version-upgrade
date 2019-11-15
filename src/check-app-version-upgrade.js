import DeviceInfo from 'react-native-device-info';
import memoize from 'lodash.memoize';

const MESSAGE_NO_STORAGE =
  'react-native-app-version-upgrade caught an error. Storage engine is required, for example, AsyncStorage';
const MESSAGE_CANT_GET_INFO =
  "react-native-app-version-upgrade caught an error. Can't get or set version info";

const STORAGE_KEY = 'react-native-app-version-upgrade';

const versionPromise = DeviceInfo.getVersion(); //backward compatible with DeviceInfo v2 when result is string
const buildNumberPromise = DeviceInfo.getBuildNumber();

function getDataFromStorage(storage) {
  return storage.getItem(STORAGE_KEY).then(json => {
    if (typeof json === 'string') {
      return JSON.parse(json);
    } else {
      return {};
    }
  });
}

const getMemoizeDataFromStorage = memoize(getDataFromStorage);

function saveDataToStorage(storage, version, build) {
  return storage.setItem(STORAGE_KEY, JSON.stringify({version, build}));
}

const saveMemoizeDataToStorage = memoize(saveDataToStorage);

export function checkAppVersionUpgrade(config) {
  const { storage, considerInstallAsUpgrade } = config;
  if (!storage) {
    console.error(MESSAGE_NO_STORAGE);
    return Promise.reject(MESSAGE_NO_STORAGE);
  }

  const prevDataPromise = getMemoizeDataFromStorage(storage);

  return Promise.all([
    prevDataPromise,
    versionPromise,
    buildNumberPromise,
  ])
    .then(function([prevData, version, buildNumber]) {
      const {
        version: prevVersion,
        build: prevBuildNumber,
      } = prevData;
      const saveAndGetResult = wasUpgraded => {
        return saveMemoizeDataToStorage(storage, version, buildNumber).then(() => ({
          wasUpgraded,
          version,
          buildNumber,
          prevVersion,
          prevBuildNumber,
        }));
      };

      if (!prevVersion && considerInstallAsUpgrade) {
        return saveAndGetResult(true);
      }

      return saveAndGetResult(prevVersion !== version);
    })
    .catch(function(error) {
      console.error(MESSAGE_CANT_GET_INFO, error);
      throw error;
    });
}
