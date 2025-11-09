// backend/controllers/SectorController.js (CORRIGIDO E COMPLETO)

const Sector = require('../models/Sector'); //

// 1. [GET] Listar todos os setores
const getAllSectors = async (req, res) => { //
    try {
        const sectors = await Sector.findAll();
        // Retorna a lista de setores com status 200 (OK)
        return res.status(200).json(sectors); //
    } catch (error) {
        // Loga o erro e retorna status 500 (Internal Server Error)
        console.error('Erro ao buscar setores:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' }); //
    }
};

// 2. [POST] Criar um novo setor
const createSector = async (req, res) => { //
    const { name } = req.body;

    // Validação básica do dado de entrada
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome do setor é obrigatório.' }); //
    }

    try {
        // Cria um novo setor no banco
        const newSector = await Sector.create({ name });

        // Retorna o setor criado com status 201 (Created)
        return res.status(201).json(newSector); //
    } catch (error) {
        console.error('Erro ao criar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o setor.' }); //
    }
};

// 3. [PUT] Atualizar um setor
const updateSector = async (req, res) => { //
    const { id } = req.params;
    const { name } = req.body;

    // Validação
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: 'O nome do setor é obrigatório.' }); //
    }

    try {
        const [updatedRows] = await Sector.update({ name }, {
            where: { id }
        });

        if (updatedRows === 0) {
            // Se 0 linhas foram afetadas, o setor não foi encontrado
            return res.status(404).json({ error: 'Setor não encontrado.' }); //
        }

        // Busca o setor atualizado para retornar ao cliente
        const updatedSector = await Sector.findByPk(id);
        return res.status(200).json(updatedSector); //
    } catch (error) {
        console.error('Erro ao atualizar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o setor.' }); //
    }
};

// 4. [DELETE] Excluir um setor
const deleteSector = async (req, res) => { //
    const { id } = req.params;

    try {
        const deletedRows = await Sector.destroy({
            where: { id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Setor não encontrado.' }); //
        }

        // Retorna status 204 (No Content) para exclusão bem-sucedida
        return res.status(204).send(); //
    } catch (error) {
        console.error('Erro ao deletar setor:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o setor.' });
    }
};

// 🚨 ESTE BLOCO DE EXPORTAÇÃO É CRÍTICO 🚨
module.exports = {
    getAllSectors,
    createSector,
    updateSector,
    deleteSector,
};