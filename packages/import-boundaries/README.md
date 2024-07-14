# @yanice/import-boundaries

## Purpose

This package serves as a plugin for [yanice](https://www.npmjs.com/package/yanice).
Without yanice, the package is of little value.

## Installation

Install e.g. via npm as follows:

```
npm install --save-dev @yanice/import-boundaries
```

## Usage

The plugin can be invoked via `yanice`:

```
yanice plugin:import-boundaries <scope> --assert
```

`scope` must be defined in the `yanice.json` under `dependencyScopes`. See further below for more examples and explanations.

## Configuration

Configuration of the plugin is done in the `yanice.json`, see [here](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/yanice.json) for an example:

```json
{
    "import-boundaries": {
        "importResolvers": {
            "**/*.some-extension": ["./some-custom-resolver.js"],
            "**/*.{js,ts}": ["es6-declarative-import-resolver"]
        },
        "postResolve": ["./post-resolve.js"],
        "assertions": ["only-direct-imports", "use-all-declared-dependencies"],
        "customAssertions": ["./some-custom-assertion.js"],
        "assertionOptions": {
            "skippedImports": {
                "amount": 0,
                "mode": "exact"
            },
            "ignoredProjects": ["ALL-FILES"]
        }
    }
}
```

### importResolvers

A map that maps glob-expressions to an array of import-resolvers.
An import-resolver accepts a file and its filepath and creates an "import-map".
See here for an example how a custom import resolver can be written: [dummy-resolver.ts](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/custom-scripts/dummy-resolver.ts).
Note that we ultimately need to provide a JS-file, meaning, the aforementioned code would first need to be transpiled.

Officially available resolvers:

-   `es6-declarative-import-resolver`: Resolves all `import ... from ...`-statements.

Currently missing (will follow later):

-   common-js: Use of `require` is currently ignored
-   dynamic imports: `import(..)` and `await import(..)` are currently ignored as well

### postResolve

The plugin will create an import-map for all files that matched.
In case anything is amiss or the plugin was not able to resolve certain imports, in this step we can do one final mapping.
One possible use-case is to resolve typescript-path-mappings here.

### assertions

Array of officially provided assertions. Currently supported:

-   `only-direct-imports`: Forces that only imports to projects which are defined as a direct dependency in the given scope are allowed. E.g.: A file in `project-A` imports a file from `project-B` - this is only allowed if `"project-A": ["project-B", ...]` is declared in the `yanice.json`.
-   `only-transitive-dependencies`: Similar to `only-direct-imports`, but allowing for transitive dependencies: When we declare `A` to depend on `B` which depends on `C`, `A` is also allowed to import from `C`.
-   `use-all-declared-dependencies`: Similar to `only-direct-imports`, but the other way around: Any declared dependency _must_ be used. I.e., if `project-A` depends on `project-B` as per `yanice.json`, then `project-A` must indeed import `project-B`.
-   `max-skipped-imports`: See also how to ignore imports below. The rule allows to check/enforce only a certain amount of skipped imports.
-   `access-via-entrypoints`: It is sometimes desirable to access a project from other projects only via defined entrypoints, such as e.g. an `index.ts`, `public_api.ts` or some such, and disallow "deep" imports to arbitrary files.
    This rule helps with that. Define one or multiple entry-points via the `entrypoints`-property for each project. This rule will then ensure that every import from another project accesses the project via a defined entrypoint.
-   `restrict-package-imports`: Restrict which project is allowed to import from which package (where a "package"-import is any import that is not a relative import).
    The configuration supports both allowlists and blocklists.
-   `no-circular-imports`: Do not allow circular imports. This is entirely independent of project-setup and just disallows any circular import.

### customAssertions

Array of custom assertion scripts. See [here](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/yanice.json#L18) on how to provide a script;
the original untranspiled assertion-source-code can be found here: [link to dummy-assertion](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/custom-scripts/dummy-assertion.ts).

### assertionOptions

-   `ignoredProjects`: The rules related to boundary-assertions will ignore any listed project. This is especially helpful for "metaprojects" like `all-files`, `all-typescript-files` etc.
-   `skippedImports`: Only relevant when using `max-skipped-imports`. Define the amount of allowed skipped imports. The `mode`-property defines how the number is interpreted.
-   `accessViaEntryPoints`: Only relevant when using `access-via-entrypoints`. The `allowWithinSameProject`-flag controls whether entrypoint-access from within the same project is allowed.
    E.g., if the `index.js` is an entrypoint of `project-A`, whether any other file within `project-A` is allowed to import from the `index.js`.
    By default, this is not the case, as this often leads to undesired import-circles.
-   `restrictPackageImports`: Only relevant when using the `restrict-package-imports`-rule. When `allPackagesMustBeListed` is set to `true`,
    all imported packages must either be explicitly allowed or blocked. The `allowList` and `blockList` allow or block packages by default,
    with the possibility to list exceptions to the rule on a per-project-basis.

#### Ignoring a particular import

No rule without an exception.
When an import statement is preceded with an ignore-comment `// @yanice:import-boundaries ignore-next-line`, the given import-statement is not considered for assertions:

```typescript
// @yanice:import-boundaries ignore-next-line
import { something } from './some/illegal/file';
```

## Commands

The plugin can be invoked with the following parameters:

**Main Options**:

-   `--assert`: The default mode; will be used when no other main option is present. Runs all configured assertions.
-   `--print-file-imports`: Will print file-import-maps as soon as they are available, without any yanice-project-related information.
-   `--print-assertion-data`: Will print all data that is being generated to run assertions.
    The aforementioned file-import-map, which file belongs to which project, and which project imports which project.
-   `--generate`: Will print the project-dependencies based on the imports in the format that the yanice.json uses

**Additional Options**:

-   `--skip-post-resolvers`: Skips the post-resolvers.
-   `--perf-log` (or `--performance-logging`): Adds some extra logs to show how much time was spent on which operation.

### Examples

A good starting point is to print the project-map generated by the plugin.
Note that a dependency-scope (here: `build`) must be provided and configured in the `yanice.json`.

```
yanice plugin:import-boundaries build --print-project-imports
```

Note that the output might be fairly big; as it is in `*.json`-format, piping it into a file might be convenient:

```
yanice plugin:import-boundaries build --print-project-imports > project-import-map.json
```

Run the plugin for the `build`-dependency-scope, generating
the project-dependencies as per imports in the yanice.json-format:

```
yanice plugin:import-boundaries build --generate --skip-post-resolvers
```

Print the file-import-maps without any yanice-project-related information, also skipping any post-resolver:

```
plugin:import-boundaries a-depends-on-b --print-project-imports --skip-post-resolvers
```
