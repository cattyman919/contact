import {Column, Entity, BeforeInsert, PrimaryColumn, ValueTransformer, CreateDateColumn, UpdateDateColumn} from 'typeorm'
import {v4 as uuidv4} from 'uuid'

export class UuidTransformer implements ValueTransformer {
  to(value: string): Buffer {
    return Buffer.from(value.replace(/-/g, ''), 'hex');
  }
  from(value: Buffer): string {
    return value.toString('hex').replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
  }
}

@Entity('contacts')
export class Contact {

  @PrimaryColumn('binary', {
    length: 16,
    transformer: new UuidTransformer(),
  })
  id: string;

  @Column()
  name: string;
    @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

}
