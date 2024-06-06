module.exports = (app, io, db) => {
    io.on("connection", function (socket) {
        console.log("connection")

        socket.on("orderCreated", (data, callback) => {
            console.log("orderCreated")
            if(callback) callback({status: "received"})
        })

        socket.on("orderAccepted", (data, callback) => {
            console.log("orderAccepted")
        })

        socket.on("orderStarted", (data, callback) => {
            console.log("orderStarted")
        })

        socket.on("orderEnded", (data, callback) => {
            console.log("orderEnded")
        })

        socket.on("disconnect", () => {
            socket.disconnect()
        })
    })
}