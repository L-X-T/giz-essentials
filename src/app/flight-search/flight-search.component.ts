import { Component, DestroyRef, inject, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Flight } from '../entities/flight';
import { FlightService } from './flight.service';
import { Observable, Observer, pipe, Subject, Subscription } from 'rxjs';
import { share, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.css']
})
export class FlightSearchComponent implements OnDestroy {
  from = 'Graz';
  to = 'Hamburg';

  flights: Flight[] = [];
  flights$?: Observable<Flight[]>;
  flightsSubscription?: Subscription;
  // private readonly onDestroySubject = new Subject<void>();
  // readonly terminator$ = this.onDestroySubject.asObservable();

  selectedFlight: Flight | null = null;

  message = '';

  private readonly destroyRef = inject(DestroyRef);
  private readonly flightService = inject(FlightService);

  onSearch(): void {
    // 1. my observable
    this.flights$ = this.flightService.find(this.from, this.to).pipe(share());

    // 2. my observer
    const flightsObserver: Observer<Flight[]> = {
      next: (flights) => (this.flights = flights),
      error: (errResp: HttpErrorResponse) => console.error('Error loading flights', errResp),
      complete: () => console.debug('Flights loading completed.')
    };

    // 3a. my subscription
    this.flightsSubscription?.unsubscribe();
    this.flightsSubscription = this.flights$.subscribe(flightsObserver);

    // 3b. takeUntil terminator$ emits
    // this.flights$.pipe(takeUntil(this.terminator$)).subscribe(flightsObserver);

    // 3c. takeUntilDestroyed
    this.flights$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(flightsObserver);
  }

  ngOnDestroy(): void {
    // 4a. my unsubscribe
    this.flightsSubscription?.unsubscribe();

    // 4b. subject emit thru terminator$
    // this.onDestroySubject.next(void 0);
    // this.onDestroySubject.complete();
  }

  onSelect(f: Flight): void {
    this.selectedFlight = f;
  }

  onSave(): void {
    if (this.selectedFlight) {
      this.flightService
        .save(this.selectedFlight)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
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
}
