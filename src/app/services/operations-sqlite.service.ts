/**Este servicio, NativeSQLiteService, funciona en android o ios, 
 * y el servicio web, WebSQLiteService, no funciona en web 
 * */

import { Injectable } from '@angular/core';
import { SQLiteDBConnection } from '@capacitor-community/sqlite'

@Injectable({
  providedIn: 'root'
})
export class OperationsSQLiteService {
  public db!: SQLiteDBConnection;
  public messages:string[]=[];

  constructor(){ 
  }
  async setDb(sqLiteDBConnection:SQLiteDBConnection){
    this.db=sqLiteDBConnection;
    return await this.db.open();
  }

  async createTables(){
    const q = 'create table if not exists users (id integer primary key autoincrement, name text not null, active integer default 1);'
    return await this.db.query(q);
  }

  async dropTables(){
    const q = 'drop table users;'
    return await this.db.query(q);
  }

  async addUser(username: string){
    const q='insert into users (name) values (?)';
    return await this.db.run(q,[username],true,'all')
  }

  async selectUser(username: string){
    const q='select * from users where name = ?';
    return await this.db.query(q,[username]);
  }
}
