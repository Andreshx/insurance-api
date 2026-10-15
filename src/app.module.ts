import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitialSchema1720000000000 } from './shared/persistence/migrations/initial-schema.migration';
import { CustomersModule } from './customers/customers.module';
import { PoliciesModule } from './policies/policies.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({

      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [InitialSchema1720000000000],
      }),
    }),

    CustomersModule,
    NotificationsModule,
    PoliciesModule,
  ],
})
export class AppModule { }
