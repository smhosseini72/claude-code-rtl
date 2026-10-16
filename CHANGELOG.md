# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-10-16

### Added

- Right-to-left display of Persian (Farsi), Arabic and Hebrew paragraphs in
  Claude's replies and in your own prompts, using a Unicode isolate (U+2067).
- Markdown-aware marking: headings, lists, checklists, quotes and table cells;
  fenced code blocks are never changed.
- Direction detection that ignores code spans, URLs and link targets, and
  handles sentences that start with an English word.
- `/rtl`, `/rtl on` and `/rtl off` to toggle the display; the choice is kept
  across sessions.

[0.1.0]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.0
