// backend/controllers/UserController.js (VERSÃO CORRIGIDA)

const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper para selecionar quais campos retornar (evitar enviar a senha, mesmo hashada)
const selectFields = (user) => {
    const { password, ...userData } = user.get({ plain: true });
    return userData;
};

// [GET] Listar todos os usuários
const getAllUsers = async (req, res) => { // REMOVIDO: exports.
    try {
        const users = await User.findAll({ 
            // Garante que a senha não seja retornada na listagem
            attributes: { exclude: ['password'] } 
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [POST] Criar um novo usuário
const createUser = async (req, res) => { // REMOVIDO: exports.
    const { email, password, sectorId, ...rest } = req.body;

    if (!email || !password || !sectorId) {
        return res.status(400).json({ error: 'Email, senha e setor são obrigatórios.' });
    }

    try {
        // O hash da senha deve ser feito no Model (hook) ou aqui (como você notou).
        const newUser = await User.create(req.body);
        
        // Retorna o usuário, mas sem o campo 'password'
        return res.status(201).json(selectFields(newUser)); 
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'O email fornecido já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o usuário.' });
    }
};

// [PUT] Atualizar um usuário
const updateUser = async (req, res) => { // REMOVIDO: exports.
    const { id } = req.params;
    const { password, ...updateData } = req.body;

    try {
        // Se a senha estiver sendo atualizada, ela deve ser hashada
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const [updatedRows] = await User.update(updateData, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] }
        });
        return res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o usuário.' });
    }
};

// [DELETE] Excluir um usuário
const deleteUser = async (req, res) => { // REMOVIDO: exports.
    const { id } = req.params;

    try {
        const deletedRows = await User.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        // Retorna status 204 (No Content)
        return res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao deletar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o usuário.' });
    }
};

// 🚨 EXPORTAÇÃO CORRIGIDA 🚨
module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};