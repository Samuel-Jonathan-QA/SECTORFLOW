// backend/controllers/UserController.js (REVISADO)

const User = require('../models/User');
const Sector = require('../models/Sector'); 
const bcrypt = require('bcryptjs');

// [GET] Listar todos os usuários (Inclui a Role e Setores)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ['password'] },
            // Incluir os setores para que o Frontend possa ver as vinculações
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [GET] Buscar um único usuário por ID
const getOneUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Erro ao buscar usuário:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [POST] Criar um novo usuário (REFATORADO N:N)
const createUser = async (req, res) => {
    // sectorIds deve ser um array de IDs.
    const { email, password, role, sectorIds, ...rest } = req.body; 

    if (!email || !password || !role) { 
        return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
    }

    // Validação de Vendedor: deve ter setores
    if (role === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
        return res.status(400).json({ error: 'Vendedores devem ser associados a pelo menos um setor.' });
    }

    try {
        // A senha será hasheada automaticamente pelo hook beforeCreate no modelo User.js
        const newUser = await User.create({ email, password, role, ...rest }); 

        // Vincula os setores
        if (sectorIds && sectorIds.length > 0) {
            await newUser.setSectors(sectorIds); 
        }

        // Busca e retorna o novo usuário com seus setores
        const userWithSectors = await User.findByPk(newUser.id, {
             attributes: { exclude: ['password'] },
             include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });
        
        return res.status(201).json(userWithSectors); 
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'O email fornecido já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o usuário.' });
    }
};

// [PUT] Atualizar um usuário (REFATORADO N:N)
const updateUser = async (req, res) => {
    const { id } = req.params;
    // O password não precisa de hash manual aqui, pois o hook beforeUpdate do modelo User lida com isso.
    const { password, sectorIds, ...updateData } = req.body; 

    try {
        // Se a senha foi fornecida, o hook no User.js fará o hash
        // Não fazemos o hash manual aqui! Apenas passamos a senha no updateData
        if (password) {
            updateData.password = password; 
        }

        // 1. Atualiza os campos básicos
        const [updatedRows] = await User.update(updateData, { 
            where: { id },
            individualHooks: true // Garante que o hook beforeUpdate rode para hash da senha
        });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const userToUpdate = await User.findByPk(id);

        // 2. Atualiza os Setores
        if (sectorIds !== undefined && userToUpdate) { 
            await userToUpdate.setSectors(sectorIds); 
        }

        // 3. Busca e retorna o usuário atualizado com seus setores
        const updatedUser = await User.findByPk(id, {
             attributes: { exclude: ['password'] },
             include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });
        
        return res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Erro ao atualizar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o usuário.' });
    }
};

// [DELETE] Excluir um usuário
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRows = await User.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        // 204 No Content é o padrão para DELETE bem sucedido
        return res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao deletar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o usuário.' });
    }
};

module.exports = {
    getAllUsers, 
    getOneUser,
    createUser, 
    updateUser,
    deleteUser
};