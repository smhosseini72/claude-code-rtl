# Contributing

Thanks for helping make Claude Code readable in right-to-left languages!
مشارکت به فارسی هم با کمال میل پذیرفته میشه.

## Reporting text that still looks wrong

The most useful report is a small example. Please open a
[bug report](https://github.com/smhosseini72/claude-code-rtl/issues/new?template=bug_report.yml) with:

- the exact text (copy it, don't only screenshot it, so invisible characters survive),
- a screenshot of how it looks,
- your Claude Code version (`claude --version`), OS, and where you saw it
  (desktop app, VS Code, ...).

## Working on the code

1. Fork and clone the repository.
2. Install your clone in Claude Code:

   ```bash
   claude plugin install rtl-text --marketplace ./claude-code-rtl
   ```

3. Make your change. Direction detection and marking live in
   [`hooks/bidi.ts`](hooks/bidi.ts); the hooks and the `/rtl` command live in
   [`hooks/register.ts`](hooks/register.ts).
4. Add a test for it in [`tests/rtl.test.ts`](tests/rtl.test.ts), then run:

   ```bash
   claude plugin validate .
   claude plugin test .
   ```

5. Open a pull request describing what changed and why, with a before/after
   screenshot if the change is visible.

## Style

- Keep it dependency-free, with no network and no file access.
- Match the surrounding code: small functions, clear names, comments that say why.
- Use LF line endings (the repository's `.gitattributes` takes care of this).
