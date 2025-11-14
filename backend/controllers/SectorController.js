// backend/controllers/SectorController.js

const Sector = require('../models/Sector'); 

const getAllSectors = async (req, res) => { 
    try {
        const sectors = await Sector.findAll();
        return res.status(200).json(sectors); 
    } catch (error) {
        console.error('Erro ao buscar setores:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' }); 
    }
};

const createSector = async (req, res) => { 
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome do setor é obrigatório.' }); 
    }

    try {
        const newSector = await Sector.create({ name });

        return res.status(201).json(newSector); 
    } catch (error) {
        console.error('Erro ao criar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o setor.' }); 
    }
};

const updateSector = async (req, res) => { 
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome do setor é obrigatório.' }); 
    }

    try {
        const [updatedRows] = await Sector.update({ name }, {
            where: { id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Setor não encontrado.' }); 
        }

        const updatedSector = await Sector.findByPk(id);
        return res.status(200).json(updatedSector); 
    } catch (error) {
        console.error('Erro ao atualizar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o setor.' }); 
    }
};

const deleteSector = async (req, res) => { 
    const { id } = req.params;

    try {
        const deletedRows = await Sector.destroy({
            where: { id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Setor não encontrado.' }); 
        }

        return res.status(204).send(); 
    } catch (error) {
        console.error('Erro ao deletar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o setor.' });
    }
};

module.exports = {
    getAllSectors,
    createSector,
    updateSector,
    deleteSector,
};