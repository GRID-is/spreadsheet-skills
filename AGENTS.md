# Working on this repo

See [CLAUDE.md](CLAUDE.md). The rules there apply to every coding agent, not only Claude: check the
other skills when you change a shared fact in one, never write an API that is not in the installed
package's type definitions, keep frontmatter descriptions search-first, no em dashes, and run
`npm run sync` and `npm run lint` before opening a pull request. Code fences marked `js setup`,
`js run` or `js standalone` are executed by `npm run test:examples`, so keep those markers when
editing an example.
