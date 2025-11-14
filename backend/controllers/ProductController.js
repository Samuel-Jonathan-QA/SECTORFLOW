// backend/controllers/ProductController.js

const { Op } = require('sequelize'); 
const Product = require('../models/Product');
const Sector = require('../models/Sector');

const getAllProducts = async (req, res) => {
    try {
        const { role, sectorIds } = req.user;

        let whereCondition = {};

        if (role === 'VENDEDOR') {
            if (!sectorIds || sectorIds.length === 0) {
                return res.status(200).json([]);
            }
            
            whereCondition.sectorId = {
                [Op.in]: sectorIds 
            };
        }

        const products = await Product.findAll({
            where: whereCondition, 
            include: [{ model: Sector, as: 'Sector', attributes: ['id', 'name'] }] 
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

const createProduct = async (req, res) => {
    const { role, sectorIds } = req.user;
    let { name, sectorId, ...rest } = req.body;

    if (!name || !sectorId) {
        return res.status(400).json({ error: 'Nome do produto e Sector ID são obrigatórios.' });
    }

    if (role === 'VENDEDOR') {
        if (!sectorIds || !sectorIds.includes(sectorId)) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode criar produtos nos seus setores designados.' });
        }
    }

    try {
        const newProduct = await Product.create({ name, sectorId, ...rest });

        const productWithSector = await Product.findByPk(newProduct.id, {
            include: [{ model: Sector, as: 'Sector', attributes: ['id', 'name'] }]
        });

        return res.status(201).json(productWithSector);
    } catch (error) {
        console.error('Erro ao criar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível criar o produto.' });
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { role, sectorIds } = req.user;
    let updateData = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        if (role === 'VENDEDOR') {
            if (!sectorIds || !sectorIds.includes(product.sectorId)) {
                return res.status(403).json({ error: 'Acesso negado. Você não pode alterar produtos fora dos seus setores.' });
            }
            if (updateData.sectorId && updateData.sectorId !== product.sectorId) {
                return res.status(403).json({ error: 'Acesso negado. Vendedores não podem mudar o setor de um produto.' });
            }
            
            if (updateData.sectorId) {
                delete updateData.sectorId; 
            }
        }

        const [updatedRows] = await Product.update(updateData, { where: { id } });
        
        const updatedProduct = await Product.findByPk(id, {
            include: [{ model: Sector, as: 'Sector', attributes: ['id', 'name'] }]
        });
        
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o produto.' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { role, sectorIds } = req.user;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        if (role === 'VENDEDOR') {
            if (!sectorIds || !sectorIds.includes(product.sectorId)) {
                return res.status(403).json({ error: 'Acesso negado. Você só pode deletar produtos nos seus setores designados.' });
            }
        }

        const deletedRows = await Product.destroy({ where: { id } });
        
        return res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível deletar o produto.' });
    }
};

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct
};