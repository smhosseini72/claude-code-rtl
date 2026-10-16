import { describe, expect, test } from 'claude-code/testing'

import { isRtl, markRtlMarkdown, markRtlPlain } from '../hooks/bidi'

const RLI = '\u2067'
const PDI = '\u2069'
const RLM = '\u200F'

describe('isRtl', () => {
  test('reads a line by its first or last letter', () => {
    expect(isRtl('سلام دنیا')).toBe(true)
    expect(isRtl('برای Claude Code Desktop App')).toBe(true)
    expect(isRtl('Claude Code سیستم افزونه داره')).toBe(true)
    expect(isRtl('**PR ۱:** merge شد.')).toBe(true)
    expect(isRtl('PR 1: merge شد')).toBe(true)
    expect(isRtl('یہ اردو ہے')).toBe(true)
    expect(isRtl('שלום עולם')).toBe(true)
  })

  test('reads a line that opens and closes in English by its words', () => {
    expect(isRtl('TypeScript و JavaScript هر دو کار می‌کنن OK')).toBe(true)
    expect(isRtl('Step ۳: run npm install و wait')).toBe(true)
    expect(isRtl('Open فایل config.json in the editor')).toBe(false)
  })

  test('leaves lines with no RTL letters alone', () => {
    expect(isRtl('---')).toBe(false)
    expect(isRtl('Hello, world')).toBe(false)
  })

  test('does not count code, link targets or URLs', () => {
    expect(isRtl('`claude plugin validate --strict` رو اجرا کن')).toBe(true)
    expect(isRtl('[سند](https://example.com/some/long/english/path)')).toBe(true)
  })
})

describe('markRtlMarkdown', () => {
  test('puts the isolate after block markers', () => {
    expect(markRtlMarkdown('## عنوان')).toBe(`## ${RLI}عنوان`)
    expect(markRtlMarkdown('- آیتم اول')).toBe(`- ${RLI}آیتم اول`)
    expect(markRtlMarkdown('  1. مورد')).toBe(`  1. ${RLI}مورد`)
    expect(markRtlMarkdown('> - [x] انجام شد')).toBe(`> - [x] ${RLI}انجام شد`)
    expect(markRtlMarkdown('**نکته:** متن')).toBe(`${RLI}**نکته:** متن`)
  })

  test('leaves English, code fences and marked lines alone', () => {
    const text = ['Hello world', '```ts', 'const x = "سلام"', '```', `${RLI}قبلا علامت خورده`].join('\n')

    expect(markRtlMarkdown(text)).toBe(text)
  })

  test('marks a line after a closed fence', () => {
    const text = ['````', '```', 'سلام', '````', 'سلام'].join('\n')

    expect(markRtlMarkdown(text).split('\n')).toEqual(['````', '```', 'سلام', '````', `${RLI}سلام`])
  })

  test('closes the isolate in each table cell', () => {
    expect(markRtlMarkdown('| نام | name |')).toBe(`| ${RLI}نام${PDI} | name |`)
    expect(markRtlMarkdown('|---|---|')).toBe('|---|---|')
  })
})

describe('markRtlMarkdown around colons and commas', () => {
  test('keeps an English label apart from the English word after it', () => {
    expect(markRtlMarkdown('- **PR ۱:** merge شد.')).toBe(`- ${RLI}**PR ۱:${RLM}** merge شد.`)
    expect(markRtlMarkdown('PR ۱: merge شد')).toBe(`${RLI}PR ۱:${RLM} merge شد`)
    expect(markRtlMarkdown('TypeScript، JavaScript و Python')).toBe(`${RLI}TypeScript،${RLM} JavaScript و Python`)
  })

  test('leaves code, times, URLs and English lines alone', () => {
    expect(markRtlMarkdown('دستور `a: b` رو بزن')).toBe(`${RLI}دستور \`a: b\` رو بزن`)
    expect(markRtlMarkdown('ساعت 10:30 شروع میشه')).toBe(`${RLI}ساعت 10:30 شروع میشه`)
    expect(markRtlMarkdown('لینک https://example.com رو باز کن')).toBe(`${RLI}لینک https://example.com رو باز کن`)
    expect(markRtlMarkdown('Note: hello world')).toBe('Note: hello world')
  })
})

describe('markRtlPlain', () => {
  test('closes each line and keeps trailing space outside', () => {
    expect(markRtlPlain('سلام  \nhello')).toBe(`${RLI}سلام${PDI}  \nhello`)
  })
})

test('a reply drawn on the desktop carries the isolates; the terminal is left alone', async ($, on) => {
  const drawn: string[] = []

  on('ui.render', { component: 'AssistantMessage' }, ($, e) => {
    drawn.push(e.props.text)
    const { Markdown } = $.ui.resolve(e)

    return Markdown({ text: e.props.text })
  })

  const props = { text: 'سلام، این یک test است.', isFirstOfReply: true }

  const desktop = await $.ui.mount({ plugin: 'rtl-text', surface: 'desktop', component: 'AssistantMessage', props })
  await desktop.unmount()
  const terminal = await $.ui.mount({ plugin: 'rtl-text', surface: 'terminal', component: 'AssistantMessage', props })
  await terminal.unmount()

  expect(drawn).toEqual([`${RLI}سلام، این یک test است.`, 'سلام، این یک test است.'])
})
