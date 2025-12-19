// Simple test script to verify OpenAI API works
const OpenAI = require('openai').default;

console.log('=== OpenAI API Test ===');
console.log('Testing connection with gpt-5-mini...\n');

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error('ERROR: OPENAI_API_KEY not set!');
    process.exit(1);
}

console.log('API Key found:', apiKey.substring(0, 20) + '...');

const openai = new OpenAI({ apiKey });

async function test() {
    try {
        console.log('\nSending test request...');

        const completion = await openai.chat.completions.create({
            model: 'gpt-5-mini',
            messages: [
                { role: 'user', content: 'Say hello in 10 words or less.' }
            ],
            max_completion_tokens: 50,
        });

        console.log('\n✅ SUCCESS!');
        console.log('Response:', completion.choices[0].message.content);
        console.log('\nAPI connection verified. Ready for regeneration.');

    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        if (error.status) console.error('Status:', error.status);
        if (error.code) console.error('Code:', error.code);
    }
}

test();
