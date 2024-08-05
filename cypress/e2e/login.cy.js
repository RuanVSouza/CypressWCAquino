/// <reference types="cypress"/>

import loc from '../support/locators'
import '../support/commandsContas'
import '../support/commandsMovimentacao'

describe('Trabalhando com elementos basicos', () => {
    beforeEach(() => {
        cy.login('ruan@cypress.com', 'Gyn7oau8')
        cy.Resetar()
    })

    beforeEach(() => {
        cy.get(loc.MENU.HOME).click()
    })
    it("Inserindo nova conta", () => {

        cy.acessarMenuConta()
        cy.inserirConta('Conta de esgoto')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    })

    it("Deve atualizar uma conta", () => {
        cy.acessarMenuConta()
        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Conta para alterar')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type("Conta alterada")
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
    })

    it("criando uma conta com mesmo nome", () => {
        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', '400')
    })

    it("Consultar e fazer movimentação", () => {
        cy.acessarMovimentacao()
        cy.inserirMovimentacao('Conta a pagar', '300.00', 'Eu mesmo', 'Conta para movimentacoes')
        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Conta a pagar', '300')).should('exist')
    })

    it("Pegar o saldo", () => {
        cy.get(loc.MENU.HOME).click()
        cy.wait(5000)
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '534')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        cy.wait(5000)
        cy.get(loc.CONTAS.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR_SALDO).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Conta para saldo')).should('contain', '4.034,00')
    })

    it.only("Removar movimentação", () => {
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'Movimentação removida com sucesso!')

    })
})