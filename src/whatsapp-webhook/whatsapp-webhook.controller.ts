import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { WhatsappWebhookService } from './whatsapp-webhook.service';

import { GenericMessage } from './interfaces';

@Controller('whatsapp-webhook')
export class WhatsappWebhookController {
  constructor(
    private readonly whatsappWebhookService: WhatsappWebhookService,
  ) {}
  // Endpoint para la verificación del webhook
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    return this.whatsappWebhookService.verifyWebhook(mode, token, challenge);
  }

  @Post('webhook')
  async handleIncomingMessage(
    @Body() body: GenericMessage,
    @Req() req: Request,
  ) {
    return this.whatsappWebhookService.getMessages(body, req);
  }

  @Post('webhook/templates')
  async handleTemplates(@Body() body: GenericMessage, @Req() req: Request) {
    return this.whatsappWebhookService.getMessages(body, req.headers);
  }
}
