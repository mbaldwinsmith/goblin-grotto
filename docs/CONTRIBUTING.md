# Development

Use Node 24, `npm ci`, then `npm run dev`. Run `npm run typecheck`,
`npm run lint`, `npm run format:check`, `npm test`, and `npm run build`.
Browser checks: `npx playwright install chromium`, `npm run test:browser`.

Protect main on GitHub: require pull requests and the quality job, disable force
pushes and branch deletion. Repository settings must be configured by an owner;
a workflow alone cannot enforce branch protection. Preserve one task per commit
where possible and include PLAN and CHANGELOG bookkeeping.
