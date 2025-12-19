// Direct OpenAI API test to capture actual error
import 'dotenv/config';
import OpenAI from 'openai';

async function testOpenAI() {
    console.log('=== OpenAI API Test ===');
    console.log('API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('API Key starts with:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    try {
        // First, list available models to see what we have access to
        console.log('\n--- Listing available models ---');
        const models = await openai.models.list();
        const gptModels = models.data
            .filter(m => m.id.includes('gpt'))
            .map(m => m.id)
            .slice(0, 15);
        console.log('Available GPT models:', gptModels);

        // Now try the model the code is using
        console.log('\n--- Testing gpt-5-mini (as in the code) ---');
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-5-mini',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_completion_tokens: 50
            });
            console.log('Success! Response:', completion.choices[0]?.message?.content);
        } catch (err) {
            console.error('ERROR with gpt-5-mini:', err.message);
            console.error('Full error:', JSON.stringify(err, null, 2));
        }

        // Try a valid model
        console.log('\n--- Testing gpt-4o-mini (valid model) ---');
        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'Say hello' }],
                max_tokens: 50
            });
            console.log('Success! Response:', completion.choices[0]?.message?.content);
        } catch (err) {
            console.error('ERROR with gpt-4o-mini:', err.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testOpenAI();
