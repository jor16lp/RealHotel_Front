describe("LoginPage - pruebas de integración frontend", () => {
  const baseUrl = "http://localhost:3000"; 

  beforeEach(() => {
    cy.visit(baseUrl + "/login");
  });

  it("Inicio de sesión con usuario válido", () => {
    cy.get('input[type="email"]').type("prueba01@gmail.com");
    cy.get('input[type="password"]').type("prueba01");
    cy.get('button[type="submit"]').click();

    // Debe redirigir a la home
    cy.url().should("eq", `${baseUrl}/`);
    cy.contains("estancia perfecta");
  });

  it("Inicio de sesión con usuario sin cuenta", () => {
    cy.get('input[type="email"]').type("sincuenta@gmail.com");
    cy.get('input[type="password"]').type("123456");
    cy.get('button[type="submit"]').click();

    cy.contains("El email o la contraseña es incorrecto").should("be.visible");
  });

  it("Inicio de sesión con contraseña incorrecta", () => {
    cy.get('input[type="email"]').type("prueba01@gmail.com");
    cy.get('input[type="password"]').type("prueba02");
    cy.get('button[type="submit"]').click();

    cy.contains("El email o la contraseña es incorrecto").should("be.visible");
  });
});
