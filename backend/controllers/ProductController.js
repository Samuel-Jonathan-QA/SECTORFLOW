// backend/controllers/ProductController.js (VERSÃO FINAL CORRIGIDA)

const Product = require('../models/Product');
const Sector = require('../models/Sector'); 

// [GET] Listar todos os produtos
const getAllProducts = async (req, res) => { // REMOVIDO: exports.
    try {
        const products = await Product.findAll({
            include: [{ model: Sector, attributes: ['id', 'name'] }] 
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [POST] Criar um novo produto
const createProduct = async (req, res) => { // REMOVIDO: exports.
    const { name, sectorId, ...rest } = req.body;

    if (!name || !sectorId) {
        return res.status(400).json({ error: 'Nome do produto e Sector ID são obrigatórios.' });
    }

    try {
        const newProduct = await Product.create(req.body);
        
        const productWithSector = await Product.findByPk(newProduct.id, {
            include: [{ model: Sector, attributes: ['id', 'name'] }]
        });

        return res.status(201).json(productWithSector);
    } catch (error) {
        console.error('Erro ao criar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o produto.' });
    }
};

// [PUT] Atualizar um produto
const updateProduct = async (req, res) => { // REMOVIDO: exports.
    const { id } = req.params; 
    const updateData = req.body;

    try {
        const [updatedRows] = await Product.update(updateData, { where: { id } });

        if (updatedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        const updatedProduct = await Product.findByPk(id, {
            include: [{ model: Sector, attributes: ['id', 'name'] }]
        });
        
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o produto.' });
    }
};

// [DELETE] Excluir um produto
const deleteProduct = async (req, res) => { // REMOVIDO: exports.
    const { id } = req.params;

    try {
        const deletedRows = await Product.destroy({ where: { id } });

        if (deletedRows === 0) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o produto.' });
    }
};

// 🚨 A EXPORTAÇÃO ÚNICA E FINAL 🚨
module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
};