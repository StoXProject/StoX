import {
  Component,
  ElementRef,
  OnInit,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import { ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import {
  MatAutocompleteTrigger,
  MatAutocompleteSelectedEvent
} from "@angular/material";
import { FormControl } from "@angular/forms";
@Component({
  selector: "app-autocomplete",
  templateUrl: "./autocomplete.component.html",
  styleUrls: ["./autocomplete.component.scss"]
})
export class AutocompleteComponent {
  //formCtrl: FormControl;
  filteredCountry: Observable<any[]>;
  @ViewChild(MatAutocompleteTrigger, { static: true }) autocomplete: MatAutocompleteTrigger;

  @ViewChild("txtVal", { static: true }) myInput: ElementRef;
  m_items: string[]; /* = [
    "Afghanistan","Åland Islands","Albania"];*/
  m_selectedItem: string;

  @Input()
  set items(items: string[]) {
    if (typeof items == "string") { // one element array given as string.
      console.warn("autocomplete is an one element string, not an array");
      items = [items];
    } else if (!Array.isArray(items)) {
      console.error("autocomplete is not an array, nor string");
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
  @Output() change = new EventEmitter();

  constructor() {
    //this.formCtrl = new FormControl();
  }

  filterItems(name: string, arr: any[]) {
    return this.items != null ? this.items.filter(
      item => item.toLowerCase().indexOf(name.toLowerCase()) === 0
    ) : [];
  }
  updateSelectedItem(val: string) {
    //if (this.selectedItem != val) {
    this.selectedItem = val;
    this.change.emit({ selectedItem: this.selectedItem });
    //}
  }
  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.updateSelectedItem(event.option.value);
  }
  onKeydown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      let val = (event.target as HTMLInputElement).value;
      if (val == "") {
        this.updateSelectedItem(null);
        this.autocomplete.closePanel();
      }
    }
  }
}
