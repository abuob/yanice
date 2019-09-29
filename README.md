### [WORK IN PROGRESS]

# yanice - "yet another incremental command executor"

yanice takes care of change detection and incremental builds/command execution within a git-based monorepository.

In it's current form, yanice offers the following functionalities: 

* Definition of projects and their source-roots within the repository
* Definition of dependency trees for various 'scopes' (e.g. test, e2e, linting, build...)
* Change detection between working tree and a given branch; affected projects per 'scope'

Assumptions:
* The dependencies between the projects inside the repository can be modeled as a directed acyclic graph (DAG)
* This DAG is known and is described in a `yanice.json`-file

### Example (this should currently work already)
Say your repository consists of three projects P1, P2, P3 and two libraries, lib-123 which is used by P1, P2, P3;
and lib-12 which is only used by P1, P2. 

Create a `yanice.json`-file on the root-level of the repository as follows:
```
{
  "projects": [
    {
      "projectName": "P1",
      "pathRegExp": "path/to/dir/P1"
    },
    {
      "projectName": "P2",
      "pathRegExp": "path/to/dir/P2"
    },
    {
      "projectName": "P2",
      "pathRegExp": "path/to/dir/P2"
    },
    {
      "projectName": "lib-123",
      "pathRegExp": "libs/lib-123"
    },
    {
      "projectName": "lib-12",
      "pathRegExp": "libs/lib-12"
    }
  ],
  "dependencyScopes": {
    "test": {
      "P1": ["lib-123, lib-12"],
      "P2": ["lib-123, lib-12"],
      "P3": ["lib-123"],
      "lib-1": [],
      "lib-2": []
    },
    "lint": {
      "P1": [],
      "P2": [],
      "P3": [],
      "lib-1": [],
      "lib-2": []
    }
  }
}
```

Now let's assume you're currently doing some coding and would like to know what exactly you need to test. 
A command such as `yanice test --branch=master` should, as per definition above, list all projects affected by your changes (compared to the `master`-branch),
so if you for example make a change to lib-12 it should return lib-12, P1, P2, P3 (topologically sorted). 
If you change P1, only P1 is returned as nothing depends on P1.

If you execute `yanice lint --branch=master`, only projects that were effectively changed compared to the `master`-branch are returned
as you do not care about dependencies for linting. So if you change e.g. lib-123 and P1, only lib-123 and P1 should be returned.

### Upcoming features:
* Support reflexive/irreflexive scopes: In some cases, you might want to only see dependants, not the changed project itself (e2e comes to mind)
* Responsibles/Reviewers per project: If you change something, you might want to know who's responsible for e.g. reviewing and merge approvals
* Actual incremental command execution: Add commands per scope, which can be executed on all affected projects. 
Store metadata about execution to allow for incremental iterations
* Add "main-branch" (e.g. develop, master) support: Add options to incrementally detect changes on "main-branches" to reduce CI-overhead (incremental builds)
