const createCookie = (cookieName, cookieValue, cookieAge, res) => {
  res.cookie(cookieName, cookieValue, {
    httpOnly: true,
    maxAge: cookieAge,
  });
};

module.exports = createCookie;
