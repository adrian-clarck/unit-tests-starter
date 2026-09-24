const ClienteService = require("../services/ClienteService");

describe("ClienteService (unitario com mocks)", () => {
  let service;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    service = new ClienteService(mockRepository);
  });

  describe("listar", () => {
    test("chama repository.findAll uma vez e retorna o resultado", () => {
      const clientes = [{ id: 1, nome: "Ana Souza", email: "ana@email.com" }];

      mockRepository.findAll.mockReturnValue(clientes);

      const resultado = service.listar();

      expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
      expect(resultado).toEqual(clientes);
    });
  });

  describe("buscarPorId", () => {
    test("repassa o id ao repository e retorna o cliente encontrado", () => {
      const cliente = {
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      };

      mockRepository.findById.mockReturnValue(cliente);

      const resultado = service.buscarPorId(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(resultado).toEqual(cliente);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna null", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() => service.buscarPorId(99)).toThrow("Cliente nao encontrado");

      expect(mockRepository.findById).toHaveBeenCalledWith(99);
    });
  });

  describe("criar", () => {
    test("repassa os dados ao repository e retorna o cliente criado", () => {
      const dados = {
        nome: "Carlos Silva",
        email: "carlos@email.com",
      };

      const clienteCriado = {
        id: 3,
        ...dados,
      };

      mockRepository.create.mockReturnValue(clienteCriado);

      const resultado = service.criar(dados);

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
      expect(resultado).toEqual(clienteCriado);
    });

    test("propaga o erro quando nome ou email estiverem faltando", () => {
      const dados = {
        email: "carlos@email.com",
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error("Nome e email sao obrigatorios");
      });

      expect(() => service.criar(dados)).toThrow(
        "Nome e email sao obrigatorios",
      );

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
    });

    test("propaga o erro quando o email ja estiver cadastrado", () => {
      const dados = {
        nome: "Carlos Silva",
        email: "ana@email.com",
      };

      mockRepository.create.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.criar(dados)).toThrow("Email ja cadastrado");

      expect(mockRepository.create).toHaveBeenCalledWith(dados);
    });
  });

  describe("atualizar", () => {
    test("chama repository.findById e repository.update quando o cliente existe", () => {
      const cliente = {
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      };

      const dados = {
        nome: "Ana Silva",
        email: "ana.silva@email.com",
      };

      const clienteAtualizado = {
        id: 1,
        ...dados,
      };

      mockRepository.findById.mockReturnValue(cliente);
      mockRepository.update.mockReturnValue(clienteAtualizado);

      const resultado = service.atualizar(1, dados);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(mockRepository.update).toHaveBeenCalledWith(1, dados);
      expect(resultado).toEqual(clienteAtualizado);
    });

    test("lanca erro 'Cliente nao encontrado' sem chamar repository.update quando o cliente nao existe", () => {
      mockRepository.findById.mockReturnValue(null);

      expect(() =>
        service.atualizar(99, {
          nome: "Carlos Silva",
          email: "carlos@email.com",
        }),
      ).toThrow("Cliente nao encontrado");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test("propaga o erro quando o novo email ja pertence a outro cliente", () => {
      const cliente = {
        id: 1,
        nome: "Ana Souza",
        email: "ana@email.com",
      };

      const dados = {
        nome: "Ana Souza",
        email: "bruno@email.com",
      };

      mockRepository.findById.mockReturnValue(cliente);

      mockRepository.update.mockImplementation(() => {
        throw new Error("Email ja cadastrado");
      });

      expect(() => service.atualizar(1, dados)).toThrow("Email ja cadastrado");

      expect(mockRepository.update).toHaveBeenCalledWith(1, dados);
    });
  });

  describe("remover", () => {
    test("chama repository.delete com o id correto quando o cliente existe", () => {
      mockRepository.delete.mockReturnValue(true);

      service.remover(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    test("lanca erro 'Cliente nao encontrado' quando o repository retorna false", () => {
      mockRepository.delete.mockReturnValue(false);

      expect(() => service.remover(99)).toThrow("Cliente nao encontrado");

      expect(mockRepository.delete).toHaveBeenCalledWith(99);
    });
  });
});
