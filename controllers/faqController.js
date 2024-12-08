const path = require('path');
const supabase = require('../utils/supabaseClient');
const Faq = require('../models/Faq');

exports.getFaqs = async (req, res) => {
    try {
        const faqs = await Faq.getAllFaq(); 

        const response = await Promise.all(faqs.map(async (faq) => {
            return {
                faq_id: faq.faq_id,
                question: faq.question,
                answer: faq.answer
            };
        }));

        res.json(response); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};