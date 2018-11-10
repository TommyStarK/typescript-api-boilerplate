function authMiddleware(request, response, next) {
  console.log('Auth middleware...');
  next();
}


export {authMiddleware};