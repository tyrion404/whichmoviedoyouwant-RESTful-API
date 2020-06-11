const request = require('supertest');
const mongoose = require('mongoose');

const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');

let server;

describe('/api/genres', () => {
  beforeEach(() => {
    server = require('../../../index');
  });
  afterEach(async () => {
    await Genre.remove({});
    await server.close();
  });

  describe('GET /', async () => {
    await it('Should return all genres.', async () => {
      await Genre.collection.insertMany([
        {
          name: 'dark',
        },
        {
          name: 'romance',
        },
        {
          name: 'rom-com',
        },
      ]);
      const res = await request(server).get('/api/genres');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body.some((g) => g.name === 'dark')).toBeTruthy();
      expect(res.body.some((g) => g.name === 'romance')).toBeTruthy();
      expect(res.body.some((g) => g.name === 'rom-com')).toBeTruthy();
    });
  });

  describe('GET /:id', () => {
    it('Should return a genre if valid id is passed.', async () => {
      const genre = new Genre({
        name: 'dark',
      });
      await genre.save();
      const res = await request(server).get(`/api/genres/${genre._id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', genre.name);
    });

    it('Should return 500 if invalid id is passed.', async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(500);
    });

    it('Should return 404 coz the genre with the given ID was not found.', async () => {
      const res = await request(server).get(
        `/api/genres/${mongoose.Types.ObjectId()}`
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;

    const sendReq = async () => {
      return await request(server)
        .post('/api/genres')
        .set('x-auth-token', token)
        .send({
          name,
        });
    };

    beforeEach(() => {
      name = 'dark';
      token = new User().generateAuthToken();
    });

    it('Should return 401 if not logged in.', async () => {
      token = '';
      const res = await sendReq();
      expect(res.status).toBe(401);
    });

    it('Should return 400 if genre is invalid <3 char.', async () => {
      name = 'a';
      const res = await sendReq();
      expect(res.status).toBe(400);
    });

    it('Should return 400 if genre is invalid >50 char.', async () => {
      name = new Array(52).join('-');
      const res = await sendReq();
      expect(res.status).toBe(400);
    });

    it('Should save the genre.', async () => {
      const res = await sendReq();
      expect(res.status).toBe(200);

      const genre = await Genre.findOne({ name: 'dark' });
      expect(genre).not.toBeNull();
    });

    it("Should return the genre if it's valid.", async () => {
      const res = await sendReq();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'dark');
    });
  });
});
