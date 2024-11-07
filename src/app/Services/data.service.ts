import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, } from '@angular/core';
import { catchError, map, retry, } from 'rxjs';
import { GlobalsService } from './globals.service';
import { ProgressbroadcastService } from './progressbroadcast.service';
import { AutoUnsubscribe } from '../auto-unsubscribe.decorator';

@Injectable({
  providedIn: 'root'
})

@AutoUnsubscribe
export class DataService {

  baseApiURLAuth:string = "https://finaccsaas.com/data/RestApi.php/auth";
  baseApiURL:string = "https://finaccsaas.com/data/RestApi.php/app";

  // baseApiURLAuth:string = "https://cloud.finacc.in/data/RestApi.php/auth";
  // baseApiURL:string = "https://cloud.finacc.in/data/RestApi.php/app";

  constructor( private http: HttpClient, private globals: GlobalsService, private progressService: ProgressbroadcastService) { 
  
  }
    
  HandleError(error: HttpErrorResponse):any{    
    // this.progressService.sendUpdate("stop",""),
    // console.log(error);  
    //window.alert("Network Error. Check your Internet Connection or Contact FinAcc for support")
  }

  

  HttpPost(PostData: any, ApiSuffix: string)
  {       
      //this.progressService.sendUpdate("start","Progress...");
      let DbName = sessionStorage.getItem("sessionClientDbName")!;
      let postdata: string =JSON.stringify(PostData); 
    
      let params = new HttpParams()
      .set('data', postdata)
      .set('DbName', DbName!)
        
      let apiURL: string = this.baseApiURL + ApiSuffix;
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      // let data = this.http.post<any>(apiURL, params) ;
      let data = this.http.get<any>(apiURL, { params })
      
        .pipe(map(datarecd => {                      
          //this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),
        // catchError(
        //   this.HandleError())
        // retry(2)
      );      
      return data;      
  }

  HttpGet(PostData: any, ApiSuffix: string)
  {    
    //this.progressService.sendUpdate("start","Loading...");
    let DbName = sessionStorage.getItem("sessionClientDbName")!;                                             
    let postdata: string =JSON.stringify(PostData); 
    let apiURL = "";
    let params = new HttpParams()

    .set('data', postdata)
    .set('DbName', DbName!)
    
    if (ApiSuffix.trim() == "/CheckUserandgetCompanies"){
      apiURL =  this.baseApiURLAuth + ApiSuffix;
    }
    else{
      apiURL = this.baseApiURL + ApiSuffix;
    }
    let header = new HttpHeaders();
    header.set("content-type", "charset=UTF-8");
    let data = this.http.get<any>(apiURL, { params })
        .pipe(
          // catchError(this.HandleError),
          map(datarecd => {                      
          //this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),        
        
        );
        
    return data;
  }

  HttpGetPrintStyle(printstyle: string){    
    //this.progressService.sendUpdate("start","Loading...");
    let data = this.http.get<any>("https://finaccsaas.com/FinAccPrintStyles/getPrintStyles.php?stylename="+ printstyle, { })
    .pipe(map(datarecd => {                      
      //this.progressService.sendUpdate("stop","");    
        return ( datarecd);                        
    }),
    );    
    return data;
  }

HttpSavePrintStyle(StyleName: string, JsonContent: string, savetype:string)
  {       
      //this.progressService.sendUpdate("start","Progress...");
      
      let postdata: string =JSON.stringify({"StyleName": StyleName, "JsonContent":JsonContent, "savetype":savetype }); 
    
      let params = new HttpParams()
      .set('data', postdata)
      
        
      let apiURL = "https://finaccsaas.com/FinAccPrintStyles/savePrintStyle.php";
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      // let data = this.http.post<any>(apiURL, params) ;
      let data = this.http.get<any>(apiURL, { params })
        .pipe(map(datarecd => {                      
        //  this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),
        );      
      return data;      
  }

  HttpgetFileList(StyleName: string, JsonContent: string)
  {       
      //this.progressService.sendUpdate("start","Progress...");
      
      let postdata: string =JSON.stringify({"StyleName": StyleName, "JsonContent":JsonContent }); 
    
      let params = new HttpParams()
      .set('data', postdata)
      
        
      let apiURL = "https://finaccsaas.com/FinAccPrintStyles/getFilesList.php";
    
      let header = new HttpHeaders();
      header.set('Access-Control-Allow-Origin', '*');      
      header.set("content-type", "text/html; charset=UTF-8");      
      // let data = this.http.post<any>(apiURL, params) ;
      let data = this.http.get<any>(apiURL, { params })
        .pipe(map(datarecd => {                      
        //  this.progressService.sendUpdate("stop","");    
            return ( datarecd);                        
        }),
        );      
      return data;      
  }

  
  QueAlertsinServer(){
    let postdata: string =JSON.stringify({"StyleName": "StyleName"}); 
    
    let params = new HttpParams()
    .set('data', postdata)
    
      
    let apiURL = "https://finaccsaas.com/data/QueAlertsinServer.php";
  
    let header = new HttpHeaders();
    header.set('Access-Control-Allow-Origin', '*');      
    header.set("content-type", "text/html; charset=UTF-8");      
    // let data = this.http.post<any>(apiURL, params) ;
    let data = this.http.get<any>(apiURL, { params })
      .pipe(map(datarecd => {                      
      //  this.progressService.sendUpdate("stop","");    
          return ( datarecd);                        
      }),
      );      
    return data;      
  }
}
