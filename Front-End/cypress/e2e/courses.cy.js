import pl from '../../i18n/pl.json';

const TEST_COURSE = {
  name: 'Test course',
  description: 'Test course description',
  lang: 'pl',
  featured: true,
};

describe('Manage Courses Page', () => {
  beforeEach(() => {
    cy.login();
  });
  it('should navigate to /manage/courses and add a course', () => {
    cy.visit('/manage/courses');
    cy.url().should('include', '/manage/courses');
    cy.get('h1').should('contain', pl.Manage['manage-courses'].toString());
    cy.get('button').contains(pl.Manage['create'].toString()).click();
    cy.get("input[name='name']").type(TEST_COURSE.name);
    cy.get("textarea[name='description']").type(TEST_COURSE.description);
    TEST_COURSE.featured && cy.get("input[name='featured']").check();
    cy.get("button[type='submit']").click();
    cy.get('table').contains('td', TEST_COURSE.name);
    cy.get('table').contains('td', TEST_COURSE.description);
  });
  it('should navigate to /manage/courses and delete a course', () => {
    cy.visit('/manage/courses');
    cy.url().should('include', '/manage/courses');
    cy.get('h1').should('contain', pl.Manage['manage-courses'].toString());
    cy.get('td')
      .contains(TEST_COURSE.name)
      .parent()
      .find('button')
      .contains(pl.Manage['delete'].toString())
      .click();
    cy.get('h3').should('contain', pl.Courses['delete-course'].toString());
    cy.get('button[name="dialog-delete-course"]')
      .contains(pl.Manage['delete'].toString())
      .click();

    cy.get('td').contains(TEST_COURSE.name).should('not.exist');
    cy.get('td').contains(TEST_COURSE.description).should('not.exist');
  });
});
