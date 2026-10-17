# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [0.1.4] - 2026-10-17

### Fixed

- Signed numbers in RTL text no longer flip: "-5" used to draw as "5-". They
  now sit in a left-to-right isolate (U+2066 … U+2069), with Persian and
  Arabic digits too.
- Phone numbers in spaced groups ("+98 912 123 4567", "0912 123 4567") no
  longer come out with their groups reversed.
- Code spans, link targets and URLs are never changed by these fixes; ranges
  ("5-10"), dates and plain numbers are left as they are.

## [0.1.3] - 2026-10-17

### Added

- Hebrew is supported again, alongside Persian (Farsi), Arabic and the other
  Arabic-script languages.

### Fixed

- A colon or Persian comma after an English word or a number no longer fuses
  the English on both sides into one run: "PR ۱: merge شد" used to draw as
  "شد PR ۱: merge". An invisible right-to-left mark (U+200F) after the
  punctuation keeps the pieces apart. Code spans, times and URLs are untouched.

## [0.1.2] - 2026-10-17

### Fixed

- Persian and Arabic sentences that open with English words, such as
  "PR ۱: merge شد", are now shown right-to-left. A line with RTL letters reads
  right-to-left when its first or last letter is RTL, when at least half its
  words are RTL, or when it uses Arabic-script digits or punctuation.

## [0.1.1] - 2026-10-17

### Changed

- Detection now covers the Arabic script only: Persian (Farsi), Arabic, Urdu,
  Kurdish (Sorani), Pashto and other languages written in it.
- The source keeps its invisible bidi characters as `\u` escapes, so the code
  shows no hidden-character warnings on GitHub.

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

[0.1.4]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.4
[0.1.3]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.3
[0.1.2]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.2
[0.1.1]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.1
[0.1.0]: https://github.com/smhosseini72/claude-code-rtl/releases/tag/v0.1.0
