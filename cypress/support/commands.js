import loc from './locators'

Cypress.Commands.add('login', (user, passwd) => {
    cy.visit("https://barrigareact.wcaquino.me");
    cy.get(loc.LOGIN.USER).type("ruan@cypress.com");
    cy.get(loc.LOGIN.PASSWORD).type('Gyn7oau8')
    cy.get(loc.LOGIN.BTN_LOGIN).click();
    cy.get(loc.MESSAGE).should('contain', 'Bem vindo');
})

Cypress.Commands.add("Resetar", () => {
    cy.get(loc.MENU.MENU_SETTINGS).click();
    cy.get(loc.MENU.RESET).click();
})