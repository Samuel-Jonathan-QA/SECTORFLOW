// backend/controllers/UserController.js

const User = require('../models/User');
const Sector = require('../models/Sector'); 
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ['password'] },
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

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

const createUser = async (req, res) => {
    const { email, password, role, sectorIds, ...rest } = req.body; 

    if (!email || !password || !role) { 
        return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
    }

    if (role.toUpperCase() === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
        return res.status(400).json({ error: 'Vendedores devem ser associados a pelo menos um setor.' });
    }

    try {
        const newUser = await User.create({ email, password, role, ...rest }); 

        if (sectorIds && sectorIds.length > 0) {
            await newUser.setSectors(sectorIds); 
        }

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

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, sectorIds, ...updateData } = req.body; 

    try {
        if (password) {
            updateData.password = password; 
        }

        const [updatedRows] = await User.update(updateData, { 
            where: { id },
            individualHooks: true 
        });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const userToUpdate = await User.findByPk(id);

        if (sectorIds !== undefined && userToUpdate) { 
            await userToUpdate.setSectors(sectorIds); 
        }

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

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRows = await User.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
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