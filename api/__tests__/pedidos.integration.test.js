const request = require("supertest");
const createApp = require("../app");

describe("API /pedidos (integracao com supertest)", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /pedidos", () => {
    test("retorna 200 e um array com os pedidos iniciais", async () => {
      const res = await request(app).get("/pedidos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe("GET /pedidos/:id", () => {
    test("retorna 200 e o pedido quando o id existe", async () => {
      const res = await request(app).get("/pedidos/1");

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.cliente).toBe("Ana Souza");
      expect(res.body.total).toBe(10);
    });

    test("retorna 404 com mensagem de erro quando o pedido nao existe", async () => {
      const res = await request(app).get("/pedidos/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: "Pedido nao encontrado",
      });
    });
  });

  describe("POST /pedidos", () => {
    test("retorna 201 e o pedido criado com o total calculado corretamente", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({
          cliente: "Carlos",
          itens: [
            {
              nome: "Coxinha",
              precoUnitario: 5,
              quantidade: 2,
            },
            {
              nome: "Pastel",
              precoUnitario: 8,
              quantidade: 1,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.total).toBe(18);
      expect(res.body.status).toBe("pendente");
    });

    test("retorna 400 quando o cliente esta faltando", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({
          itens: [
            {
              nome: "Coxinha",
              precoUnitario: 5,
              quantidade: 2,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Cliente e obrigatorio",
      });
    });

    test("retorna 400 quando a lista de itens esta vazia", async () => {
      const res = await request(app).post("/pedidos").send({
        cliente: "Carlos",
        itens: [],
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Pedido deve ter ao menos um item",
      });
    });

    test("retorna 400 quando algum item tem preco ou quantidade invalidos", async () => {
      const res = await request(app)
        .post("/pedidos")
        .send({
          cliente: "Carlos",
          itens: [
            {
              nome: "Coxinha",
              precoUnitario: 0,
              quantidade: 2,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Itens devem ter nome, preco e quantidade validos",
      });
    });
  });

  describe("PATCH /pedidos/:id/status", () => {
    test("retorna 200 e o pedido com o novo status quando o id existe", async () => {
      const res = await request(app).patch("/pedidos/1/status").send({
        status: "pago",
      });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("pago");
    });

    test("retorna 404 quando o pedido nao existe", async () => {
      const res = await request(app).patch("/pedidos/99/status").send({
        status: "pago",
      });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: "Pedido nao encontrado",
      });
    });

    test("retorna 400 quando o status enviado e invalido", async () => {
      const res = await request(app).patch("/pedidos/1/status").send({
        status: "entregue",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Status invalido",
      });
    });

    test("retorna 400 ao tentar alterar o status de um pedido ja cancelado", async () => {
      await request(app).patch("/pedidos/1/status").send({
        status: "cancelado",
      });

      const res = await request(app).patch("/pedidos/1/status").send({
        status: "pago",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        erro: "Pedido cancelado nao pode ser alterado",
      });
    });
  });

  describe("DELETE /pedidos/:id", () => {
    test("retorna 204 quando o pedido e removido com sucesso", async () => {
      const res = await request(app).delete("/pedidos/1");

      expect(res.status).toBe(204);
    });

    test("pedido removido nao aparece mais na listagem", async () => {
      await request(app).delete("/pedidos/1");

      const res = await request(app).get("/pedidos/1");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: "Pedido nao encontrado",
      });
    });

    test("retorna 404 quando o pedido nao existe", async () => {
      const res = await request(app).delete("/pedidos/99");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        erro: "Pedido nao encontrado",
      });
    });
  });
});
