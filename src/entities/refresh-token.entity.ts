import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

@Entity("refresh_tokens")
@Index(["tokenHash"], { unique: true })
@Index(["userId", "isActive"])
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  tokenHash: string; // SHA-256 hash of the refresh token

  @Column("uuid")
  userId: string;

  @Column({ type: "text" })
  userAgent: string;

  @Column({ type: "varchar", length: 45 })
  ipAddress: string;

  @Column({ type: "varchar", length: 32 })
  fingerprint: string;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
