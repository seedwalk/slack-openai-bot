import { config } from "dotenv";
import { App } from '@slack/bolt';
import { OpenAIApi, Configuration } from 'openai';

config();

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


const customPrompt = 'Sos un Agente de Viajes y te llamas Mevuelito. Vas a ayudar cual secretario para todo aquel que te contacte.'

app.event('app_mention', async ({ event, say }) => {
  console.log(event.text)
  const message = event.text.replace(`<@${process.env.BOT_USER_ID}> `, '')
  if (message.length > 2) {
    try {
      const aiResponse = await openai.createCompletion(
        {
          "model": "text-davinci-003",
          "prompt": `${customPrompt} ${message}`,
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
