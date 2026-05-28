const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

module.exports.productSchema = Joi.object({
       
        product: Joi.object ({
       
            name: Joi.string().required().escapeHTML(),
            price: Joi.number().required().min(0),
            brand: Joi.string().required().escapeHTML(),
            category: Joi.string().required().escapeHTML(),
            quantity: Joi.number().required(),
            details: Joi.string().escapeHTML(),
           // image: Joi.string()
        }).required(),
        deleteImages: Joi.array()
    });

module.exports.userSchema = Joi.object({
    // passport-local-mongoose fields
    username: Joi.string().required().escapeHTML(),
    password: Joi.string().required().escapeHTML(), // Usually validated here before hashing
    
    // Core Schema fields
    email: Joi.string().email().required().escapeHTML(),
    
    role: Joi.string().valid('user', 'admin').default('user'),
    
    // Cart validation handles the array of nested objects
    cart: Joi.array().items(
        Joi.object({
            productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
                'string.pattern.base': 'Invalid Product ID format'
            }),
            quantity: Joi.number().integer().min(1).required().default(1)
        })
    ).default([]),
    
    // Design and system properties
    designState: Joi.string().escapeHTML().default('{}'),
    
    designStatus: Joi.string().valid('None', 'Pending Approval', 'Approved', 'Rejected').default('None'),
    
    labourCost: Joi.number().min(0).default(0)
});


   