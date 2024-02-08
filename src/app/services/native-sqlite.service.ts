/**Este servicio, NativeSQLiteService, funciona en android o ios, 
 * y el servicio web, WebSQLiteService, no funciona en web 
 * 
 * Los datos se quedan en el móvil aunque se cierre la app.
 * Si la app se desinstala, se elimina la base de datos.
 * 
 * En web sinembargo, cada vez que se recarga la página se elimina 
 * la base de datos, y se crea una nueva.
 * */

import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from '@capacitor-community/sqlite';

import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class NativeSQLiteService {
  public databaseName: string='metatierrascol';
  public sqliteConnection: SQLiteConnection;
  public db!: SQLiteDBConnection;
  public  isConnection: boolean | undefined = false;
  public messages:string[]=[];//solo para hacer las primeras pruebas

  constructor(){ 
    this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDb(){
    //esto no vale para nada. Siempre da false
    const ret = (await this.sqliteConnection.checkConnectionsConsistency()).result;
    console.log('checkConnectionsConsistency 2', ret)
    this.messages.push('checkConnectionsConsistency')
    this.messages.push(String(ret))

    //esto no vale para nada. Siempre da false
    const isConn = (await this.sqliteConnection.isConnection("test_db",false)).result;
    console.log('isConnection', isConn)
    this.messages.push('isConnection')
    this.messages.push(String(isConn))

    //Si no existe la crea y la abre. Si existe la recupera y la abre, sin error
    console.log('Creando la conexion');
    this.messages.push('Creando la conexion')
    this.db = await this.sqliteConnection.createConnection(this.databaseName,false,'no-encryption',1,false);
    return this.db;
    // this.db = await this.sqliteConnection.retrieveConnection(this.databaseName,false)
    // console.log('retrieveConnection 888',this.db)
    // if (this.db != undefined) {
    //   console.log('La conexión no es nueva', this.db);
    //   return this.db;
    // }else{
    //   console.log('La conexión es nueva')

    // }

    //   .then( (dbConn: SQLiteDBConnection) => {
    //     console.log('He recuperado la conexión');    
    //     this.db =dbConn;
    //   })
    //   .catch( err => {
    //     console.log('Ha resultado error al recuperar la conexión', err);
    //   });
    // if (this.db != undefined) {
    //   return this.db;
    // }else{
    //   console.log('La conexión es nueva')
    //   this.db = await this.sqliteConnection.createConnection(this.databaseName,false,'no-encryption',1,false);
    //   return this.db;
    // }
  }
}
