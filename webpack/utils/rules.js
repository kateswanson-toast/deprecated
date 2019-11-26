const { find } = require('object-deep-search')

const ruleAdjuster = rules => (filterFn, adjustFn) => {
  const found = find(rules, r => r && filterFn(r))
  if (found.length === 0) {
    throw new Error('No rules found!')
  }
  found.forEach(adjustFn)
}

const ensureRegex = (re, str) => re instanceof RegExp && re.test(str)

module.exports = {
  ruleAdjuster,
  ensureRegex
}
