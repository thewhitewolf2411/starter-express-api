const classes = {}

class ClassRegistry {
  register(className, toBeRegistered) {
    classes[className] = toBeRegistered
  }

  get(className) {
    return classes[className]
  }
}

const classRegistry = new ClassRegistry()

module.exports = classRegistry
