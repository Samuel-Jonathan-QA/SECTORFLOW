// backend/controllers/ProductController.js (VERSÃO FINAL CORRIGIDA)

const { Op } = require('sequelize'); // Importa o operador ORM
const Product = require('../models/Product');
const Sector = require('../models/Sector');

// [GET] Listar todos os produtos (COM FILTRO DE PERMISSÃO)
const getAllProducts = async (req, res) => {
    try {
        const { role, sectorIds } = req.user; // Obtém info do usuário logado

        let whereCondition = {};

        // 🚨 Lógica de Filtro para VENDEDOR 🚨
        if (role === 'VENDEDOR') {
            // O vendedor só pode ver produtos em seus setores permitidos
            if (sectorIds && sectorIds.length > 0) {
                whereCondition.sectorId = {
                    [Op.in]: sectorIds // Usa o operador IN para incluir todos os IDs permitidos
                };
            } else {
                // Se for VENDEDOR, mas não tiver setores, não mostra nada
                whereCondition.sectorId = null;
            }
        }
        // Se for ADMIN ou USER, a whereCondition fica vazia e mostra todos.

        const products = await Product.findAll({
            where: whereCondition, // Aplica o filtro
            include: [{ model: Sector, as: 'Sector', attributes: ['id', 'name'] }] // Usa o alias 'Sector'
        });
        return res.status(200).json(products);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// [POST] Criar um novo produto (COM VALIDAÇÃO DE PERMISSÃO)
const createProduct = async (req, res) => {
    const { role, sectorIds } = req.user;
    let { name, sectorId, ...rest } = req.body;

    if (!name || !sectorId) {
        return res.status(400).json({ error: 'Nome do produto e Sector ID são obrigatórios.' });
    }

    // 🚨 Lógica de Validação para VENDEDOR 🚨
    if (role === 'VENDEDOR') {
        // Verifica se o sectorId fornecido está na lista de setores do Vendedor
        if (!sectorIds || !sectorIds.includes(sectorId)) {
            return res.status(403).json({ error: 'Acesso negado. Você só pode criar produtos nos seus setores designados.' });
        }
    }
    // O ADMIN pode criar em qualquer setor fornecido.

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

// [PUT] Atualizar um produto (COM VALIDAÇÃO DE PERMISSÃO E DADOS)
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { role, sectorIds } = req.user;
    const updateData = req.body;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // 🚨 Lógica de Validação para VENDEDOR 🚨
        if (role === 'VENDEDOR') {
            // 1. O Vendedor só pode alterar produtos nos seus setores.
            if (!sectorIds || !sectorIds.includes(product.sectorId)) {
                return res.status(403).json({ error: 'Acesso negado. Você não pode alterar produtos fora dos seus setores.' });
            }
            // 2. O Vendedor NÃO PODE alterar o sectorId de um produto
            if (updateData.sectorId && updateData.sectorId !== product.sectorId) {
                return res.status(403).json({ error: 'Acesso negado. Vendedores não podem mudar o setor de um produto.' });
            }
        }
        // O ADMIN pode fazer qualquer alteração.

        const [updatedRows] = await Product.update(updateData, { where: { id } });
        // ... continua o código de retorno ...
        
        const updatedProduct = await Product.findByPk(id, {
            include: [{ model: Sector, as: 'Sector', attributes: ['id', 'name'] }]
        });
        
        return res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error.message);
        return res.status(500).json({ error: 'Não foi possível atualizar o produto.' });
    }
};

// [DELETE] Excluir um produto (COM VALIDAÇÃO DE PERMISSÃO E DADOS)
const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { role, sectorIds } = req.user;

    try {
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        // 🚨 Lógica de Validação para VENDEDOR 🚨
        if (role === 'VENDEDOR') {
            // O Vendedor só pode deletar produtos nos seus setores.
            if (!sectorIds || !sectorIds.includes(product.sectorId)) {
                return res.status(403).json({ error: 'Acesso negado. Você só pode deletar produtos nos seus setores designados.' });
            }
        }
        // O ADMIN pode deletar.

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