const isArray = (a) => Array.isArray(a)

const isObject = (o) => o === Object(o) && !isArray(o) && typeof o !== "function"

const toCamelCase = (s) => s.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace("-", "").replace("_", ""))

const convertToCamelCase = (o) => {
  if (isObject(o) && Object.keys(o).length) {
    const n = {}

    Object.keys(o).forEach((k) => {
      n[toCamelCase(k)] = convertToCamelCase(o[k])
    })

    return n
  }
  if (isArray(o)) {
    return o.map((i) => convertToCamelCase(i))
  }

  return o
}

module.exports = convertToCamelCase
