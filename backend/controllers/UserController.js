// backend/controllers/UserController.js

const User = require('../models/User');
const Sector = require('../models/Sector'); // 🚨 Importar Sector para associação
const bcrypt = require('bcryptjs');



// [POST] Rota de Login (COMPLETO)
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ 
            where: { email },
            // 🚨 Buscar setores na hora do login para enviar ao Frontend 🚨
            include: [{ model: Sector, as: 'Sectors', attributes: ['id'] }]
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            const userToReturn = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role, // 🚨 Incluir a Role
                // Mapeia os IDs dos setores para fácil uso no Frontend e Backend
                sectorIds: user.Sectors ? user.Sectors.map(s => s.id) : [] 
            };
            
            res.json({
                token: generateToken(user.id),
                user: userToReturn
            });
        } else {
            res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro no login:', error.message);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [GET] Listar todos os usuários (Inclui a Role e Setores)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ['password'] },
            // 🚨 Incluir os setores para que o Frontend possa ver as vinculações 🚨
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });
        return res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [POST] Criar um novo usuário (REFATORADO N:N)
const createUser = async (req, res) => {
    const { email, password, role, sectorIds, ...rest } = req.body; 

    if (!email || !password || !role) { 
        return res.status(400).json({ error: 'Email, senha e role são obrigatórios.' });
    }

    if (role === 'VENDEDOR' && (!sectorIds || sectorIds.length === 0)) {
        return res.status(400).json({ error: 'Vendedores devem ser associados a pelo menos um setor.' });
    }

    try {
        const newUser = await User.create({ email, password, role, ...rest }); 

        if (sectorIds && sectorIds.length > 0) {
            await newUser.setSectors(sectorIds); // Vincula os setores
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

// [PUT] Atualizar um usuário (REFATORADO N:N)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { password, sectorIds, ...updateData } = req.body; 

    try {
        // ... (Lógica de hash de senha existente)
        if (password) {
             updateData.password = await bcrypt.hash(password, 10);
        }

        // 1. Atualiza os campos básicos
        const [updatedRows] = await User.update(updateData, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        
        const userToUpdate = await User.findByPk(id);

        // 2. Atualiza os Setores
        if (sectorIds !== undefined) { 
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
        return res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao deletar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o usuário.' });
    }
};

module.exports = {
    getAllUsers, // 🚨 Sincronizado
    createUser, // 🚨 Sincronizado
    updateUser,
    deleteUser
};