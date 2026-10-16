import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { markRtlMarkdown, markRtlPlain } from './bidi'

const isOn = atom({ plugin: 'rtl-text', key: 'isOn' } as const, true)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'rtl',
      description: 'Turn right-to-left display of Persian, Arabic and Hebrew on or off',
      argumentHint: '[on|off]',
      immediate: true,
    })

    const saved = await $.store.get('isOn')

    if (typeof saved === 'boolean') {
      await update($, isOn, () => saved)
    }

    return next(e)
  })

  on('command.run', { command: 'rtl' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    const want = arg === 'on' ? true : arg === 'off' ? false : !(await read($, isOn))

    await update($, isOn, () => want)
    await $.store.set('isOn', want)

    return { text: want ? 'RTL display is on.' : 'RTL display is off.' }
  })

  // The terminal draws cells in place, so an isolate there helps only where
  // the terminal itself runs the bidi algorithm; it is left as the engine has it.
  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    if (e.surface === 'terminal' || !(await read($, isOn))) {
      return next(e)
    }

    const text = markRtlMarkdown(e.props.text)

    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    if (e.surface === 'terminal' || !(await read($, isOn))) {
      return next(e)
    }

    const text = markRtlPlain(e.props.text)

    return text === e.props.text ? next(e) : next({ ...e, props: { ...e.props, text } })
  })
}
