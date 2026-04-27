import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;               // thêm !

  @Column({ type: "varchar", length: 100, nullable: false })
  name!: string;             // thêm !

  @Column({ type: "varchar", length: 150, nullable: false })
  email!: string;            // thêm !

  @Column({ type: "int", default: 0 })
  age!: number;              // thêm !

  @Column({ nullable: true, select: false }) // select:false → không trả password ra ngoài
  password!: string;

  @Column({ default: "user" })
  role!: string; // "user" | "admin"
  
  @CreateDateColumn()
  createdAt!: Date;          // thêm !

  @UpdateDateColumn()
  updatedAt!: Date;          // thêm !
}