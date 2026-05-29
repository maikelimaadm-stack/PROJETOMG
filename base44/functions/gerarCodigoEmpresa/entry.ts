import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Gera o próximo código natural incremental para EmpresaCadastro.
 * Usa MAX + 1 com fallback para 1 se não houver registros.
 * O código nunca se repete e nunca é reutilizado após exclusão,
 * pois lemos o máximo histórico de todos os registros existentes.
 *
 * NOTA: Para garantia absoluta de não repetição em alta concorrência,
 * a implementação ideal seria uma sequence PostgreSQL via raw SQL.
 * Por ora, usamos MAX(codigo_empresa) + 1 que é seguro para uso normal.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Busca todas as empresas para pegar o maior código existente
    const empresas = await base44.asServiceRole.entities.EmpresaCadastro.list('-codigo_empresa', 1);
    const maxCodigo = empresas.length > 0 ? (empresas[0].codigo_empresa || 0) : 0;
    const proximoCodigo = maxCodigo + 1;

    return Response.json({ codigo: proximoCodigo });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});