import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { FacebookHeaders, MessageFromUser } from './interfaces';
import { Request } from 'express';

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
    @Body() body: MessageFromUser,
    @Req() req: Request,
  ) {
    console.log(JSON.stringify(body, null, 3));
    return this.whatsappWebhookService.getMessageFromUser(
      body,
      req.headers as unknown as FacebookHeaders,
    );
  }

  @Post('webhook/templates')
  async handleTemplates(@Body() body: MessageFromUser, @Req() req: Request) {
    return this.whatsappWebhookService.getMessageFromUser(
      body,
      req.headers as unknown as FacebookHeaders,
    );
  }
}
