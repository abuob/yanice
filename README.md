# Yanice

Yanice (_yet another incremental command executor_) takes care of change detection and incremental builds/command execution within a git-based monorepository.

In it's current form, yanice offers the following functionalities: 

* Definition of projects within the repository (entire directories, certain files, certain file types...)
* Definition of dependency trees for various 'scopes' (e.g. test, e2e, linting, build...)
* Change detection between working tree and a given branch
* Automatic execution of commands on changed projects and all projects that are affected by those changes, as defined
by dependency graphs
* Responsibles: E.g. for review purposes, define responsibles per project/repo-part. Yanice can calculate all responsibles
that are affected by changes.

Assumptions:
* The dependencies between the projects inside the repository can be modeled as a directed acyclic graph (DAG)
* This DAG is known and is described in a `yanice.json`-file

### Example
Say your repository consists of three projects P1, P2, P3 and two libraries, lib-123 which is used by P1, P2, P3;
and lib-12 which is only used by P1, P2. 

Let's assume there is a `yanice.json`-file at the root of the repository as provided at the end of this file. A few example commands:
* `yanice lint --branch=master --includeUncommitted=true --concurrency=3`: Run all lint-commands of all projects that have changed compared to the master branch,
include uncommitted changes, run 3 commands in parallel (default: 1). If a file in P1 is changed, only P1 is linted as defined by the lint-scope.
* `yanice lint --branch=master --includeUncommitted=true --outputOnly=true`: Same as above, but instead of running the commands, the projects
on which lint-commands would be executed are printed to the console
* `yanice lint --branch=master --includeUncommitted=true --responsibles`: Print all responsibles. Note that we have to provide a scope (here: lint)
in order to create the dependency graph. In this case, as per definition of the lint-scope, only responsibles of directly changed projects will be included.
If you want to e.g. include responsibles of dependent projects (e.g. to approve changes in a library that they consume), this can be achieved
by providing a different scope.
* `yanice test --branch=master --includeUncommitted=true --concurrency=3`: Let's assume there is a changed file in lib-123. Since P1, P2, P3 all depend on lib-123
as defined in the test-scope, test-commands would be executed on all of these. However, there is no 'test'-command defined for P2/P3, these are therefore
skipped.
* `yanice test --branch=master --includeUncommitted=true --outputOnly=true --includeCommandSupportedOnly=false`: Only output the projects,
and also include affected projects that do not actually support the 'test'-command. "--includeCommandSupportedOnly=false" has only an effect
in combination with "--outputOnly=true".

### Upcoming features:
* Currently, yanice can only detect changes between the current HEAD (or the working tree including uncommitted changes).
Add "main-branch" (e.g. develop, master) support: Add options to incrementally detect changes on "main-branches" to reduce CI-overhead (incremental builds).
Not sure yet if/how this can be achieved - one idea is to add git-notes to commits with metadeta about run commands. 

### Example yanice.json:
A few words on the structure:
* Projects are defined by a glob and/or a regExp. Both are applied to any changed file to determine if it's part of the project. If the glob/regExp
is not provided, it matches any file (i.e., if you do not provide either, a project consists of all files in the repo).
* Files can be part of multiple projects
* Commands and responsibles are optional. Commands have an optional "cwd"-property, if it is provided the command will be executed in that
directory, otherwise in the same directory as the yanice.json.
```
{
  "projects": [
    {
      "projectName": "P1",
      "pathGlob": "path/to/dir/P1/**",
      "commands": {
        "lint": {
          "command": "npm run lint-P1"
        },
        "test": {
          "command": "npm run test-P1",
          "cwd": "path/to/dir/P1"
        }
      },
      "responsibles": [
        "Alice"
      ]
    },
    {
      "projectName": "P2",
      "pathGlob": "path/to/dir/P2/**",
      "pathRegExp": "path/to/dir/P2",
      "commands": {
        "lint": {
          "command": "npm run lint-P2",
          "cwd": "path/to/dir/P2"
        }
      },
      "responsibles": [
        "Bob"
      ]
    },
    {
      "projectName": "P3",
      "pathRegExp": "path/to/dir/P3",
      "commands": {
        "lint": {
          "command": "npm run lint-P2",
          "cwd": "path/to/dir/P2"
        }
      },
      "responsibles": [
        "Harry"
      ]
    },
    {
      "projectName": "lib-123",
      "pathRegExp": "libs/lib-123",
      "commands": {
        "lint": {
          "command": "npm run lint-123"
        },
        "test": {
          "command": "npm run test-lib-123",
          "cwd": "libs/lib-123"
        },
      },
      "responsibles": [
        "David"
      ]
    },
    {
      "projectName": "lib-12",
      "pathRegExp": "libs/lib-12",
      "commands": {
        "lint": {
          "command": "npm run lint-lib-12"
        },
        "test": {
          "command": "npm run test-lib-12",
          "cwd": "libs/lib-12"
        },
      },
      "responsibles": [
        "Alice",
        "Bob",
        "Harry"
      ]
    }
  ],
  "dependencyScopes": {
    "test": {
      "P1": [
        "lib-123, lib-12"
      ],
      "P2": [
        "lib-123, lib-12"
      ],
      "P3": [
        "lib-123"
      ],
      "lib-123": [],
      "lib-12": []
    },
    "lint": {
      "P1": [],
      "P2": [],
      "P3": [],
      "lib-123": [],
      "lib-12": []
    }
  }
}
```
