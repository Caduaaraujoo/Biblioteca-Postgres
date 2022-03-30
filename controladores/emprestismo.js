const conexao = require('../conexao');

const listarEmprestimos = async (req, res) => {
    try {
        const query =
            `
            select e.id, u.nome as nome_cliente, u.telefone, u.email, l.nome as nome_livro, e.status from emprestimos e
            left join usuarios u on e.id_usuario = u.id
            left join livros l on e.id_livro = l.id
        `
        const { rows: emprestimos } = await conexao.query(query);
        return res.status(200).json(emprestimos);

    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const obterEmprestimo = async (req, res) => {
    const { id } = req.params
    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(404).json('Emprestimo não encontrado');
        }

        return res.status(200).json(emprestimo.rows)

    } catch (error) {
        return res.status(400).json(error.message);
    }

}

const cadastrarEmprestimo = async (req, res) => {
    const { id_usuario, id_livro } = req.body;
    try {
        const query = `
            insert into emprestimos (id_usuario, id_livro)
            values ($1, $2)
        `
        if (!id_usuario && !id_livro) {
            return res.status(400).json('Os campos id_usuario e id_livros são obrigatórios');
        }

        const emprestimoCadastrado = await conexao.query(query, [id_usuario, id_livro]);

        if (emprestimoCadastrado.rowCount === 0) {
            return res.status(400).json('Não foi possivel cadastrar o livro')
        }

        return res.status(200).json('Emprestimo cadastrado com sucesso.');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const atualizarEmprestimo = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(400).json('Emprestimo não encontrado.');
        }
        const query = `
            update emprestimos set status = $1
        `
        emprestimoAtualizado = await conexao.query(query, [status]);

        if (emprestimoAtualizado.rowCount === 0) {
            return res.status(400).json('Não foi possivel atualizar o emprestimo.');
        }

        return res.status(200).json('O emprestimo foi atualizado com sucesso.');
    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const excluirEmprestimo = async (req, res) => {
    const { id } = req.params
    try {
        const emprestimo = await conexao.query('select * from emprestimos where id = $1', [id]);

        if (emprestimo.rowCount === 0) {
            return res.status(400).json('Emprestimo não encontrado.');
        }

        const query = `delete from emprestimos where id = $1`
        const emprestimoExcluido = await conexao.query(query, [id]);

        if (emprestimoExcluido.rowCount === 0) {
            return res.status(400).json('Não foi possivel excluir o emprestimo.');
        }

        return res.status(200).json('Emprestimo excluido com sucesso');

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

module.exports = {
    listarEmprestimos,
    obterEmprestimo,
    cadastrarEmprestimo,
    atualizarEmprestimo,
    excluirEmprestimo
}