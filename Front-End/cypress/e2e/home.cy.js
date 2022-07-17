describe('Home Page in english', () => {
  it('should navigate to Home Page', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', { value: 'en-US' });
        Object.defineProperty(win.navigator, 'languages', { value: ['en'] });
        Object.defineProperty(win.navigator, 'accept_languages', {
          value: ['en'],
        });
      },
      headers: {
        'Accept-Language': 'en',
      },
    });
    cy.get('h1').contains('Python for everyone');
  });
});

describe('Home Page in polish', () => {
  it('should navigate to Home Page', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'language', { value: 'pl-PL' });
        Object.defineProperty(win.navigator, 'languages', { value: ['pl'] });
        Object.defineProperty(win.navigator, 'accept_languages', {
          value: ['pl'],
        });
      },
      headers: {
        'Accept-Language': 'pl',
      },
    });
    cy.get('h1').contains('Python dla każdego');
  });
});
