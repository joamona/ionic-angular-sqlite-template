import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

import { NativeSQLiteService } from './services/native-sqlite.service';

//para activar web
import { WebSQLiteService } from './services/web-sqlite.service';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { OperationsSQLiteService } from './services/operations-sqlite.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, CommonModule],
  providers: [NativeSQLiteService, WebSQLiteService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent implements OnInit{
   public isWeb: boolean = false;
   public initPlugin: boolean = false;
   public databaseName = 'metatierrascol';
   public sqliteDBConnection!: SQLiteDBConnection;//la conexión a la base de datos

  constructor(public nativeSQLiteService: NativeSQLiteService, 
              public webSQLiteService: WebSQLiteService, 
              public operationsSQLiteService: OperationsSQLiteService, 
              public platform: Platform) {

    /**
     * Si es nativo (android o ios, hay que usar la librería estándar).
     *    hay que usar native.sqlite.service.ts para obtener la conexión.
     *  
     * Si es web, hay que usar web.sqlite.service para obtener la conexión.
     */
    var native:boolean;
    var sistemaOperativo = Capacitor.getPlatform();
    if(sistemaOperativo === 'ios' || sistemaOperativo === 'android'){
      native = true;
    }else{
      native = false;
    }
    if (native){
      this.initializeNativeDb();//solo funciona en nativo no en web
    }else{
      this.initializeWebDb();
    }   
  }

  ngOnInit(): void {

  }

  //para native
  async initializeNativeDb(){
    this.sqliteDBConnection = await this.nativeSQLiteService.initializeDb();
    SplashScreen.hide()//truco para que se quede atascado un poco
    this.operationsSQLiteService.setDb(this.sqliteDBConnection)
    console.log('Conexión sqlite nativa creada')
    this.realizaConsultas();
  }

  //para web
  async initializeWebDb() {
    await this.platform.ready();
    this.initPlugin = await this.webSQLiteService.initializePlugin();
    if(this.webSQLiteService.platform === "web") {
      this.isWeb = true;
    }

    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');
    if(jeepSqliteEl != null) {
      this.webSQLiteService.initWebStore();
      console.log(`>>>> isStoreOpen ${await jeepSqliteEl.isStoreOpen()}`);
      this.sqliteDBConnection = await this.webSQLiteService.createConnection(this.databaseName,false,'no-encryption',1);
      this.realizaConsultas();
    } else {
      console.log('jeepSqliteEl es null');
    }
  }

  async realizaConsultas(){
      await this.operationsSQLiteService.setDb(this.sqliteDBConnection)
      .then( 
        r =>{console.log('Conexión creada',r);
        this.operationsSQLiteService.messages.push('Conexión creada')
    })
      .catch( err => {console.log(err.message)});

    await this.operationsSQLiteService.createTables()        
      .then( 
        r =>{console.log('Tablas creadas',r)
        this.operationsSQLiteService.messages.push('Tablas creadas');
      })
      .catch( err => {console.log(err.message)});
    
    await this.operationsSQLiteService.addUser('joamona')
      .then( 
        r =>{console.log('Usuario añadido',r);
        this.operationsSQLiteService.messages.push('Usuario añadido')
    })
      .catch( err => {console.log(err.message)});

    await this.operationsSQLiteService.selectUser('joamona')
      .then( (r: any) => {
          if (r.values.length > 0){
            console.log('Usuarios seleccionado',r.values);
            this.operationsSQLiteService.messages.push('Usuarios seleccionados');
            r.values.forEach( ( row: any ) =>{
              console.log(row)
              this.operationsSQLiteService.messages.push(row.name);
            });
          }else{
            console.log('No hay usuarios')
          }            
        }
      )
      .catch( err => {console.log(err.message)});
  }
}

//'INSERT INTO users (name,country,age) VALUES (?,?,?)',['Ricardo','Portugal','24']


// SELECT * FROM Userdata WHERE (LATITUDE >= ? AND LATITUDE <= ?) 
// AND (LONGITUDE >= ? AND LONGITUDE <= ?)
// AND acos(sin(?) * sin(LATITUDE) + cos(?) * cos(LATITUDE) * 
// cos(LONGITUDE-(-?))) <=?
