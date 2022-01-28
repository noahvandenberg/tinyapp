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

const errorMessageGenerator = (errorCode) => {
  const errorCodes = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found'
  }
  return errorCodes[errorCode]
}

const generateRandomString = () => {
  return Math.random().toString(36).slice(7);
};

const parseURL = (input) => {
  const httpCheck = input.split('').splice(0,7).join('')
  if (httpCheck === 'http://') {
    return input
  }
  const wwwCheck = input.split('').splice(0,4).join('')
  if (wwwCheck === 'www.') {
    return `http://${input}`
  }
  if (input) {
    return `http://www.${input}`
  }
}

const validUser = (user,database) =>{
  return database.hasOwnProperty(user)
}

const validUserIsAllowed = (user,userDatabase,urlID,urlDatabase) => {
}

module.exports = {
  getUserByEmail,
  getUrlsByUser,
  createAdminUser,
  errorMessageGenerator,
  generateRandomString,
  parseURL,
  validUser,
  validUserIsAllowed,
}