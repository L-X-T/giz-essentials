import { Component, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';

import { Flight } from '../entities/flight';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent {
  from = '';
  to = '';
  flights: Flight[] = [];
  selectedFlight: Flight | null = null;

  message = '';

  private http = inject(HttpClient);

  private url = 'http://www.angular.at/api/flight';
  private headers = new HttpHeaders().set('Accept', 'application/json');

  onSearch(): void {
    const params = new HttpParams().set('from', this.from).set('to', this.to);

    this.http.get<Flight[]>(this.url, { headers: this.headers, params }).subscribe({
      next: (flights: Flight[]) => {
        console.log('Flights loaded: ', flights);
        this.flights = flights;
      },
      error: (errResp: HttpErrorResponse) => {
        console.error('Error loading flights', errResp);
      },
      complete: () => {
        console.debug('Flights loading completed.');
      }
    });
  }

  onSelect(f: Flight): void {
    this.selectedFlight = f;
  }

  onSave(): void {
    this.http.post<Flight>(this.url, this.selectedFlight, { headers: this.headers }).subscribe({
      next: (flight) => {
        console.log('Flight saved: ', flight);
        this.selectedFlight = flight;
        this.message = 'Success!';
      },
      error: (errResponse: HttpErrorResponse) => {
        console.error('Error saving flight', errResponse);
        this.message = 'Error: ' + errResponse.message;
      }
    });
  }
}
