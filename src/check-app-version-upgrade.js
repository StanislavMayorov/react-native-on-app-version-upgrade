import DeviceInfo from 'react-native-device-info';
import memoize from 'lodash.memoize';

const MESSAGE_NO_STORAGE =
  'react-native-app-version-upgrade caught an error. Storage engine is required, for example, AsyncStorage';
const MESSAGE_CANT_GET_INFO =
  "react-native-app-version-upgrade caught an error. Can't get or set version info";

const STORAGE_KEY_FOR_VERSION = 'react-native-app-version-upgrade-version';
const STORAGE_KEY_FOR_BUILD = 'react-native-app-version-upgrade-build';

const versionPromise = DeviceInfo.getVersion(); //backward compatible with DeviceInfo v2 when result is number
const buildNumberPromise = DeviceInfo.getBuildNumber();

function getDataFromStorage(storage) {
  const prevVersionPromise = storage.getItem(STORAGE_KEY_FOR_VERSION);
  const prevBuildPromise = storage.getItem(STORAGE_KEY_FOR_BUILD);
  return {
    prevVersionPromise,
    prevBuildPromise,
  };
}

const getMemoizeDataFromStorage = memoize(getDataFromStorage);

function saveDataToStorage(storage, version, build) {
  return Promise.all([
    storage.setItem(STORAGE_KEY_FOR_VERSION, version),
    storage.setItem(STORAGE_KEY_FOR_BUILD, build),
  ]);
}

const saveMemoizeDataToStorage = memoize(saveDataToStorage);

export function checkAppVersionUpgrade(config) {
  const { storage, considerInstallAsUpgrade } = config;
  if (!storage) {
    console.error(MESSAGE_NO_STORAGE);
    return Promise.reject(MESSAGE_NO_STORAGE);
  }

  const { prevVersionPromise, prevBuildPromise } = getMemoizeDataFromStorage(storage);

  return Promise.all([
    prevVersionPromise,
    prevBuildPromise,
    versionPromise,
    buildNumberPromise,
  ])
    .then(function([prevVersion, prevBuildNumber, version, buildNumber]) {
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
