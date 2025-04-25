import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';
import axios, { AxiosError } from 'axios';

import { FacebookHeaders, GenericMessage } from './interfaces';

@Injectable()
export class WhatsappWebhookService {
  private sessionCookie;
  private logger = new Logger();

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

        this.logger.log('Token verificado correctamente ');
        return odooConection.data;
      } catch (error) {
        this.logger.error(`error al verificar el token: ${error}`);
      }
    }

    return 'Token de verificación incorrecto';
  }

  async getMessages(message: GenericMessage, headers: any) {
    if ('statuses' in message.entry[0].changes[0].value) {
      // this.sendMessageFromOdoo(message, headers);
    } else if ('messages' in message.entry[0].changes[0].value) {
      this.sendMessageFromUser(message, headers);
    } else if ('referral' in message.entry[0].changes[0].value?.messages[0]) {
      this.sendMessageFromCampaigns(message, headers);
    }
  }

  async sendMessageFromCampaigns(
    message: GenericMessage,
    headers: FacebookHeaders,
  ) {
    let messageFormatted = {};
    const secret = this.configService.get('SECRET_APP');
    const modifiedMessage = JSON.parse(JSON.stringify(message)); //! Hacer una copia profunda
    const referral =
      modifiedMessage.entry[0].changes[0].value.messages[0].referral;
    const originalMessage = message.entry[0].changes[0].value.messages[0];

    const body = `
    [- CAMAPAÑA DE FACEBOOK         -]
    | URL: ${referral.source_url}
    | TÍTULO: ${referral.headline}
    |---------------------------------|
    | Mensaje:
    | ${originalMessage.text.body}
    `;

    let messages = {
      from: originalMessage.from,
      id: originalMessage.id,
      timestamp: originalMessage.timestamp,
      text: { body: body },
      type: originalMessage.type,
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
        { headers: { 'x-hub-signature-256': xHubSignature256 } },
      )
      .then((response) => {
        this.logger.log('[- MENSAJE DE CAMPAÑA -]');
        this.logger.log(JSON.stringify(response.data, null, 3));

        return response.data;
      })
      .catch((err) => {
        if (err.isAxiosError) {
          const axiosError = err as AxiosError;
          this.logger.error('Axios Error:', axiosError.message);
          return;
        } else {
          this.logger.error('General Error', err);
          return;
        }
      });
  }

  async sendMessageFromUser(message: any, headers: FacebookHeaders) {
    await axios
      .post(`https://hortomallas1.odoo.com/whatsapp/webhook`, message, {
        headers: {
          ...headers,
          host: 'hortomallas1.odoo.com',
        },
      })
      .then((response) => {
        this.logger.log('[- MENSAJE DE CLIENTE -]');
        this.logger.log(JSON.stringify(response, null, 3));
      })
      .catch((err) => {
        this.logger.error('El mensaje del cliente no se pudo enviar.');
        if (err.isAxiosError) {
          const axiosError = err as AxiosError;
          this.logger.error('Axios Error:', axiosError.message);
        } else {
          this.logger.error('General Error', err);
        }
      });
  }

  //! Parece ser que no es necesario implementarlo porque Odoo se lo envía directamente a WhatsApp.
  // async sendMessageFromOdoo(message: any, headers: FacebookHeaders) {}
}
