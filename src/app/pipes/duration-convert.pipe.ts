import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationConvert',
  standalone: true
})
export class DurationConvertPipe implements PipeTransform {

  transform(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  }

}
