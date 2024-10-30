import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';

import { FacebookHeaders, MessageFromUser } from './interfaces';

@Injectable()
export class WhatsappWebhookService {
  private sessionCookie: string = '';

  constructor(private readonly configService: ConfigService) {}

  async verifyWebhook(mode: string, token: string, challenge: string) {
    const verifyToken = this.configService.get('TOKEN_ODOO');

    if (mode && token === verifyToken) {
      try {
        const odooConection = await axios.get(
          `https://hortomallas1.odoo.com/whatsapp/webhook?hub.mode=${mode}&hub.challenge=${challenge}&hub.verify_token=${token}`,
        );

        this.sessionCookie =
          odooConection.headers['set-cookie'][0].split(';')[0];
        console.log('Token verificado correctamente ');
        return odooConection.data; // Verificación exitosa.
      } catch (error) {
        console.log(`error al verificar el token: ${error}`);
      }
    }

    return 'Token de verificación incorrecto';
  }

  async getMessageFromUser(
    messageFromUser: MessageFromUser,
    facebookHeaders: FacebookHeaders,
  ) {
    let messageFormatted = {};
    const secret = this.configService.get('SECRET_APP');

    console.log('Mensaje entrante: ', JSON.stringify(messageFromUser, null, 4));

    if (messageFromUser?.entry[0]?.changes[0]?.value?.messages) {
      if (
        'referral' in messageFromUser?.entry[0]?.changes[0]?.value?.messages[0]
      ) {
        const modifiedMessage = JSON.parse(JSON.stringify(messageFromUser)); // Hacer una copia profunda
        const referral =
          modifiedMessage.entry[0].changes[0].value.messages[0].referral;

        const body = `
      -- MENSAJE DE ANUNCIO --
      * URL: ${referral.source_url}
      * TÍTULO: ${referral.headline}
      ------------------------
      Mensaje Del Cliente:
      ${messageFromUser.entry[0].changes[0].value.messages[0].text.body}
      `;

        let messages = {
          from: messageFromUser.entry[0].changes[0].value.messages[0].from,
          id: messageFromUser.entry[0].changes[0].value.messages[0].id,
          timestamp:
            messageFromUser.entry[0].changes[0].value.messages[0].timestamp,
          text: {
            body: body,
          },
          type: messageFromUser.entry[0].changes[0].value.messages[0].type,
        };

        modifiedMessage.entry[0].changes[0].value.messages[0] = messages;
        messageFormatted = modifiedMessage;

        const payload = JSON.stringify(messageFormatted);
        const xHubSignature256 = `sha256=${crypto
          .createHmac('sha256', secret)
          .update(payload, 'utf8') // Actualiza el HMAC con el payload
          .digest('hex')}`;

        await axios
          .post(
            `https://hortomallas1.odoo.com/whatsapp/webhook`,
            messageFormatted,
            {
              headers: {
                'x-hub-signature-256': xHubSignature256,
              },
            },
          )
          .then((response) => {
            console.log(JSON.stringify({ data: response.data }, null, 4));

            return response.data;
          })
          .catch((err) => {
            if (err.isAxiosError) {
              const axiosError = err as AxiosError;
              console.error('Axios error message:', axiosError.message);
              console.error('Axios error config:', axiosError.config);
              console.error('Axios error code:', axiosError.code);
            } else {
              console.log('error', err);
            }
          });
      }
    }

    await axios
      .post(`https://hortomallas1.odoo.com/whatsapp/webhook`, messageFromUser, {
        headers: {
          ...facebookHeaders,
          host: 'hortomallas1.odoo.com',
        },
      })
      .then((response) => {
        console.log(JSON.stringify({ data: response.data }, null, 4));
      })
      .catch((err) => {
        if (err.isAxiosError) {
          const axiosError = err as AxiosError;
          console.error('Axios error message:', axiosError.message);
          console.error('Axios error config:', axiosError.config);
          console.error('Axios error code:', axiosError.code);
        } else {
          console.log('error', err);
        }
      });
  }
}
