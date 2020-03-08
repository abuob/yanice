# Yanice

Yanice (_yet another incremental command executor_) takes care of change detection and incremental builds/command execution within a git-based monorepository.
It lets you define various dependency graphs for different "scopes" (e.g. build, test, lint...) to model the dependencies between your projects,
detects changes between the current working tree and e.g. another commit, and lets you execute commands depending on those changes and the dependency graphs you defined.

For example, a repository with two projects and two libraries might be modeled as follows:

<p align="center">
  <img alt="yanice-visualization-example" src="https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png">
</p>

### Assumptions & Caveats:
* The dependencies between the projects inside the repository can be modeled as a [directed acyclic graph](https://en.wikipedia.org/wiki/Directed_acyclic_graph) (DAG)
* This DAG is known and is described in a `yanice.json`-file
* Yanice will _not_ read any file inside the repository (except its configuration - the aforementioned `yanice.json`)
* Yanice will therefore _not_ automatically detect dependencies via, for example, detecting imports. Enabling this via optional plugins is on the roadmap though (see below)
* Yanice works best for small- to medium-sized repositories (<50 projects), the dependencies between the projects have to be defined manually, 
which _can_ get cumbersome with increasing size
* Due to the design philosophy of not reading/touching any files inside the repository, 
yanice can technically be used for any kind of repository, no matter the technology/languages used
* In its current form, yanice only detects changes between the current working tree (w/o uncommitted changes) and a given git-ref (commitSHA, HEAD, branch...). 
Metadata about last command executions are _not_ stored or considered in any other way. To achieve incremental builds for e.g. CI-purposes, retrieve the commit of the last successful build or e.g. the target-branch of a PR, and compare to that


## Example
### Configuration
The complete version of the `yanice.json` used for this example can be found here: [example-yanice.json](https://github.com/abuob/yanice/blob/master/src/__fixtures/readme-example-yanice.json)

The example corresponds to the graph in the picture above. `project-A` for example is defined as follows:

```
{
  "projectName": "project-A",
  "pathGlob": "project-A/**",
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
Every file in the repository that matches the given `pathGlob` (you can also use `pathRegExp` if preferred, or both) will be part of the project.
Note that the glob allows you to match any file or even no file at all: If you neither define the pathGlob nor the pathRegExp,
all files in the repository will match. Projects such as "all-js-files" or "ci-relevant-files" can easily be modeled.

A Command will be executed in the given `cwd`. A command corresponds to a scope (here: build, test, lint), for which a dependency graph is defined in the `yanice.json`. E.g. for test, the dependencies
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
If a scope is extended, all dependencies are the same as of the extended scope - except for those that are overridden (in the given example, `project-A` and `lib-1` override dependencies inherited from `build`).

### Commands
In general, commands have the following base structure: `yanice <scope> --(rev|branch|commit)=<git-rev>`

Per default, yanice will execute all commands of the selected scope along the dependency graph in topological order. The following options exist:

| Parameter  | Default | Effect |
| :------------------------------------ |----------| ------------- |
| `--rev=<git-revision>`, `--branch=<git-branch>`, `--commit=<commitSHA>` | | git-revision with which the current working tree (w/o uncommitted changes, see below) will be compared. `--rev=<..>` accepts anything that `git rev-parse` can turn into a commit-SHA. Under the hood, yanice uses `git diff --name-only` in combination with `git merge-base --octopus` to determine the changed files. Therefore, yanice needs to know the corresponding refs/git-history, this is especially relevant with regards to shallow-clone.  |
| `--output-only`, `outputOnly=false/true` | `false` | Will not execute the commands, only outputs which projects have changed/commands would be executed on.  |
| `--all` |  | Ignore all change detection and just assume every project has changed.|
| `--concurrency=n` | `1` | Will execute `n` commands in parallel |
| `--responsibles` | | Will print all responsibles of all projects that are affected by changes as per given scope. This might be useful for determining who should e.g. review a pull request |
| `--include-uncommitted`, `--includeUncommitted=true/false` | `true` | Whether to include uncommitted changes. Per default, uncommitted changes are considered, otherwise `HEAD` will be used for comparison|
| `--includeCommandSupportedOnly=true/false` | `true` | Works only in combination with `--output-only`. Per default, projects for which a command is not specified will not be part of the output even if they are dependents of a changed project (e.g. a project that imports something from a changed library but does not have any tests and therefore no test-command)|
| `--visualize` | | Will create a visualization of the graph, e.g. as in the [depiction above](https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png)|
| `--save-visualization` | | Same as `--visualize`, but will save the generated html in `.yanice-output` (see options)|
| `--renderer=dagre/vizjs` | `dagre` | Only works in combination with `--visualize`. Will choose the renderer, available are [dagre](https://github.com/dagrejs/dagre) and [vizjs](https://github.com/mdaines/viz.js). |



With the [configuration from above](https://github.com/abuob/yanice/blob/master/src/__fixtures/readme-example-yanice.json), we could run the following commands:
* `yanice test --visualize --rev=HEAD`: Will create a visualization of the graph like in the [depiction above](https://raw.githubusercontent.com/abuob/yanice/master/resources/yanice-visualize-example.png).
* `yanice lint --branch=master --concurrency=3`: Run all lint-commands of all projects that have changed compared to the master branch,
include uncommitted changes (default), run 3 commands in parallel (default: 1).
* `yanice lint --branch=master --outputOnly=true`: Same as above, but instead of running the commands, the projects
on which lint-commands would be executed are printed to the console. 
* `yanice test --branch=master --responsibles`: Print all responsibles. Note that we have to provide a scope (here: test)
in order to create the dependency graph. 
Yanice will collect all responsibles of the projects that are either directly changed or affected by changes, and log them to the console.

### Options
Options are defined in the yanice.json and can be defined as global defaults and on a per-scope-basis, see e.g. [here](https://github.com/abuob/yanice/blob/master/src/__fixtures/readme-example-yanice.json):
```
"options": {
  "outputFilters": [],
  "commandOutput": "append-at-end-on-error"
}
```

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

### Roadmap:
* Currently, maintenance/setup of the `yanice.json` can get cumbersome by an increasing/changing amount of projects inside the repository. Optional plugins that are able to detect project-dependencies
by parsing import-statements and enforce boundaries could alleviate that.
* Built-in incremental change-detection: Currently, if you run the same yanice-command twice (e.g. test), yanice will execute all commands again, even if there are no changes
compared to the previous run. Store metadata about the last execution so that yanice will not run obviously redundant commands.
