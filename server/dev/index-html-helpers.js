const path = require('path')

module.exports = ({ wdm, config }) => {
  // Get dev index.html file (from the template)
  const getIndexHtml = () => wdm.fileSystem.readFileSync(path.join(config.output.path, 'index.html'), 'utf8')

  // Get index.html file with HEAD items injected
  const getIndex = (...args) => {
    const headHtml = args.map(arg => {
      if (typeof arg === 'string') {
        return arg
      }
      if (typeof arg === 'object' && arg) {
        const vars = Object.entries(arg)
        if (vars.length > 0) {
          return `<script>\n${vars.map(([key, val]) => (
            `const ${key} = ${JSON.stringify(val, null, 2)}\n`
          )).join('')}</script>`
        }
      }
    }).filter(String).join('\n')
    return getIndexHtml().replace('<!-- HEAD_INJECT -->', headHtml || '<!-- NO HEAD HTML -->')
  }

  return { getIndexHtml, getIndex }
}
