import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        let token = req.headers.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token Expired', isExpired: true });
        }
        return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
    }
};

export default authUser;