import pl from '../../i18n/pl.json';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      login: () => void;
    }
  }
}

export function login() {
  cy.visit('/login');
  cy.url().should('include', '/login');
  cy.get('input[name="username"]').type(Cypress.env('TEST_USERNAME'));
  cy.get('input[name="password"]').type(Cypress.env('TEST_PASSWORD'), {
    log: false,
  });
  cy.get('form').submit();
  cy.url().should('include', '/');
  cy.get('h1').should('contain', pl.Home.leading.toString());
}

Cypress.Commands.add('login', login);
