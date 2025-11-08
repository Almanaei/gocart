const request = require('supertest');
const app = require('../../server');
const config = require('../../config');

describe('Authentication Integration Tests', () => {
  let authToken;
  let refreshToken;
  let csrfToken;
  const testUser = {
    username: 'testuser',
    password: 'Test@123',
    role: 'inspector'
  };

  beforeEach(async () => {
    const response = await request(app)
      .get('/api/csrf-token');
    csrfToken = response.body.csrfToken;
  });

  describe('User Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('CSRF-Token', csrfToken)
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'تم تسجيل المستخدم بنجاح');
      expect(response.body).toHaveProperty('userId');
    });

    it('should reject duplicate username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('CSRF-Token', csrfToken)
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('اسم المستخدم موجود بالفعل');
    });

    it('should validate password requirements', async () => {
      const weakPasswordUser = {
        ...testUser,
        username: 'testuser2',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .set('CSRF-Token', csrfToken)
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('كلمة المرور');
    });
  });

  describe('User Login', () => {
    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('CSRF-Token', csrfToken)
        .send({
          username: testUser.username,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('refreshToken');
      
      authToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('CSRF-Token', csrfToken)
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Token Management', () => {
    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('CSRF-Token', csrfToken)
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).not.toBe(authToken);

      authToken = response.body.token;
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('CSRF-Token', csrfToken)
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('User Logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .set('CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'تم تسجيل الخروج بنجاح');
    });

    it('should invalidate refresh token after logout', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('CSRF-Token', csrfToken)
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    it('should reject requests without valid token', async () => {
      const response = await request(app)
        .get('/api/forms')
        .set('CSRF-Token', csrfToken);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject expired tokens', async () => {
      // انتظار لمدة كافية لانتهاء صلاحية الرمز
      await new Promise(resolve => setTimeout(resolve, config.jwt.accessTokenExpiry));

      const response = await request(app)
        .get('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .set('CSRF-Token', csrfToken);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 