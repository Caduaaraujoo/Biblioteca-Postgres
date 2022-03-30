const conexao = require('../conexao');

const listarUsuarios = async (req, res) => {
    try {
        const { rows: usuarios } = await conexao.query('select * from usuarios');

        for (const usuario of usuarios) {
            const { rows: emprestimo } = await conexao.query('select * from emprestimos where id_usuario = $1', [usuario.id]);
            usuario.emprestimo = emprestimo;
        }

        return res.status(200).json(usuarios);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const obterUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado');
        }
        return res.status(200).json(usuario.rows[0]);
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cadastrarUsuario = async (req, res) => {
    const { nome, idade, email, telefone, cpf } = req.body;

    if (!nome && !email && !cpf) {
        return res.status(400).json("O campo nome, email e cpf são obrigatórios");
    }

    const emailExisti = await conexao.query('select email from usuarios where email = $1', [email]);
    if (emailExisti.rowCount !== 0) {
        return res.status(400).json('O email já existente, por favor cadastre um novo email.');
    }

    try {
        const query = 'insert into usuarios (nome, idade, email, telefone, cpf) values ($1, $2, $3, $4, $5)';
        const usuario = await conexao.query(query, [nome, idade, email, telefone, cpf]);

        if (usuario.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar o usuario');
        }

        return res.status(200).json('Usuario cadastrado com sucesso.')
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, idade, email, telefone, cpf } = req.body;


    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado');
        }

        if (!nome && !email && !cpf) {
            return res.status(400).json("O campo nome, email e cpf são obrigatórios");
        }

        const query = 'update usuarios set nome = $1, idade = $2, email = $3, telefone = $4, cpf = $5 where id = $6';
        const usuarioAtualizado = await conexao.query(query, [nome, idade, email, telefone, cpf, id]);

        if (usuarioAtualizado.rowCount === 0) {
            return res.status(404).json('Não foi possível atualizar o usuario');
        }

        return res.status(200).json('Usuario foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const usuario = await conexao.query('select * from usuarios where id = $1', [id]);

        if (usuario.rowCount === 0) {
            return res.status(404).json('Usuario não encontrado');
        }

        const usuarioPendente = await conexao.query(`select * from emprestimos where id_usuario = $1 and status = 'pendente'`, [id]);

        if (usuarioPendente.rowCount > 0) {
            return res.status(400).json('O usuario possui livros pendentes, e não pode ser excluido');
        }

        const query = 'delete from usuarios where id = $1';
        const usuarioExcluido = await conexao.query(query, [id]);

        if (usuarioExcluido.rowCount === 0) {
            return res.status(404).json('Não foi possível excluir o usuario');
        }

        return res.status(200).json('Usuario foi excluido com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarUsuarios,
    obterUsuario,
    cadastrarUsuario,
    atualizarUsuario,
    excluirUsuario
}
