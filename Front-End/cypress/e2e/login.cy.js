describe('Login Page', () => {
  it('should navigate to login page and login', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.get('input[name="username"]').type(Cypress.env('TEST_USERNAME'));
    cy.get('input[name="password"]').type(Cypress.env('TEST_PASSWORD'), {
      log: false,
    });
    cy.get('form').submit();
    cy.url().should('include', '/');
  });
});
