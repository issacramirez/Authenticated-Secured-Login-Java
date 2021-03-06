import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';
// import { CLIENTES } from './clientes.json';
import { Cliente } from './cliente';
import { of, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private urlEndPoint: string = 'http://localhost:8080/api/clientes';
  private httpHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient, private router: Router) { }

  private isNotAuthorized(e): boolean {
    if(e.status == 401 || e.status == 403) {
      this.router.navigate(['/login'])
      return true;
    }
    return false;
  }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        // console.log('Cliente Service: tap 1');
        (response.content as Cliente[]).forEach(cliente => {
          // console.log(cliente.nombre);
        })
      }),
      map((response: any) => {
        (response.content as Cliente[]).map(cliente => {
          cliente.createAt = formatDate(cliente.createAt, 'EEEE dd, MMMM yyyy hh:mm:ss a', 'es');
          return cliente;
        });
        return response;
      })
    );
  }

  getCliente(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(e);
        }
        this.router.navigate(['/clientes']);
        console.error("Error :( -> " + e.error.error);
        Swal.fire('Error al editar', e.error.mensaje, 'error');
        return throwError(e);
      })
    );
  }

  createCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post(this.urlEndPoint, cliente, { headers: this.httpHeaders }).pipe(
      map((response: any) => response.cliente as Cliente), // esto es para dejar que regrese un Cliente y no se use any
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(e);
        }
        if (e.status == 400) {
          return throwError(e);
        }

        console.error(e.error.error1);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  update(cliente: Cliente): Observable<any> {
    return this.http.put<any>(`${this.urlEndPoint}/${cliente.id}`, cliente, { headers: this.httpHeaders }).pipe(
      catchError(e => {

        if(this.isNotAuthorized(e)){
          return throwError(e);
        }

        if (e.status == 400) {
          return throwError(e);
        }

        console.error(e.error.error1);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  delete(id: number): Observable<Cliente> {
    return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`, { headers: this.httpHeaders }).pipe(
      catchError(e => {
        if(this.isNotAuthorized(e)){
          return throwError(e);
        }
        console.error(e.error.error1);
        Swal.fire(e.error.mensaje, e.error.error, 'error');
        return throwError(e);
      })
    );
  }

  subirFoto(archivo: File, id: any): Observable<HttpEvent<{}>> {
    let formData = new FormData();
    formData.append("archivo", archivo);
    formData.append("id", id);

    const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request(req).pipe(
      catchError(e => {
        this.isNotAuthorized(e);
        return throwError(e);
      })
    );
  }

}
