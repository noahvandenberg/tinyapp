const getUserByEmail = (email,database) => {
  for (const data in database) {
    if (database[user].email === email) {
      return data
    }
  }
}

module.exports = {
  getUserByEmail,
}