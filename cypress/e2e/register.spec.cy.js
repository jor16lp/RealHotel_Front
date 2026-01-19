describe("RegisterPage - pruebas de integración frontend", () => {
  const baseUrl = "http://localhost:3000"; 
  const backendUrl = "http://localhost:3001/api/users"; 

  const testUsers = [
    { name: "test", surname: "test", email: "test@gmail.com", password: "test123" },
    { name: "Jorge", surname: "López", email: "jorgeprueba@gmail.com", password: "test123" }
  ];

  beforeEach(() => {
    cy.visit(baseUrl + "/register");
  });

  after(() => {
    console.log("AFTER")
    testUsers.forEach((user) => {
      cy.request({
        method: "DELETE",
        url: `${backendUrl}/` + user.email, 
        failOnStatusCode: false 
      });
    });
  });

  it("Registro de usuario válido", () => {
    const user = testUsers[0];

    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="surname"]').type(user.surname);
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);

    cy.get('button[type="submit"]').click();

    cy.url().should("eq", `${baseUrl}/`);
    cy.contains("estancia perfecta"); 
  });

  it("Registro de usuario que ya tiene cuenta", () => {
    cy.get('input[name="name"]').type("Antonio");
    cy.get('input[name="surname"]').type("Suárez");
    cy.get('input[name="email"]').type("prueba01@gmail.com");
    cy.get('input[name="password"]').type("prueba01");

    cy.get('button[type="submit"]').click();

    cy.contains("Ya existe un usuario con ese email").should("be.visible");
  });

  it("Registro con campos en blanco", () => {
    const user = testUsers[1];

    cy.get('input[name="name"]').type(user.name);
    cy.get('input[name="surname"]').type(user.surname);
    // email vacío
    cy.get('input[name="password"]').type(user.password);

    cy.get('button[type="submit"]').click();

    cy.get('input[name="email"]')
      .then(($input) => {
        expect($input[0].validationMessage).to.exist;
      });
  });
});
