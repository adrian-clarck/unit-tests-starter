const request = require("supertest");

const createApp = require("../app");

describe("API /produtos - testes de integração", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  describe("GET /produtos", () => {
    test("Retorna 200 e um array com os produtos iniciais", async () => {
      const res = await request(app).get("/produtos");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });

  describe("GET /produtos/:id", () => {
    test("Retorna 200 e o produto encontrado", async () => {
      const res = await request(app).get("/produtos/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        id: 1,
        nome: "Coxinha",
        preco: 5,
      });
    });

    test("Retorna 404 quando o produto não existe", async () => {
      const res = await request(app).get("/produtos/99");

      expect(res.status).toBe(404);
    });
  });

  describe("POST /produtos", () => {
    test("Cria um novo produto", async () => {
      const res = await request(app).post("/produtos").send({
        nome: "Cachorro-quente",
        preco: 10,
      });

      expect(res.status).toBe(201);
      expect(res.body.nome).toBe("Cachorro-quente");
      expect(res.body.preco).toBe(10);
    });
  });

  describe("DELETE /produtos/:id", () => {
    test("Remove um produto existente", async () => {
      const res = await request(app).delete("/produtos/1");

      expect(res.status).toBe(204);
    });

    test("Retorna 404 quando o produto não existe", async () => {
      const res = await request(app).delete("/produtos/99");

      expect(res.status).toBe(404);
    });
  });
});
