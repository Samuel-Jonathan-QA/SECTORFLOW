const User = require('../models/User');
const Sector = require('../models/Sector');
const { sequelize } = require('../config/database');

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const ALLOWED_SPECIAL_CHARS = '!@#$%&*';

const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const isValidEmail = (email) => {
    const trimmedEmail = email ? String(email).trim() : '';

    if (!trimmedEmail) return false;

    return EMAIL_REGEX.test(trimmedEmail);
};

const validateName = (name) => {
    const trimmedName = name ? String(name).trim() : '';

    if (!trimmedName) {
        return 'O nome é obrigatório.';
    }
    
    if (trimmedName.length < 3 || trimmedName.length > 50) {
        return 'O nome deve conter de 3 a 50 caracteres.';
    }

    const validNameRegex = /^[a-zA-Z\s\u00C0-\u00FF'-]+$/;
    if (!validNameRegex.test(trimmedName)) {
        return 'Nome inválido. Use apenas letras, espaços, hífens e apóstrofos.';
    }

    const atLeastThreeLettersRegex = /[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF].*[a-zA-Z\u00C0-\u00FF]/;
    if (!atLeastThreeLettersRegex.test(trimmedName)) {
        return 'O nome deve conter pelo menos 3 caracteres de letra.';
    }
    
    return null;
};


const validatePassword = (password) => {
    const errors = [];
    const minLength = 8;
    const maxLength = 32;

    if (!password) {
        return 'A senha é obrigatória.';
    }

    if (/\s/.test(password)) {
        errors.push('sem espaços');
    }

    if (password.length < minLength) {
        errors.push(`mínimo de ${minLength} caracteres`);
    }

    if (password.length > maxLength) {
        errors.push(`máximo de ${maxLength} caracteres`);
    }

    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('mínimo 1 letra minúscula');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('mínimo 1 letra maiúscula');
    }

    if (!/(?=.*[0-9].*[0-9])/.test(password)) {
        errors.push('mínimo 2 números');
    }

    const specialCharRegex = new RegExp(`(?=.*[${ALLOWED_SPECIAL_CHARS.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}])`);
    if (!specialCharRegex.test(password)) {
        errors.push(`mínimo 1 caractere especial (${ALLOWED_SPECIAL_CHARS})`);
    }

    if (errors.length > 0) {
        return `A senha não atende aos requisitos. Deve ter: ${errors.join(', ')}.`;
    }

    return null;
};

const removeOldProfilePicture = (oldPath) => {
    if (oldPath && oldPath.startsWith('/uploads/profile_pictures/')) {
        const filename = path.basename(oldPath);
        const filePath = path.join(__dirname, '..', 'uploads', 'profile_pictures', filename);

        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error(`Erro ao remover arquivo: ${err.message}`);
        }
    }
};


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
    let sectorIdsRaw = req.body['sectorIds[]'] || req.body.sectorIds;

    const { name, email, password, role, ...rest } = req.body; 
    let transaction;

    let sectorIdArray = [];
    if (sectorIdsRaw) {
        const tempArray = Array.isArray(sectorIdsRaw) ? sectorIdsRaw : Array.of(sectorIdsRaw);

        sectorIdArray = tempArray
            .map(id => String(id).trim())
            .filter(id => id.length > 0);
    }

    const profilePicturePath = req.file
        ? `/uploads/profile_pictures/${req.file.filename}`
        : null;

    if (!name || !email || !password || !role) { 
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({ error: 'Nome, email, senha e role são obrigatórios.' });
    }

    const nameErrorMsg = validateName(name);
    if (nameErrorMsg) {
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({ error: nameErrorMsg });
    }
    const trimmedName = name.trim();


    if (!isValidEmail(email)) {
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({ error: 'O formato do email é inválido.' });
    }

    const passwordErrorMsg = validatePassword(password);
    if (passwordErrorMsg) {
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({ error: passwordErrorMsg });
    }

    const allowedRoles = ['ADMIN', 'VENDEDOR'];
    const roleUpper = role.toUpperCase();

    if (!allowedRoles.includes(roleUpper)) {
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({
            error: `Role inválida. Valores aceitos: ${allowedRoles.join(', ')}.`
        });
    }

    if (roleUpper === 'VENDEDOR' && sectorIdArray.length === 0) {
        if (req.file) { removeOldProfilePicture(profilePicturePath); }
        return res.status(400).json({ error: 'Vendedores devem ser associados a pelo menos um setor.' });
    }

    const trimmedEmail = email.trim();

    try {
        transaction = await sequelize.transaction();

        const newUser = await User.create({
            name: trimmedName, 
            email: trimmedEmail, 
            password,
            role: roleUpper,
            profilePicture: profilePicturePath,
            ...rest
        }, { transaction });

        if (sectorIdArray.length > 0) {
            const sectors = await Sector.findAll({ where: { id: sectorIdArray } });

            if (sectors.length !== sectorIdArray.length) {
                await transaction.rollback();
                if (req.file) { removeOldProfilePicture(profilePicturePath); }
                return res.status(400).json({ error: 'Um ou mais IDs de setor fornecidos são inválidos.' });
            }

            await newUser.setSectors(sectors, { transaction });
        }

        await transaction.commit();

        const userWithSectors = await User.findByPk(newUser.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });

        return res.status(201).json(userWithSectors);

    } catch (error) {
        if (transaction) await transaction.rollback();

        if (req.file) {
            removeOldProfilePicture(profilePicturePath);
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'O email fornecido já está em uso.' });
        }
        console.error('Erro ao criar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o usuário.' });
    }
};

