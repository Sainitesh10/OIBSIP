import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey12345!', {
    expiresIn: '30d',
  });
};

export default generateToken;
