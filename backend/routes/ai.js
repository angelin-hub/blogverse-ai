const express = require('express');
const router = express.Router();
const { chatWithAI, generateBlogIdeas, suggestTitles, writingAssistant, summarizeBlog } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/chat',              protect, chatWithAI);
router.post('/generate-ideas',    protect, generateBlogIdeas);
router.post('/suggest-titles',    protect, suggestTitles);
router.post('/writing-assistant', protect, writingAssistant);
router.post('/summarize',         protect, summarizeBlog);

module.exports = router;
