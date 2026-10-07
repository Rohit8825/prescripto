import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    try {
        let atoken = req.headers.atoken;
        if (!atoken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            atoken = req.headers.authorization.split(' ')[1];
        }

        if (!atoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(atoken, secret);

        const expectedPayload = process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD;
        if (decoded !== expectedPayload && decoded.role !== 'admin' && decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
        }

        req.admin = true;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token Expired', isExpired: true });
        }
        return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
    }
};

export default authAdmin;