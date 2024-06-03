# Yanice

Yanice (_yet another incremental command executor_) takes care of change detection and incremental builds/command
execution within a git-based monorepository.
It lets you define various dependency graphs for different "scopes" (e.g. build, test, lint...) to model the
dependencies between your projects,
detects changes between the current working tree and e.g. another commit, and lets you execute commands depending on
those changes and the dependency graphs you defined.

For example, a repository with two projects and two libraries might be modeled as follows:

<p align="center">
  <img alt="yanice-visualization-example" src="https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png">
</p>

In this example, we look at the graph comparing the working tree to `HEAD`. Something in `lib-2` changed.
If we now run `yanice run test --rev=HEAD`, the test-command of `project-A` would be executed: `lib-2` changed, `project-A`
depends on `lib-2`, but `lib-2` itself nor `project-B` have a test-command defined (dashed border), therefore only one command is run.
See below for how to define the project-structure.

## Assumptions & Caveats:

-   The dependencies between the projects inside the repository can be modeled as
    a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG)
-   This DAG is known and is described in a `yanice.json`-file
-   Yanice will _not_ read any file inside the repository (except its configuration - the aforementioned `yanice.json`)
-   Yanice will therefore _not_ automatically detect dependencies via, for example, detecting imports. Enabling this via plugins is possible though, see below
-   Yanice works best for small- to medium-sized repositories, the dependencies between the projects have
    to be defined and maintained in a single configuration-file, which _can_ get cumbersome with increasing size
-   Due to the design philosophy of not reading/touching any files inside the repository, yanice can technically be used for any kind of repository, no matter the technology/languages used (node/git must be
    available)
-   In its current form, yanice only detects changes between the current working tree (w/o uncommitted changes) and a
    given commit-ish (commitSHA, branch, tag, HEAD...). Metadata about last command executions are _not_ stored or considered in any other way. To achieve incremental builds
    for e.g. CI-purposes, retrieve the commit of the last successful build or e.g. the target-branch of a PR, and compare
    to that

## Installation

Install e.g. via npm as follows:

```
npm install --save-dev yanice
```

## Configuration

