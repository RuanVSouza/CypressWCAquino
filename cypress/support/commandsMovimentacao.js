import loc from './locators'

Cypress.Commands.add('acessarMovimentacao', () => {
    cy.get(loc.MENU.MENU_SETTINGS).click()
    cy.get(loc.MENU.MOVIMENTACAO).click()
})

Cypress.Commands.add("inserirMovimentacao", (descricao, valor, interessado, conta) =>{
    cy.get(loc.MOVIMENTACAO.DESCRICAO).type(descricao)
    cy.get(loc.MOVIMENTACAO.VALOR).type(valor)
    cy.get(loc.MOVIMENTACAO.INTERESSADO).type(interessado)
    cy.get(loc.MOVIMENTACAO.ALTERAR_SELECT).select(conta)
    // cy.get(loc.CONTAS.STATUS).click()
    cy.get(loc.MOVIMENTACAO.BTN_SALVAR_SALDO).click()
    
})