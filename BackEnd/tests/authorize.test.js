const authorize = require("../middlewares/authorize");

describe("authorize middleware (no admin bypass)", () => {
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

  test("calls next() when role is allowed", () => {
    const req = { auth: { role: "RECEPTIONIST" } };
    const res = makeRes();
    const next = jest.fn();

    authorize("RECEPTIONIST", "ADMIN")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(null);
  });

  test("returns 403 when role is not allowed", () => {
    const req = { auth: { role: "CLIENT" } };
    const res = makeRes();
    const next = jest.fn();

    authorize("RECEPTIONIST", "ADMIN")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden: insufficient role" });
  });

  test("returns 403 when role is missing", () => {
    const req = { auth: {} }; // or {} if your code uses req.auth?.role
    const res = makeRes();
    const next = jest.fn();

    authorize("RECEPTIONIST")(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ message: "Forbidden: insufficient role" });
  });
});
