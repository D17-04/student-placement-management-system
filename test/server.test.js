const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.JWT_SECRET = "test-secret";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/placement_test";
const app = require("../backend/server");

test("health endpoint returns service status", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.status, "ok");
});

test("login rejects missing credentials", async () => {
  const response = await request(app).post("/api/auth/login").send({});
  assert.equal(response.status, 400);
  assert.equal(response.body.message, "Email and password are required");
});
