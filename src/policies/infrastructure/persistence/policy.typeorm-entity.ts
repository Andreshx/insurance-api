import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PolicyBranch } from '../../domain/models/policy-branch.enum';
import { PolicyStatus } from '../../domain/models/policy-status.enum';
import { RatingStrategyName } from '../../domain/models/rating-strategy-name.enum';

@Entity('policies')
export class PolicyTypeormEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'policy_number', type: 'varchar', length: 40, unique: true })
  policyNumber!: string;

  @Index()
  @Column({ name: 'customer_id', type: 'uuid' })
  customerId!: string;

  @Column({ type: 'varchar', length: 30 })
  branch!: PolicyBranch;

  @Column({ name: 'rating_strategy', type: 'varchar', length: 30 })
  ratingStrategy!: RatingStrategyName;

  @Index()
  @Column({ type: 'varchar', length: 30 })
  status!: PolicyStatus;

  @Column({ type: 'jsonb' })
  coverage!: Record<string, unknown>;

  @Column({ name: 'monthly_premium', type: 'numeric' })
  monthlyPremium!: number;

  @Column({ name: 'risk_profile', type: 'jsonb' })
  riskProfile!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}