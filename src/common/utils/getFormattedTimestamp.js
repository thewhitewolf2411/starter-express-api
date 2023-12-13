const { format } = require("date-fns")

const getFormattedTimestamp = (timestamp) => format(timestamp, "yyyy-MM-dd HH:mm:ss.SSS")

module.exports = getFormattedTimestamp
