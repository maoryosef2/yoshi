---
id: configuration
title: Configuration
sidebar_label: Configuration
---

## Module-level Configuration

The following configurations are available by creating a `.module.json` file:

```json
{
  "moduleId": "my-module",
  "moduleConfigurationId": "my-parent-module",
  "appDefId": "00000000-0000-0000-0000-000000000000",
  "moduleBundleName": "my-entry",
  "routeNamespace": "my-route",
  "topology": {
    "someArtifactsUrl": {
      "artifactId": "com.wixpress.some-artifact"
    }
  },
  "translations": {
    "default": "en",
    "suspense": true
  },
  "experimentsScopes": ["some-petri-scope"],
  "sentry": {
    "DSN": "https://2119191543ba436f81cde38969ecf354@sentry.wixpress.com/470",
    "id": "sentry-id",
    "teamName": "sentry-team",
    "projectName": "sentry-project"
  },
  "bi": "@wix/bi-logger-yoshi"
}
```

---

### `moduleId`

Use this to override your `moduleId`.
Defaults to your `artifactId` (taken from `pom.xml`).

### `moduleConfigurationId`

Use this to indicate your `moduleConfigurationId`.
Read more [here](https://github.com/wix-private/business-manager/blob/master/business-manager-api/docs/business-manager-module.md#setmoduleconfigurationid).

### `appDefId`

Use this to indicate your `appDefId`.
This will affect the `target/module_<MODULE_ID>.json` generated by `yoshi-bm build`.

### `moduleBundleName`

Use this to change the module bundle's name.
Defaults to `'module'` (which will output `module.bundle.js` & `module.bundle.min.js`).

### `routeNamespace`

This prefixes all your pages with the given string.
Defaults to `''`.

For example, given `"routeNamespace": "foo"`, the following pages will configured as such:

| Path                    | Route          |
| ----------------------- | -------------- |
| `src/pages/index.tsx`   | `/foo`         |
| `src/pages/bar.tsx`     | `/foo/bar`     |
| `src/pages/bar/baz.tsx` | `/foo/bar/baz` |

### `topology`

Sets your application's topology template.
This will affect the `target/module_<MODULE_ID>.json` generated by `yoshi-bm build`.

Defaults to:

```json
{
  "staticsUrl": {
    "artifactId": "<YOUR_ARTIFACT_ID>"
  }
}
```

### `translations.default`
The default locale to be used. Enables the built-in [I18N integration](./runtime-api.md#i18n).

### `translations.suspense`

Defaults to `true`. Use this to disable Suspense in `@wix/wix-i18n-config`. 

### `experimentsScopes`

Accepts an array of Petri scopes. Enables the built-in [Experiments integration](./runtime-api.md#experiments).

### `sentry.DSN`

Your Sentry DSN string, it is auto-generated for you on project generation.
Enables the built-in [Sentry integration](./runtime-api.md#sentry).

### `sentry.id` (optional)

Your Sentry ID.

It is auto-generated for you on project generation, but is not required for built-in Sentry integration.

### `sentry.teamName` (optional)

Your Sentry team name.

It is auto-generated for you on project generation, but is not required for built-in Sentry integration.

### `sentry.projectName` (optional)

Your Sentry project name.

It is auto-generated for you on project generation, but is not required for built-in Sentry integration.

### `bi` (optional)

The package name of your BI Schema Logger, for example `@wix/bi-logger-yoshi`.
Enables the built-in [BI integration](./runtime-api.md#bi).
> Make sure you have the given package name installed in your `dependencies`!


## Page-level Configuration

Pages can be customized by adding a `*.json` file with the same name as the appropriate page.
For example, the `src/pages/some-route.tsx` file, will be configured by `src/pages/some-route.json`:

```json
{
  "componentId": "some-component-id",
  "componentName": "some-component-name"
}
```

---

### `page.componentId`

Sets the page's `componentId`. Defaults to `<MODULE_ID>.pages.<FILE_NAME>`.

### `page.componentName`

Sets the page's `componentName`. Defaults to `<MODULE_ID>.pages.<FILE_NAME>`.

## Exported Component-level Configuration

Exported components can be customized by adding a `*.json` file with the same name as the appropriate component file.
For example, the `src/exported-components/some-component.tsx` file, will be configured by `src/exported-components/some-component.json`:

```json
{
  "componentId": "some-component-id"
}
```

---

### `exported-component.componentId`

Sets the component's `componentId`. Defaults to `<MODULE_ID>.components.<FILE_NAME>`.

## Method-level Configuration

Methods can be customized by adding a `*.json` file with the same name as the appropriate method file.
For example, the `src/methods/some-method.ts` file, will be configured by `src/methods/some-method.json`:

```json
{
  "methodId": "some-method-id"
}
```

### `method.methodId`

Sets the method's `methodId`. Defaults to `<MODULE_ID>.methods.<FILE_NAME>`.