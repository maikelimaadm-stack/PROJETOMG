const BASE_RECORDS = [
  {
    razao_social: "MAK Gestão Ltda",
    nome_fantasia: "MAK Gestão",
    tipo_pessoa: "PJ",
    cpf_cnpj: "12.345.678/0001-90",
    inscricao_estadual: "123.456.789.012",
    telefone: "(11) 3456-7890",
    whatsapp: "(11) 98765-4321",
    email: "contato@makgestao.com.br",
    cep: "01310-100",
    endereco: "Av. Paulista",
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    status: "Ativa",
    observacoes: "Empresa matriz — dados de teste"
  },
  {
    razao_social: "Distribuidora Norte Sul S.A.",
    nome_fantasia: "Norte Sul Distribuidora",
    tipo_pessoa: "PJ",
    cpf_cnpj: "98.765.432/0001-10",
    inscricao_estadual: "987.654.321.098",
    telefone: "(21) 3344-5566",
    whatsapp: "(21) 99887-7665",
    email: "vendas@nortesul.com.br",
    cep: "20040-020",
    endereco: "Rua do Ouvidor",
    numero: "50",
    bairro: "Centro",
    cidade: "Rio de Janeiro",
    estado: "RJ",
    status: "Ativa"
  },
  {
    razao_social: "Tech Solutions Informática Ltda",
    nome_fantasia: "Tech Solutions",
    tipo_pessoa: "PJ",
    cpf_cnpj: "45.678.901/0001-23",
    inscricao_estadual: "456.789.012.345",
    telefone: "(31) 3234-5678",
    whatsapp: "(31) 99123-4567",
    email: "suporte@techsolutions.com.br",
    cep: "30130-000",
    endereco: "Av. Afonso Pena",
    numero: "1500",
    bairro: "Centro",
    cidade: "Belo Horizonte",
    estado: "MG",
    status: "Ativa"
  },
  {
    razao_social: "Comercial Beta Ltda",
    nome_fantasia: "Beta Comercial",
    tipo_pessoa: "PJ",
    cpf_cnpj: "11.222.333/0001-44",
    inscricao_estadual: "112.223.334.445",
    telefone: "(41) 3123-4567",
    whatsapp: "(41) 98877-6655",
    email: "comercial@betacomercial.com.br",
    cep: "80010-000",
    endereco: "Rua XV de Novembro",
    numero: "300",
    bairro: "Centro",
    cidade: "Curitiba",
    estado: "PR",
    status: "Ativa"
  },
  {
    razao_social: "João Carlos Silva",
    nome_fantasia: "JC Silva ME",
    tipo_pessoa: "PF",
    cpf_cnpj: "123.456.789-00",
    telefone: "(51) 3456-7890",
    whatsapp: "(51) 98765-1234",
    email: "joao.silva@email.com",
    cep: "90010-150",
    endereco: "Rua dos Andradas",
    numero: "120",
    bairro: "Centro Histórico",
    cidade: "Porto Alegre",
    estado: "RS",
    status: "Ativa"
  },
  {
    razao_social: "Agro Campos Ltda",
    nome_fantasia: "Agro Campos",
    tipo_pessoa: "PJ",
    cpf_cnpj: "33.444.555/0001-66",
    inscricao_estadual: "334.445.556.667",
    telefone: "(62) 3234-5678",
    whatsapp: "(62) 99234-5678",
    email: "contato@agrocampos.com.br",
    cep: "74003-010",
    endereco: "Av. Goiás",
    numero: "800",
    bairro: "Setor Central",
    cidade: "Goiânia",
    estado: "GO",
    status: "Ativa"
  },
  {
    razao_social: "Transportes Rápido Express Ltda",
    nome_fantasia: "Rápido Express",
    tipo_pessoa: "PJ",
    cpf_cnpj: "55.666.777/0001-88",
    inscricao_estadual: "556.667.778.889",
    telefone: "(71) 3344-7788",
    whatsapp: "(71) 98888-9999",
    email: "logistica@rapidoexpress.com.br",
    cep: "40020-000",
    endereco: "Av. Sete de Setembro",
    numero: "450",
    bairro: "Centro",
    cidade: "Salvador",
    estado: "BA",
    status: "Inativa"
  },
  {
    razao_social: "Indústria Metal Forte S.A.",
    nome_fantasia: "Metal Forte",
    tipo_pessoa: "PJ",
    cpf_cnpj: "77.888.999/0001-00",
    inscricao_estadual: "778.889.990.001",
    telefone: "(48) 3456-1234",
    whatsapp: "(48) 99777-8888",
    email: "industrial@metalforte.com.br",
    cep: "88015-100",
    endereco: "Rua Felipe Schmidt",
    numero: "200",
    bairro: "Centro",
    cidade: "Florianópolis",
    estado: "SC",
    status: "Ativa"
  }
];

