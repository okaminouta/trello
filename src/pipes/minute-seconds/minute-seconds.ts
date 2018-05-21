import {Pipe, PipeTransform} from '@angular/core';

/**
 * Generated class for the MinuteSecondsPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'minuteSeconds',
})
export class MinuteSecondsPipe implements PipeTransform {
  transform(value: number): string {
    let hours: number;
    let days: number;
    let minutes: number;

    minutes = (value>=60 ?  Math.floor(value / 60) : 0);
    hours = (minutes >= 60 ? Math.floor(minutes / 60):0);
    days = (hours >= 24 ? Math.floor(hours / 24):0);

    return (days > 0 ? days + ' days ' : '') +
      (days > 0 ? hours - days * 24 : hours) +
      ':' + ((minutes - hours * 60) < 10 ? '0' : '') +
        (minutes - hours * 60);
  }
}
