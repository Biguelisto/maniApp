function Do() {
    try {
        require("../osuapi")
        return true
    } catch {
        return false
    }
}
module.exports = {
    Do
}