import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WhatsappWebhookModule } from './whatsapp-webhook/whatsapp-webhook.module';

@Module({
  imports: [ConfigModule.forRoot(), WhatsappWebhookModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
