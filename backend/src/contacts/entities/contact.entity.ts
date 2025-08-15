import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  Entity,
  BeforeInsert,
  PrimaryColumn,
  ValueTransformer,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class UuidTransformer implements ValueTransformer {
  to(value: string): Buffer {
    return Buffer.from(value.replace(/-/g, ''), 'hex');
  }
  from(value: Buffer): string {
    return value
      .toString('hex')
      .replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
  }
}

@Entity('contacts')
@Exclude()
export class Contact {
  @PrimaryColumn('binary', {
    length: 16,
    transformer: new UuidTransformer(),
  })
  // @Expose({ groups: ['dev'] })
  @Expose()
  id: string;

  @Column()
  @Expose()
  name: string;

  @Column({ unique: true })
  @Expose()
  phone: string;

  @Column({ unique: true })
  @Expose()
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  @Expose({ groups: ['dev'] })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @Expose({ groups: ['dev'] })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
