import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';

import { ProjectService } from '../service/project.service';
@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent {
  filteredCountry: Observable<any[]>;
  @ViewChild(MatAutocompleteTrigger, { static: true }) autocomplete: MatAutocompleteTrigger;

  @ViewChild('txtVal', { static: true }) myInput: ElementRef;
  m_items: string[];
  m_selectedItem: string;

  @Input()
  set items(items: string[]) {
    if (!Array.isArray(items)) {
      console.error('autocomplete is not an array, nor string');
      items = [];
    }

    this.m_items = items;
  }

  get items(): string[] {
    return this.m_items;
  }

  @Input()
  set selectedItem(value: string) {
    this.m_selectedItem = value;
  }

  get selectedItem(): string {
    return this.m_selectedItem;
  }
  @Output() complete = new EventEmitter();

  constructor(public ps: ProjectService) {}

  filterItems(name: string, _arr: any[]) {
    return this.items != null ? this.items.filter(item => item.toLowerCase().indexOf(name.toLowerCase()) === 0) : [];
  }
  updateSelectedItem(val: string) {
    //if (this.selectedItem != val) {
    this.selectedItem = val;
    console.log('> ' + 'Emmitting complete event ' + this.selectedItem + ' on autocomplete');
    this.complete.emit({ selectedItem: this.selectedItem });
    //}
  }
  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.updateSelectedItem(event.option.value);
  }
  onEnter() {
    // Allow blank values to be accepted
    if (this.selectedItem === '') {
      this.updateSelectedItem(this.selectedItem);
    }
  }
  /*onKeydown(event: KeyboardEvent) {
    console.log("> " + event);
    if (event.key === "Enter") {
      let val = (event.target as HTMLInputElement).value;
      if (val == "") {
        this.updateSelectedItem(null);
        this.autocomplete.closePanel();
      }
    }
  }*/
}
