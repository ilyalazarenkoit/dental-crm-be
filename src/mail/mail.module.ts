import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MailService } from "./mail.service";
import mailConfig from "@/config/mail.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mailConfig],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
