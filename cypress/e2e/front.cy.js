/// <reference types="cypress"/>

import loc from '../support/locators'
import '../support/commandsContas'
import '../support/commandsMovimentacao'
import buildEnv from '../support/buildEnv'

describe('Trabalhando com elementos basicos', () => {
    after(() => {
        cy.clearLocalStorage()
    })


    beforeEach(() => {
        buildEnv()
        cy.login('ruan@cypress.com', 'Gyn7oau8')
        cy.get(loc.MENU.HOME).click()
        // cy.Resetar()
    })
    it("Inserindo nova conta", () => {
        cy.intercept({
            method: 'POST',
            url: '/contas'
        }, { id: 3, nome: "Conta de teste", visivel: true, usuario_id: 51498 })

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
        cy.intercept({
            method: "PUT",
            url: "/contas/**"
        }, { id: 1, nome: "Carteira", visivel: true, usuario_id: 51498 })

        cy.acessarMenuConta()
        cy.xpath(loc.CONTAS.FN_XP_BTN_ALTERAR('Carteira')).click()
        cy.get(loc.CONTAS.NOME)
            .clear()
            .type("Conta alterada")
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'Conta atualizada com sucesso')
    })

    it("criando uma conta com mesmo nome", () => {
        cy.intercept({
            method: 'POST',
            url: '/contas'
        }, { error: "Já existe uma conta com esse nome!", statusCode: 400 }).as('contaMesmoNome')
        cy.acessarMenuConta()

        cy.get(loc.CONTAS.NOME).type('Conta mesmo nome')
        cy.get(loc.CONTAS.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', '400')


    })

    it('Should create a transaction', () => {
        cy.intercept({
            method: 'POST',
            url: '/transacoes'
        },
            {
                "id": 31433,
                "descricao": "asdasd",
                "envolvido": "sdfsdfs",
                "observacao": null,
                "tipo": "DESP",
                "data_transacao": "2019-11-13T03:00:00.000Z",
                "data_pagamento": "2019-11-13T03:00:00.000Z",
                "valor": "232.00",
                "status": false,
                "conta_id": 42069,
                "usuario_id": 1,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        )

        cy.intercept({
            method: 'GET',
            url: '/extrato/**'
        },
            { fixture: 'movimentacaoSalva.json' }
        )


        cy.acessarMovimentacao()
        cy.get(loc.MOVIMENTACAO.DESCRICAO).type('Desc')
        cy.get(loc.MOVIMENTACAO.VALOR).type('123')
        cy.get(loc.MOVIMENTACAO.INTERESSADO).type('Inter')
        cy.get(loc.MOVIMENTACAO.CONTA).select('Banco')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
        cy.get(loc.EXTRATO.LINHAS).should('have.length', 7)
        cy.xpath(loc.EXTRATO.FN_XP_BUSCA_ELEMENTO('Desc', '123')).should('exist')
    })

    // Tá encapetado
    it('Pegando saldo', () => {
        cy.intercept({
            method: 'GET',
            url: '/transacoes/**'
        },
            {
                "conta": "Conta para saldo",
                "id": 31436,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2019-11-13T03:00:00.000Z",
                "data_pagamento": "2019-11-13T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 42079,
                "usuario_id": 1,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        )

        cy.intercept({
            method: 'PUT',
            url: '/transacoes/**'
        },
            {
                "conta": "Conta para saldo",
                "id": 31436,
                "descricao": "Movimentacao 1, calculo saldo",
                "envolvido": "CCC",
                "observacao": null,
                "tipo": "REC",
                "data_transacao": "2019-11-13T03:00:00.000Z",
                "data_pagamento": "2019-11-13T03:00:00.000Z",
                "valor": "3500.00",
                "status": false,
                "conta_id": 42079,
                "usuario_id": 1,
                "transferencia_id": null,
                "parcelamento_id": null
            }
        )

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '100,00')

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_ALTERAR_ELEMENTO('Movimentacao 1, calculo saldo')).click()
        // cy.wait(1000)
        cy.get(loc.MOVIMENTACAO.DESCRICAO).should('have.value', 'Movimentacao 1, calculo saldo')
        cy.get(loc.MOVIMENTACAO.STATUS).click()
        cy.get(loc.MOVIMENTACAO.BTN_SALVAR).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')

        cy.intercept({
            method: 'GET',
            url: '/saldo'
        },
            [{
                conta_id: 999,
                conta: "Carteira",
                saldo: "4034.00"
            },
            {
                conta_id: 9909,
                conta: "Banco",
                saldo: "10000000.00"
            },
            ]
        ).as('saldoFinal')

        cy.get(loc.MENU.HOME).click()
        cy.xpath(loc.SALDO.FN_XP_SALDO_CONTA('Carteira')).should('contain', '4.034,00')
    })
    it("Removar movimentação", () => {
        cy.intercept({
            url: '/transacoes/**',
            method: 'DELETE'
        }, { statusCode: 204 }).as('Delete')
        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_REMOVER_ELEMENTO('Movimentacao para exclusao')).click()
        cy.get(loc.MESSAGE).should('contain', 'sucesso')
    })

    it("Validando enviado para Inserindo nova conta", () => {
        cy.intercept('POST', '/contas', (req) => {
            console.log(req)
            req.reply({
                statusCode: 201,
                body: { id: 3, nome: 'Conta de Teste Ruan', visivel: true, usuario_id: 1 }
            })
        }).as('saveConta3')

        cy.acessarMenuConta()

        cy.intercept({
            method: 'GET',
            url: '/contas',
        }, [
            { id: 1, nome: "Carteira", visivel: true, usuario_id: 1 },
            { id: 2, nome: "Banco", visivel: true, usuario_id: 1 },
            { id: 3, nome: "Conta de teste", visivel: true, usuario_id: 1 },
        ]).as('ContaSave')

        cy.inserirConta('{CONTROL}')
        // cy.wait('@ContaSave').its('request.body.nome').should('not.be.empty')
        cy.get(loc.MESSAGE).should('contain', 'Conta inserida com sucesso')
    })

    it.only('Testando as cores de contas', () => {
        cy.intercept({
            method: "GET",
            url: '/extrato/**'
        },
            [
                { "conta": "Conta para movimentacoes", "id": 31434, "descricao": "Receita paga", "envolvido": "AAA", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": true, "conta_id": 42077, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
                { "conta": "Conta com movimentacao", "id": 31435, "descricao": "Receita pendente", "envolvido": "BBB", "observacao": null, "tipo": "REC", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1500.00", "status": false, "conta_id": 42078, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
                { "conta": "Conta para saldo", "id": 31436, "descricao": "Despesa paga", "envolvido": "CCC", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "3500.00", "status": true, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
                { "conta": "Conta para saldo", "id": 31437, "descricao": "Despesa pendente", "envolvido": "DDD", "observacao": null, "tipo": "DESP", "data_transacao": "2019-11-13T03:00:00.000Z", "data_pagamento": "2019-11-13T03:00:00.000Z", "valor": "-1000.00", "status": false, "conta_id": 42079, "usuario_id": 1, "transferencia_id": null, "parcelamento_id": null },
            ]
        )

        cy.get(loc.MENU.EXTRATO).click()
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita paga')).should('have.class', 'receitaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Receita pendente')).should('have.class', 'receitaPendente')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa paga')).should('have.class', 'despesaPaga')
        cy.xpath(loc.EXTRATO.FN_XP_LINHA('Despesa pendente')).should('have.class', 'despesaPendente')
    })



})