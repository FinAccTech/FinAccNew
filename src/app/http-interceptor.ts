import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpResponse } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { HttpHandler } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ProgressbroadcastService } from './Services/progressbroadcast.service';

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

     constructor(private progressService: ProgressbroadcastService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.progressService.sendUpdate("start","In Progress")

        return next.handle(req)
             .pipe(tap((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        this.progressService.sendUpdate("stop","In Progress");
                    }
                }, (error) => {
                    this.progressService.sendUpdate("stop","In Progress");
                    window.alert(error.message);
                }));
    }
}