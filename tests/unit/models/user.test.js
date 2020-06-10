const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

const { User } = require('../../../models/user');

describe('User.generateAuthToken', () => {
  it('Should return a valid JWT.', () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true,
    };
    const user = new User(payload);
    const token = user.generateAuthToken();
    const decoded = jwt.verify(token, config.get('JWT_KEY'));
    expect(decoded).toMatchObject(payload);
  });
});
