import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const dir = path.dirname(fileURLToPath(import.meta.url))
const tokensPath = path.join(dir, '../src/styles/tokens.json')
const outPath = path.join(dir, '../src/styles/_tokens.generated.scss')

const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))

function toLines(node, prefix) {
  const lines = []
  for (const [key, value] of Object.entries(node)) {
    if (key === '_comment') continue
    const name = prefix ? `${prefix}-${key}` : key
    if (value && typeof value === 'object') {
      lines.push(...toLines(value, name))
    } else {
      lines.push(`$${name}: ${value};`)
    }
  }
  return lines
}

const lines = Object.entries(tokens)
  .filter(([key]) => key !== '_comment')
  .flatMap(([category, values]) => toLines(values, category))

const output = `// Generated from tokens.json by scripts/generate-tokens.mjs — do not edit directly.\n\n${lines.join('\n')}\n`

writeFileSync(outPath, output)
console.log(`Generated ${lines.length} tokens -> src/styles/_tokens.generated.scss`)
