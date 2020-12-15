// import jwt from 'jsonwebtoken';
// import { NextFunction, Request, Response } from 'express';
// import config from '@app/config';
// import mysql from '@app/storage/mysql';
// async function authMiddleware(request: Request, response: Response, next: NextFunction) {
//   const token = (request.body && request.body.access_token)
//   || (request.query && request.query.access_token)
//   || request.headers['x-access-token'] || request.headers.authorization;
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, config.app.secret);
//       request.decoded = decoded;
//     } catch (error) {
//       response.status(401).json({ status: 401, message: 'Invalid token' });
//       return;
//     }
//     try {
//       const query = mysql.query();
//       const results = await query(
//         'select 1 from users where userID = ? and username = ? order by username limit 1',
//         [request.decoded.userID, request.decoded.username],
//       );
//       if (!results.length) {
//         response.status(403).json({ status: 403, message: 'Forbidden' });
//         return;
//       }
//       next();
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     response.status(401).json({ status: 401, message: 'No token provided' });
//   }
// }
// export default authMiddleware;
//# sourceMappingURL=authentication.js.map