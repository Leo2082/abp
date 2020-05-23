import { ApplicationConfiguration } from '../models/application-configuration';

export function createLocalizer(localization: ApplicationConfiguration.Localization) {
  return (resourceName: string, key: string, defaultValue: string) => {
    if (resourceName === '_') return key;

    const resource = localization.values[resourceName];

    if (!resource) return defaultValue;

    return resource[key] || defaultValue;
  };
}

export function createLocalizerWithFallback(localization: ApplicationConfiguration.Localization) {
  const findLocalization = createLocalizationFinder(localization);

  return (resourceNames: string[], keys: string[], defaultValue: string) => {
    const { localized } = findLocalization(resourceNames, keys);
    return localized || defaultValue;
  };
}

export function createLocalizationPipeKeyGenerator(
  localization: ApplicationConfiguration.Localization,
) {
  const findLocalization = createLocalizationFinder(localization);

  return (resourceNames: string[], keys: string[], defaultKey: string) => {
    const { resourceName, key } = findLocalization(resourceNames, keys);
    return !resourceName ? defaultKey : resourceName === '_' ? key : `${resourceName}::${key}`;
  };
}

function createLocalizationFinder(localization: ApplicationConfiguration.Localization) {
  const localize = createLocalizer(localization);

  return (resourceNames: string[], keys: string[]) => {
    resourceNames = resourceNames.concat(localization.defaultResourceName).filter(Boolean);

    const resourceCount = resourceNames.length;
    const keyCount = keys.length;

    for (let i = 0; i < resourceCount; i++) {
      const resourceName = resourceNames[i];

      for (let j = 0; j < keyCount; j++) {
        const key = keys[j];
        const localized = localize(resourceName, key, null);
        if (localized) return { resourceName, key, localized };
      }
    }

    return { resourceName: undefined, key: undefined, localized: undefined };
  };
}
