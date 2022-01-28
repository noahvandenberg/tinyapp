const getUserByEmail = (email,database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return user
    }
  }
}

const getUrlsByUser = (user,database) => {
  const usersUrls = {}
  for (const url in database) {
    if (database[url].userID === user) {
      usersUrls[url] = database[url]
    }
  }
  return usersUrls
}

const createAdminUser = (bcrypt) => {
  const admin = {
    id: "admin",
    email: "noah@v.com",
    password: bcrypt.hashSync("a", 10)
  }
  return admin
};


module.exports = {
  getUserByEmail,
  getUrlsByUser,
  createAdminUser,
}