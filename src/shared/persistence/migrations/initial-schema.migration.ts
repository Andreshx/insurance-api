import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1720000000000 implements MigrationInterface {
  name = 'InitialSchema1720000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "id" uuid NOT NULL,
        "name" varchar(120) NOT NULL,
        "email" varchar(180) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_customers_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "policies" (
        "id" uuid NOT NULL,
        "policy_number" varchar(40) NOT NULL,
        "customer_id" uuid NOT NULL,
        "branch" varchar(30) NOT NULL,
        "rating_strategy" varchar(30) NOT NULL,
        "status" varchar(30) NOT NULL,
        "coverage" jsonb NOT NULL,
        "monthly_premium" numeric NOT NULL,
        "risk_profile" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_policies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_policies_policy_number" UNIQUE ("policy_number")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_policies_customer_id" ON "policies" ("customer_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_policies_status" ON "policies" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "policies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
  }
}
