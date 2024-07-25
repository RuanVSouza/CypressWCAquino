/// <reference types="cypress"/>

import loc from '../support/locators'
import '../support/commandsContas'
import '../support/commandsMovimentacao'

describe('Trabalhando com elementos basicos', () => {
    after(() => {
        cy.clearLocalStorage()
    })


    beforeEach(() => {
        // cy.server()
        cy.intercept({
            url: '/signin',
            method: 'POST',
        },
            {
                id: 1000,
                nome: "Usuario falso",
                token: 'Uma string muito grande que não deveria ser aceito mas na vdd vai'
            }).as('signin')

        cy.intercept({
            method: 'GET',
            url: '/saldo'
        }, [
            { conta_id: 9909, conta: 'Conta falsa 1', saldo: '10000000.00' },
            { conta_id: 999, conta: 'Carteira', saldo: '100.00' }
        ]).as('saldo')


        cy.login('ruan@cypress.com', 'senhaerrada')

    })

    beforeEach(() => {
        cy.get(loc.MENU.HOME).click()
        // cy.Resetar()
    })
    it.only("Inserindo nova conta", () => {
        cy.intercept({
            method: 'GET',
            url: '/contas',
        }, [
            { id: 1, nome: "Carteira", visivel: true, usuario_id: 51498 },
            { id: 2, nome: "Banco", visivel: true, usuario_id: 51498 },
        ]).as('contas')

        cy.intercept({
            method: "POST",
            url: '/contas'
        }, { id: 3, nome: "Conta de teste", visivel: true, usuario_id: 51498 }).as('SalvandoConta')

        cy.acessarMenuConta()

        cy.intercept({
            method: 'GET',
            url: '/contas',
        }, [
            { id: 1, nome: "Carteira", visivel: true, usuario_id: 1 },
            { id: 2, nome: "Banco", visivel: true, usuario_id: 1 },
            { id: 3, nome: "Conta de teste", visivel: true, usuario_id: 1 },
        ]).as('ContaSave')

        cy.inserirConta('Conta de teste')
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

    it("Removar movimentação", () => {
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_DELETAR_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'Movimentação removida com sucesso!')

    })
})