The complete version of the `yanice.json` used for this example can be found
here: [example-yanice.json](https://github.com/abuob/yanice/blob/master/src/__fixtures/readme-example-yanice.json)

The example corresponds to the graph in the picture above. `project-A` for example is defined as follows:

```
{
  "projectName": "project-A",
  "projectFolder": "project-A",
  "pathGlob": "**/*.ts",
  "commands": {
    "build": {
      "command": "npm run build",
      "cwd": "./project-A"
    },
    "lint": {
      "command": "npm run lint-project-A",
      "cwd": "./"
    },
    "test": {
      "command": "npm run test-project-A"
    }
  },
  "responsibles": ["Bob", "Bill"]
}
```

Every file in the repository (and in the same directory as the `yanice.json` or a subdirectory thereof) is possibly part of a project.
The files that are part of a project can be defined by using `projectFolder`, `pathGlob` or `pathRegExp`, or a combination of all (all need to be satisfied).
Note that this allows you to match any file or even no file at all: If you do not define any of these properties,
all files in the repository will match and be part of the project. Projects such as "all-js-files" or "ci-relevant-files" can easily be modelled.

A Command will be executed in the given `cwd`. A command corresponds to a scope (here: build, test, lint), for which a
dependency graph is defined in the `yanice.json`. E.g. for test, the dependencies
are modeled as such:

```
"test": {
  "extends": "build",
  "options": {
    "commandOutput": "append-at-end-on-error",
    "outputFilters": ["npmError"]
  },
  "dependencies": {
    "project-A": ["lib-1", "lib-2", "important-repo-files", "test-utils"],
    "lib-1": ["important-repo-files", "test-utils"]
  }
}
```

A scope can extend another scope, but currently, only one level of extension is allowed.
If a scope is extended, all dependencies are the same as of the extended scope - except for those that are overridden (
in the given example, `project-A` and `lib-1` have overridden dependencies inherited from `build`).

A scope can have `defaultDependencies`; projects which are not listed will have these as dependencies. This is intended
for scopes that
have an inherently 'flat' dependency tree; e.g. linting: Each project might depend on some global linting configuration
but nothing else.
Not intended to be used in combination with `extends`.

## Commands

In general, commands have the following base
structure: `yanice (run|output-only|visualize|plugin:<plugin-name>) <scope> --(rev|branch|commit)=<git-rev>`.

See further below for examples.

### First parameter

Yanice consists internally of phases: Load configuration, parse the arguments, calculate the dependency tree, determine
changed files using git,
calculating changed projects, and so on. These steps are always the same, except for the last one, which determines
what to do with all the results from the previous steps. This is determined by the first argument:

| First parameter        | Effect                                                                                                                                                                                                         |
| :--------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `run`                  | Runs the commands                                                                                                                                                                                              |
| `output-only`          | Same as `run`, but instead of running the commands, print related information.                                                                                                                                 |
| `visualize`            | Starts a small server which serves a visualization of the graph and all the changes; see e.g. [depiction above](https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png). |
| `plugin:<plugin-name>` | Invokes a plugin with all available data. There are some officially provided plugins, however, you an also provide the location of a custom script that yanice will invoke. See below for details.             |

### Second parameter

The second parameter selects a `scope` as defined in the `yanice.json`, see above.

### Additional parameters

The order of the remaining parameters generally does not matter (except when overwriting each other):

| Parameter                                                               | Works only for | Default  | Effect                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| :---------------------------------------------------------------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--rev=<git-revision>`, `--branch=<git-branch>`, `--commit=<commitSHA>` |                |          | git-revision with which the current working tree (w/o uncommitted changes, see below) will be compared. `--rev=<..>` accepts anything that `git rev-parse` can turn into a commit-SHA. Under the hood, yanice uses `git diff --name-only` in combination with `git merge-base --octopus` to determine the changed files. Therefore, yanice needs to know the corresponding refs/git-history, this is especially relevant with regards to shallow-clone. |
| `--all`                                                                 |                |          | Ignore all change detection and just assume every project has changed.                                                                                                                                                                                                                                                                                                                                                                                  |
| `--concurrency=n`                                                       | `run`          | `1`      | Will execute `n` commands in parallel                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `--output-mode=ignore\|append-at-end\|append-at-end-on-error`           | `run`          | `ignore` | Determines what to do with `stdout` when running commands. Note that this overwrites configuration in the `yanice.json`.                                                                                                                                                                                                                                                                                                                                |
| `--responsibles`                                                        | `output-only`  |          | Will print all responsibles of all projects that are affected by changes as per given scope. This might be useful for determining who should e.g. review a pull request                                                                                                                                                                                                                                                                                 |
| `--exclude-uncommitted`                                                 |                |          | Per default, uncommitted changes are considered. With this parameter, `HEAD` will be used for comparison, the index will be ignored.                                                                                                                                                                                                                                                                                                                    |
| `--include-filtered`                                                    | `output-only`  |          | Per default, projects for which a command is not specified will not be part of the output even if they are dependents of a changed project (e.g. a project that imports something from a changed library but does not have any tests and therefore no test-command)                                                                                                                                                                                     |
| `--save-visualization`                                                  | `visualize`    |          | Instead of serving the visualization, it will save the generated html in `.yanice-output` (see options)                                                                                                                                                                                                                                                                                                                                                 |
| `--renderer=dagre/vizjs`                                                | `visualize`    | `dagre`  | Will choose the renderer, available are [dagre](https://github.com/dagrejs/dagre) and [vizjs](https://github.com/mdaines/viz.js).                                                                                                                                                                                                                                                                                                                       |

With
the [configuration from above](https://github.com/abuob/yanice/blob/master/src/__fixtures/readme-example-yanice.json),
we could run the following commands:

-   `yanice visualize test --rev=HEAD`: Will create a visualization of the graph like in
    the [depiction above](https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png).
-   `yanice run lint --branch=master --concurrency=3`: Run all lint-commands of all projects that have changed compared to
    the master branch,
    include uncommitted changes (default), run 3 commands in parallel (default: 1).
-   `yanice output-only lint --branch=master`: Same as above, but instead of running the commands, the projects
    on which lint-commands would be executed are printed to the console.
-   `yanice output-only test --branch=master --responsibles`: Print all responsibles. Note that we have to provide a
    scope (here: test)
    in order to create the dependency graph.
    Yanice will collect all responsibles of the projects that are either directly changed or affected by changes, and log
    them to the console.
    Note that the project does not need to have a command for the used scope; its responsibles are still included.

### Options

Options are defined in the `yanice.json` and can be defined as global defaults and on a per-scope-basis.

<table>
    <tr>
        <th>Options</th>
        <th>Allowed</th>
        <th>Default</th>
        <th>Effect</th>
    </tr>
    <tr>
        <td><code>commandOutput</code></td>
        <td><code>ignore</code>, <code>append-at-end</code>, <code>append-at-end-on-error</code></td>
        <td><code>ignore</code></td>
        <td>How to treat the stdin/stdout of the executed commands. On <code>ignore</code>, only a list of all commands and whether they succeeded or not will be displayed. Otherwise, the output will be appended as defined.</td>
    </tr>
    <tr>
        <td><code>outputFilters</code></td>
        <td>Array of: <code>npmError</code>, <code>karmaProgressSuccess</code>, <code>ignoreStderr</code>, <code>ignoreStdout</code></td>
        <td><code>[]</code></td>
        <td>Will filter out the command-outputs on a line-by-line basis. Only relevant if <code>commandOutput</code> is not <code>ignore</code>. Mostly quality-of-life to reduce noise; e.g. <code>npmError</code> will strip away the standard <code>npm ERR <..></code>-block.</td>
    </tr>
    <tr>
        <td><code>outputFolder</code></td>
        <td>A filepath relative to the <code>yanice.json</code></td>
        <td><code>./.yanice-output</code></td>
        <td>Only relevant in combination with the <code>--save-visualization</code>-parameter</td>
    </tr>
    <tr>
        <td><code>port</code></td>
        <td>Any available port number</td>
        <td><code>4567</code></td>
        <td>Only relevant in combination with the <code>--visualize</code>-parameter</td>
    </tr>
</table>

## Plugins

As a design choice, yanice itself will never read any file in the repository except for the `yanice.json`.
Therefore, tasks like automatically creating dependency-trees based on imports or asserting that declared dependencies
are not violated
is not possible from within yanice. However, plugins which are invoked by yanice do not have this limitation.

The general idea is that when yanice is run with `yanice plugin:some-plugin ...`, yanice will run its usual steps,
but in the end invoke the selected plugin and forward all data that has so far been calculated into the plugin.

### Officially supported plugins

| Name              | npm-package                                                                                  | source code                                                                                          | Purpose                                                                                                                                                                                                                                                                               |
| :---------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| import-boundaries | [link](https://www.npmjs.com/package/@yanice/import-boundaries): `@yanice/import-boundaries` | [packages/import-boundaries](https://github.com/abuob/yanice/tree/master/packages/import-boundaries) | Helps to bridge the gap between the dependencies declared in the `yanice.json` and the _actual_ dependencies as per imports. Currently supports import-detection for javascript/typescript, but allows for custom import-resolvers which take a file and map it to the found imports. |

### Custom plugins

Custom plugins are javascript-files which yanice can require. See [here](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/yanice.json) for configuration, [here](https://github.com/abuob/yanice/blob/master/integration-tests/test-project/custom-scripts/dummy-plugin.ts) for a custom (untranspiled) plugin example.

### Dependencies

Yanice tries to work with as few dependencies as possible, currently relying only on the following dependencies:

| Name      | npm-package                                     | Purpose                                               |
| :-------- | ----------------------------------------------- | ----------------------------------------------------- |
| ajv       | [link](https://www.npmjs.com/package/ajv)       | Used for JSON-schema validation of the `yanice.json`. |
| minimatch | [link](https://www.npmjs.com/package/minimatch) | Used for glob-expression matching.                    |

### Roadmap:

-   Built-in incremental change-detection: Currently, if you run the same yanice-command twice (e.g. test), yanice will
    execute all commands again, even if there are no changes
    compared to the previous run. Store metadata about the last execution so that yanice will not run obviously redundant
    commands.
