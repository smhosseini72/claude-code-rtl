// Marks right-to-left lines of markdown with a Unicode isolate (RLI, U+2067).
// A renderer that lays every block out left-to-right then still orders the
// words, punctuation and embedded English of a Persian, Arabic or Hebrew
// paragraph the way a reader expects. What the text says is unchanged.

import type { Direction } from '../types'

const LRI = '\u2066'
const RLI = '\u2067'
const PDI = '\u2069'
const RLM = '\u200F'

const RTL_LETTER =
  /[\u05D0-\u05F2\u0620-\u064A\u066E-\u06D5\u06EE\u06EF\u06FA-\u06FF\u0700-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/
const LTR_LETTER = /[A-Za-z\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF]/

// A line that already opens with an explicit bidi mark is left as written.
const BIDI_MARK = /^[\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/

// Arabic-script punctuation and digits turn up only in RTL prose.
const RTL_SIGN = /[\u060C\u061B\u061F\u0660-\u0669\u06F0-\u06F9]/

// What a reader does not read as words of the sentence: code spans, link
// targets, bare URLs and HTML tags.
const NOT_PROSE = /`[^`]*`|\]\([^)]*\)|https?:\/\/\S+|<[^>]+>/g

// A colon or Arabic comma right after an English word or a digit joins it to
// the English after it ("PR ۱: merge شد" draws as "شد PR ۱: merge"); an RLM
// after it keeps them apart. It goes before a closing ** or _ so emphasis
// still closes.
const JOINING_PUNCTUATION =
  /(?<=[A-Za-z0-9\u00C0-\u024F\u0370-\u03FF\u0400-\u04FF\u0660-\u0669\u06F0-\u06F9])([:\u060C\u061B])(?=(?:\*{1,2}|_{1,2})?\s)/g
// A number a reader takes as one left-to-right unit, which the bidi
// algorithm splits in RTL text: a signed number ("-5" draws as "5-") and a
// phone number in spaced groups ("+98 912 123 4567" draws reversed). Each
// goes in a left-to-right isolate.
const NUMBER_UNIT =
  /(?<=^|[\s(])(?:\+[0-9\u0660-\u0669\u06F0-\u06F9]{1,4}(?:[ -][0-9\u0660-\u0669\u06F0-\u06F9]{1,5})+|[0-9\u0660-\u0669\u06F0-\u06F9]{2,}(?: [0-9\u0660-\u0669\u06F0-\u06F9]{2,}){2,}|[-+\u2212][0-9\u0660-\u0669\u06F0-\u06F9]+(?:[.,\u066B][0-9\u0660-\u0669\u06F0-\u06F9]+)*%?)/g

// What a fix never reaches into: code spans, link targets and URLs.
const PROTECTED = /(`[^`]*`|\]\([^)]*\)|https?:\/\/\S+)/

const FENCE = /^[ \t]*(`{3,}|~{3,})/
const QUOTE = /^[ \t]*>[ \t]?/
const LIST_ITEM = /^[ \t]*(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[[ xX]\][ \t]+)?/
const HEADING = /^[ \t]*#{1,6}[ \t]+/
const INDENT = /^[ \t]*/
const TABLE_ROW = /^[ \t]*\|/
const TABLE_CELL = /(\|[ \t]*)((?:\\\||`[^`]*`|[^|`])+)/g

function directionOf(ch: string): Direction | undefined {
  if (RTL_LETTER.test(ch)) {
    return 'rtl'
  }

  return LTR_LETTER.test(ch) ? 'ltr' : undefined
}

function isDirection(dir: Direction | undefined): dir is Direction {
  return dir !== undefined
}

function directionsOf(text: string): Direction[] {
  return [...text].map(directionOf).filter(isDirection)
}

/**
 * Whether a line reads right-to-left. Persian and Arabic sentences often open
 * or close with an English word ("PR ۱: merge شد"), so once a line has RTL
 * letters any one of these is enough: its first or last letter is RTL, at
 * least half its words are RTL, or it uses Arabic-script digits or punctuation.
 */
export function isRtl(text: string): boolean {
  const prose = text.replace(NOT_PROSE, ' ')
  const letters = directionsOf(prose)

  if (!letters.includes('rtl')) {
    return false
  }

  const words = prose
    .split(/\s+/)
    .map(word => directionsOf(word)[0])
    .filter(isDirection)
  const rtlWords = words.filter(dir => dir === 'rtl').length

  return (
    letters[0] === 'rtl' ||
    letters.at(-1) === 'rtl' ||
    rtlWords * 2 >= words.length ||
    RTL_SIGN.test(prose)
  )
}

/**
 * Splits a markdown line into its block markers (indent, `>`, list bullet,
 * checkbox, `#`) and the text after them, where the isolate goes.
 */
function splitPrefix(line: string): [string, string] {
  let at = 0

  for (;;) {
    const rest = line.slice(at)
    const marker = QUOTE.exec(rest) ?? LIST_ITEM.exec(rest)

    if (marker) {
      at += marker[0].length
      continue
    }

    at += (HEADING.exec(rest) ?? INDENT.exec(rest) ?? [''])[0].length

    return [line.slice(0, at), line.slice(at)]
  }
}

/**
 * Keeps English and number runs where a reader expects them: an RLM after a
 * colon or Arabic comma that ends an English word or a number, and signed or
 * phone numbers in a left-to-right isolate. Protected parts (code spans, link
 * targets, URLs) land at odd indexes of the split and are left alone.
 */
function separateRuns(text: string): string {
  return text
    .split(PROTECTED)
    .map((part, at) =>
      at % 2 === 1
        ? part
        : part
            .replace(JOINING_PUNCTUATION, `$1${RLM}`)
            .replace(NUMBER_UNIT, number => LRI + number + PDI),
    )
    .join('')
}

function mark(text: string, isClosed: boolean): string {
  if (BIDI_MARK.test(text) || !isRtl(text)) {
    return text
  }

  const body = text.trimEnd()
  const tail = text.slice(body.length)

  return RLI + separateRuns(body) + (isClosed ? PDI : '') + tail
}

function markLines(text: string, isClosed: boolean): string {
  let fence: string | undefined

  return text
    .split('\n')
    .map(line => {
      const fenced = FENCE.exec(line)?.[1]

      if (fence !== undefined) {
        const isClose =
          fenced !== undefined &&
          fenced[0] === fence[0] &&
          fenced.length >= fence.length &&
          line.trim() === fenced

        if (isClose) {
          fence = undefined
        }

        return line
      }

      if (fenced !== undefined) {
        fence = fenced

        return line
      }

      if (TABLE_ROW.test(line)) {
        return line.replace(TABLE_CELL, (_, open: string, cell: string) => open + mark(cell, true))
      }

      const [prefix, rest] = splitPrefix(line)

      return prefix + mark(rest, isClosed)
    })
    .join('\n')
}

/**
 * For a reply's markdown: each RTL line opens an isolate the block closes,
 * so a paragraph written over several lines nests and still reads in order.
 */
export function markRtlMarkdown(text: string): string {
  return markLines(text, false)
}

/**
 * For text drawn line by line (a prompt as typed): each RTL line is its own
 * closed isolate.
 */
export function markRtlPlain(text: string): string {
  return markLines(text, true)
}
