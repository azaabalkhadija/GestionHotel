const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

describe("auth middleware", () => {
  const makeRes = () => {
    const res = {};
    res.statusCode = null;
    res.body = null;

    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    res.json = (data) => {
      res.body = data;
      return res;
    };

    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TOKEN_ENCODED = "test_secret";
  });

  test("returns 401 when Authorization header is missing", () => {
    const req = { headers: {} };
    const res = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test('returns 401 when Authorization header does not start with "Bearer "', () => {
    const req = { headers: { authorization: "Token abcdef" } };
    const res = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "No token provided" });
  });

  test("returns 401 when token is invalid", () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("bad token");
    });

    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("badtoken", "test_secret");
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ message: "Invalid or expired token" });
  });

  test("calls next and sets req.auth when token is valid", () => {
    jwt.verify.mockReturnValue({
      userId: "u123",
      role: "RECEPTIONIST",
      email: "test@mail.com",
    });

    const req = { headers: { authorization: "Bearer goodtoken" } };
    const res = makeRes();
    const next = jest.fn();

    auth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("goodtoken", "test_secret");
    expect(req.auth).toEqual({
      userId: "u123",
      role: "RECEPTIONIST",
      email: "test@mail.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
