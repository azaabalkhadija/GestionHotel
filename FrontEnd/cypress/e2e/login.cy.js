describe("System Test - Login", () => {
  it("Logs in and redirects to the correct dashboard", () => {
    // 1) Visit login page (change path if your route is different)
    cy.visit("/login");

    // 2) Fill form
    cy.get('input[name="email"]').type("admin1@hotel.com");
    cy.get('input[name="password"]').type("admin123");

    // 3) Submit
    cy.contains("Se connecter").click();

    // 4) Verify redirect
    // Your code redirects ADMIN -> /admin/dashboard
    cy.url().should("include", "/admin/dashboard");

    // 5) Verify sessionStorage auth exists
    cy.window().then((win) => {
      const auth = win.sessionStorage.getItem("auth");
      expect(auth).to.not.be.null;
    });
  });

  it("Shows an error on invalid credentials", () => {
    cy.visit("/login");

    cy.get('input[name="email"]').type("wrong@test.com");
    cy.get('input[name="password"]').type("wrongpass");
    cy.contains("Se connecter").click();

    // Your code uses alert() on failure
    cy.on("window:alert", (txt) => {
      expect(txt).to.include("Échec d’authentification");
    });

    // Should stay on login (or at least not go to admin dashboard)
    cy.url().should("include", "/login");
  });
});
