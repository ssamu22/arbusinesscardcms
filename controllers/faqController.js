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

exports.updateFaq = async (req, res) => {
    const faqs = req.body;
    
    try {
        const updatedFaqs = [];
        for (const entry of faqs) {
            const { faq_id, question, answer } = entry;
            const faq = await Faq.getById(faq_id);
            
            if (faq) {
                faq.question = question;
                faq.answer = answer;

                const updatedFaq = await faq.save();
                updatedFaqs.push(updatedFaq);
            } else {
                console.error(`FAQ with id ${faq_id} not found.`);
            }
        }

        res.status(200).json({
            updatedFaqs
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};