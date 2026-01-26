import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;               // thêm !

  @Column({ type: "varchar", length: 100, nullable: false })
  name!: string;             // thêm !

  @Column({ type: "varchar", length: 150, unique: true, nullable: false })
  email!: string;            // thêm !

  @Column({ type: "int", default: 0 })
  age!: number;              // thêm !

  @CreateDateColumn()
  createdAt!: Date;          // thêm !

  @UpdateDateColumn()
  updatedAt!: Date;          // thêm !
}