const updateUser = async (req, res) => {
    const { id } = req.params; 

    const loggedInUser = req.user; 

    if (loggedInUser.role !== 'ADMIN' && String(loggedInUser.id) !== String(id)) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
    }

    let sectorIdsRaw = req.body['sectorIds[]'] || req.body.sectorIds;

    const { email, password, profilePictureRemove, ...updateData } = req.body; 

    let transaction;

    const newFilePath = req.file
        ? `/uploads/profile_pictures/${req.file.filename}`
        : null;

    try {
        transaction = await sequelize.transaction();

        const userToUpdate = await User.findByPk(id, { transaction });

        if (!userToUpdate) {
            if (req.file) { removeOldProfilePicture(newFilePath); }
            await transaction.rollback();
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        if (updateData.name !== undefined) {
            const nameErrorMsg = validateName(updateData.name);
            if (nameErrorMsg) {
                if (req.file) { removeOldProfilePicture(newFilePath); }
                await transaction.rollback();
                return res.status(400).json({ error: nameErrorMsg });
            }
            updateData.name = updateData.name.trim(); 
        }


        if (email !== undefined) {
            if (!isValidEmail(email)) {
                if (req.file) { removeOldProfilePicture(newFilePath); }
                await transaction.rollback();
                return res.status(400).json({ error: 'O formato do email é inválido.' });
            }
            updateData.email = email.trim();
        }

        if (password) {
            const passwordErrorMsg = validatePassword(password);
            if (passwordErrorMsg) {
                if (req.file) { removeOldProfilePicture(newFilePath); }
                await transaction.rollback();
                return res.status(400).json({ error: passwordErrorMsg });
            }
            updateData.password = password;
        }

        let profilePictureToSave = userToUpdate.profilePicture;

        if (req.file) {
            removeOldProfilePicture(userToUpdate.profilePicture);
            profilePictureToSave = newFilePath;

        } else if (profilePictureRemove === 'true') {
            removeOldProfilePicture(userToUpdate.profilePicture);
            profilePictureToSave = null;
        }

        updateData.profilePicture = profilePictureToSave;

        const emailToCheck = updateData.email || userToUpdate.email;

        const roleToCheck = updateData.role ? updateData.role.toUpperCase() : userToUpdate.role.toUpperCase();

        if (loggedInUser.role !== 'ADMIN' && updateData.role && updateData.role.toUpperCase() !== loggedInUser.role) {
             if (req.file) { removeOldProfilePicture(newFilePath); }
             await transaction.rollback();
             return res.status(403).json({ error: 'Acesso negado. Você não pode alterar sua própria função (role).' });
        }


        const allowedRoles = ['ADMIN', 'VENDEDOR'];

        if (!allowedRoles.includes(roleToCheck)) {
            if (req.file) { removeOldProfilePicture(newFilePath); }
            await transaction.rollback();
            return res.status(400).json({
                error: `Role inválida. Valores aceitos: ${allowedRoles.join(', ')}.`
            });
        }

        if (updateData.role) {
            updateData.role = roleToCheck;
        }

        let sectorIdArray = [];
        let shouldValidateSector = false;

        if (sectorIdsRaw !== undefined) {
            shouldValidateSector = true;
            const tempArray = Array.isArray(sectorIdsRaw) ? sectorIdsRaw : Array.of(sectorIdsRaw);

            sectorIdArray = tempArray
                .map(id => String(id).trim())
                .filter(id => id.length > 0);
        }

        if (roleToCheck === 'VENDEDOR' && shouldValidateSector && sectorIdArray.length === 0) {
            if (req.file) { removeOldProfilePicture(newFilePath); }
            await transaction.rollback();
            return res.status(400).json({ error: 'Vendedores devem ser associados a pelo menos um setor.' });
        }


        const [updatedRows] = await User.update(updateData, {
            where: { id },
            individualHooks: true,
            transaction
        });

        if (sectorIdsRaw !== undefined) {
            const sectors = await Sector.findAll({ where: { id: sectorIdArray }, transaction });

            if (sectors.length !== sectorIdArray.length) {
                await transaction.rollback();
                if (req.file) { removeOldProfilePicture(newFilePath); }
                return res.status(400).json({ error: 'Um ou mais IDs de setor fornecidos são inválidos.' });
            }

            await userToUpdate.setSectors(sectors, { transaction });
        }


        await transaction.commit();

        const updatedUser = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Sector, as: 'Sectors', attributes: ['id', 'name'] }]
        });

        return res.status(200).json(updatedUser);

    } catch (error) {
        if (transaction) await transaction.rollback();

        if (req.file) {
            removeOldProfilePicture(newFilePath);
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'O email fornecido já está em uso.' });
        }

        console.error('Erro ao atualizar usuário:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o usuário.' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const loggedInUser = req.user;

    if (loggedInUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Acesso negado. Somente administradores podem deletar usuários.' });
    }

    if (String(loggedInUser.id) === String(id)) {
        return res.status(403).json({ error: 'Acesso negado. Administradores não podem deletar a si mesmos.(back-end)' });
    }

    try {
        const userToDelete = await User.findByPk(id, { attributes: ['profilePicture'] });

        if (!userToDelete) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        removeOldProfilePicture(userToDelete.profilePicture);

        const deletedRows = await User.destroy({ where: { id } });

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