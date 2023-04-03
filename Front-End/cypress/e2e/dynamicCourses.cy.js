import pl from '../../i18n/pl.json';

const TEST_QUESTIONS = [
  {
    question: 'Test question',
  },
  {
    question: 'Test question 2',
  },
  {
    question: 'Test question 3',
  },
  {
    question: 'Test question 4',
  },
];

function addSurveyQuestion(testQuestion) {
  cy.get('button').contains(pl.Survey['add-question'].toString()).click();
  cy.get('h3').should(
    'contain',
    pl.Survey['add-question-to-survey'].toString()
  );
  cy.get("input[name='question']").type(testQuestion.question);
  cy.get('[data-testid="select-lesson-1"] > .block')
    .click()
    .get('[data-testid="select-option-0"]')
    .click();
  cy.get('button[id="skip-lesson-2"]')
    .contains(pl.Form['skip'].toString())
    .click();
  cy.get('button[id="skip-lesson-3"]')
    .contains(pl.Form['skip'].toString())
    .click();
  cy.get('button[id="skip-lesson-4"]')
    .contains(pl.Form['skip'].toString())
    .click();
  cy.get('button[type="submit"]').contains(pl.Manage['add'].toString()).click();
}

describe('Manage Dynamic Courses Survey Page', () => {
  beforeEach(() => {
    cy.login();
  });
  it('should navigate to /manage/dynamic-courses/surveys and add a survey, then delete it', () => {
    cy.visit('/manage/dynamic-courses/surveys');
    cy.url().should('include', '/manage/dynamic-courses/surveys');
    cy.get('h1').should('contain', pl.Manage['manage-surveys'].toString());
    cy.get('a[href="/manage/dynamic-courses/guided"]')
      .contains(pl.Manage['create'].toString())
      .click();
    cy.url().should('include', '/manage/dynamic-courses/guided');
    cy.get('button[type="submit"]')
      .contains(pl.Form['begin'].toString())
      .click();
    cy.get('button').contains(pl.Form['next'].toString()).click();
    TEST_QUESTIONS.forEach((testQuestion) => {
      addSurveyQuestion(testQuestion);
      cy.get('div').contains(testQuestion.question);
    });
    cy.get('button').contains(pl.Form['next'].toString()).click();
    cy.get('button').contains(pl.Form['submit'].toString()).click();
    cy.visit('/manage/dynamic-courses/surveys');
    cy.url().should('include', '/manage/dynamic-courses/surveys');
    cy.reload();
    cy.get('h1').should('contain', pl.Manage['manage-surveys'].toString());
    // TODO: find a better way to find test survey
    cy.get('tr[data-testid="survey-1"]> td')
      .parent()
      .find('button')
      .contains(pl.Manage['delete'].toString())
      .click();
    cy.get('h3').should('contain', pl.Survey['delete-survey'].toString());
    cy.get('button[name="dialog-delete-survey-button"]')
      .contains(pl.Manage['delete'].toString())
      .click();
    cy.get('tr[data-testid="survey-1"]').should('not.exist');
  });
});
