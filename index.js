require('dotenv').config();
const { App } = require('@slack/bolt');
const { OpenAIApi, Configuration } = require('openai');

const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN;
const slackToken = process.env.SLACK_TOKEN;
const slackSigningSecret = process.env.SLACK_SIGNIN_SECRET;
const CHATGPTKey = process.env.CHATGPTKey;

const configuration = new Configuration({
  apiKey: CHATGPTKey,
});

const openai = new OpenAIApi(configuration);

const app = new App({
  token: slackToken,
  signingSecret: slackSigningSecret,
  appToken: SLACK_APP_TOKEN,
  socketMode: true,
});

app.event('app_mention', async ({ event, say }) => {
  const message = event.text.replace(`<@${process.env.BOT_USER_ID}> `, '')
  if (message.length > 2) {
    try {
      const aiResponse = await openai.createCompletion(
        {
          "model": "text-davinci-003",
          "prompt": `${message}`,
          "max_tokens": 1000,
          "temperature": 0.7
        }
      );

      console.log(aiResponse.data.choices)
      const reply = aiResponse.data.choices[0].text;
      await say({
        text: reply,
      });
    }
    catch (e) {
      console.log(e.message)
      await say({
        text: 'There was an error please try again',
      });
    }
  } else {
    await say({
      text: 'Hi. How may i assist today?',
    });
  }

});

// Add more event listeners as needed

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('Bot is running!');
})();