const SEGMENTOS = ["Comercial", "Industrial", "Serviços", "Logística", "Alimentos", "Tecnologia", "Construção", "Varejo"];
const CIDADES = [
  { cidade: "São Paulo", estado: "SP", ddd: "11" },
  { cidade: "Rio de Janeiro", estado: "RJ", ddd: "21" },
  { cidade: "Belo Horizonte", estado: "MG", ddd: "31" },
  { cidade: "Curitiba", estado: "PR", ddd: "41" },
  { cidade: "Porto Alegre", estado: "RS", ddd: "51" },
  { cidade: "Brasília", estado: "DF", ddd: "61" },
  { cidade: "Salvador", estado: "BA", ddd: "71" },
  { cidade: "Recife", estado: "PE", ddd: "81" },
  { cidade: "Fortaleza", estado: "CE", ddd: "85" },
  { cidade: "Manaus", estado: "AM", ddd: "92" }
];

const pad = (n, size = 2) => String(n).padStart(size, "0");

const buildGeneratedRecord = (index) => {
  const n = index + 1;
  const loc = CIDADES[index % CIDADES.length];
  const seg = SEGMENTOS[index % SEGMENTOS.length];
  const cnpjBase = `${pad(n % 99)}.${pad((n * 3) % 999, 3)}.${pad((n * 7) % 999, 3)}`;
  return {
    razao_social: `${seg} ${pad(n, 3)} Ltda`,
    nome_fantasia: `${seg} ${pad(n, 3)}`,
    tipo_pessoa: "PJ",
    cpf_cnpj: `${cnpjBase}/0001-${pad(n % 99)}`,
    inscricao_estadual: `${cnpjBase.replace(/\./g, "")}.${pad(n % 999, 3)}`,
    telefone: `(${loc.ddd}) 3${pad(n % 100)}-${pad((n * 11) % 10000, 4)}`,
    whatsapp: `(${loc.ddd}) 9${pad(n % 100)}-${pad((n * 13) % 10000, 4)}`,
    email: `empresa${pad(n, 3)}@teste.com.br`,
    cep: `${pad(10000 + (n * 17) % 89999, 5)}-${pad((n * 3) % 999, 3)}`,
    endereco: `Rua Teste ${n}`,
    numero: String(100 + (n % 900)),
    bairro: `Bairro ${pad((n % 20) + 1)}`,
    cidade: loc.cidade,
    estado: loc.estado,
    status: n % 7 === 0 ? "Inativa" : "Ativa",
    observacoes: n % 5 === 0 ? "Registro gerado para teste" : ""
  };
};

/** 8 registros base + 50 gerados = 58 empresas de teste */
export const EMP_SEED_TARGET_COUNT = 58;

export const buildAllTestRecords = () => {
  const generated = Array.from({ length: EMP_SEED_TARGET_COUNT - BASE_RECORDS.length }, (_, i) =>
    buildGeneratedRecord(i + BASE_RECORDS.length)
  );
  return [...BASE_RECORDS, ...generated];
};

export const EMP_TEST_RECORDS = buildAllTestRecords();
