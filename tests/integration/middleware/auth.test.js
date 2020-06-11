const request = require('supertest');

const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');

let server;

describe('Auth middleware.', () => {
  let genreName;
  let token;

  const sendReq = async () => {
    return await request(server)
      .post('/api/genres')
      .set('x-auth-token', token)
      .send({
        name: genreName,
      });
  };

  beforeEach(() => {
    server = require('../../../index');
    genreName = 'dark';
    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await Genre.remove({});
    server.close();
  });

  it('Should return 401 if no token provided', async () => {
    token = '';
    const res = await sendReq();
    expect(res.status).toBe(401);
  });

  it('Should return 400 if invalid token provided', async () => {
    token = 'NA';
    const res = await sendReq();
    expect(res.status).toBe(400);
  });

  it('Should return 200 if valid token provided', async () => {
    const res = await sendReq();
    expect(res.status).toBe(200);
  });
});
