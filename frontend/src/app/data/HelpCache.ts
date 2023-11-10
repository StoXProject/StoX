export class HelpCache {
  helpArray: string[] = [];
  currentIndex: number = -1;

  constructor() {
    this.helpArray = [];
    this.currentIndex = -1;
  }

  isEmpty(): boolean {
    return this.helpArray.length == 0;
  }

  hasNext(): boolean {
    return !this.isEmpty() && this.currentIndex + 1 <= this.helpArray.length - 1;
  }

  hasPrevious(): boolean {
    return !this.isEmpty() && this.currentIndex - 1 >= 0;
  }

  next() {
    if (this.hasNext()) {
      this.currentIndex = this.currentIndex + 1;
    }
  }

  previous() {
    if (this.hasPrevious()) {
      this.currentIndex = this.currentIndex - 1;
    }
  }

  current(): string {
    if (!this.isEmpty()) {
      return this.helpArray[this.currentIndex];
    }

    return null;
  }

  add(help: string) {
    if (help != null) {
      this.currentIndex = this.currentIndex + 1;
      this.helpArray.splice(this.currentIndex, this.helpArray.length - this.currentIndex, help);
    }
  }
}
