import { Module } from '@nestjs/common';
import { WhatsappWebhookService } from './whatsapp-webhook.service';
import { WhatsappWebhookController } from './whatsapp-webhook.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [WhatsappWebhookController],
  providers: [WhatsappWebhookService, ConfigService],
})
export class WhatsappWebhookModule {}
