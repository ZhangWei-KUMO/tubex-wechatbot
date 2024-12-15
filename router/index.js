const noAuthRequiredRoutes = ['/api/login','/login', '/register', '/forgot-password']; //  不需要授权的路径列表

export const AUTH_CONFIG = {
    secret: 'tubexchatbot', 
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000 
    }
  }
export function isAuthenticated(req, res, next) {
    if (noAuthRequiredRoutes.includes(req.path) || (req.session && req.session.user)) {
       next();
    } else {
      res.redirect('/login');
    }
  }