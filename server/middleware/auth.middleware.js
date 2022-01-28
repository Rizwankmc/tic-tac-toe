import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ msg: "Unauthorized" });
    }
    const { userId } = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.userId = userId;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ msg: "Unauthorized" });
  }
};

export default auth;
