import express from 'express';
import cors from 'cors';

import { WABAClient, WebhookClient } from 'whatsapp-business';

export const app = express();


const webhookClient = new WebhookClient({
  token: 'recado',
  path: '/whatsapp/webhook',
  expressApp: {
    //Set to false if you want to initialize the server yourself
    //Otherwise, it will start listening when firing initWebhook()
    shouldStartListening: false,
    app: app
  }
});

//You cant get it from the meta for developers app administration
const wabaClient = new WABAClient({
  accountId: '304898196046253',
  apiToken:
    'EAAfjJFcBNNcBOw5tyf3N5GnNslft7aYWldvuAZB2KmFWUzfVAPx4izLITdLCpNDqsKbnZBBJJHGBFDIZBcyLhamjOZBMywOK4voanBxVZA1f1un7LMgR98B24LvVmq1OY99F7ZAfbOOysGSRsGD46ZCnlhoEQmrJLad7VWjFw8SUttHLOVqDPsmrbdgQ1ukpd9DMjEJdzApFzrGnsVtbXhnZCVUniG3sGmMjkqMZD',
  phoneId: '299031526633748'
});

//Starts a server and triggers the received functions based on the webhook event type
webhookClient.initWebhook({
  onStartListening: () => {
    console.log('Server started listening');
  },
  onTextMessageReceived: async (payload, contact) => {
    try {
      const messageId = payload.id.toString();
      const contactNumber = contact.wa_id;
      //Mark message as read
      await wabaClient.markMessageAsRead(messageId);
      //React to message
      await wabaClient.sendMessage({
        to: contactNumber,
        type: 'reaction',
        reaction: { message_id: messageId, emoji: '😄' }
      });
      //Respond to message
      await wabaClient.sendMessage({
        type: 'text',
        to: contactNumber,
        text: { body: 'Ok!' },
        //This is optional, it enables reply-to feature
        context: {
          message_id: messageId
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
});

app.use(cors({ origin: true }));

app.use(express.json());
app.use(express.raw({ type: 'application/vnd.custom-type' }));
app.use(express.text({ type: 'text/html' }));

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.status(200).send({ status: 'ok' });
});

const api = express.Router();

api.get('/hello', (req, res) => {
  res.status(200).send({ message: 'hello world' });
});

// Version the api
app.use('/api/v1', api);
