const bcrypt = require("bcrypt-nodejs")
const ROUNDS = 8

function generateHash (plaintextPass) {
  const hashedPassword = bcrypt.hashSync(plaintextPass, bcrypt.genSaltSync(ROUNDS), null)
  return hashedPassword
}

function isValidPassword (plaintextPassword, hashedPassword) {
  try {
    return bcrypt.compareSync(plaintextPassword, hashedPassword)
  } catch (compareError) {
    if (compareError === "Not a valid BCrypt hash.") return false
    else throw compareError
  }
}

module.exports = {generateHash, isValidPassword}
