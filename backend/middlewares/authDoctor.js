import jwt from 'jsonwebtoken';

const authDoctor = async (req, res, next) => {
    try {
        let dtoken = req.headers.dtoken;
        if (!dtoken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            dtoken = req.headers.authorization.split(' ')[1];
        }

        if (!dtoken) {
            return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
        }

        const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
        const decoded = jwt.verify(dtoken, secret);
        req.docId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token Expired', isExpired: true });
        }
        return res.status(401).json({ success: false, message: 'Not Authorized, Login Again' });
    }
};

export default authDoctor;