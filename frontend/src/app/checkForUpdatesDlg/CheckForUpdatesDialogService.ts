import { Injectable } from '@angular/core';

import { DataService } from '../service/data.service';

@Injectable()
export class CheckForUpdatesDialogService {
  constructor(private dataService: DataService) {}

  display: boolean = false;
  isOnline: boolean = false;
  installedVersion: string = null;
  newestOfficialVersion: string = null;
  newestOfficialVersionUrl: string = null;
  displayHtml: string = null;

  init() {
    this.display = false;
    this.isOnline = false;
    this.installedVersion = null;
    this.newestOfficialVersion = null;
    this.newestOfficialVersionUrl = null;
    this.displayHtml = null;    
  }

  async showDialog() {
    await this.checkForUpdates();
    this.display = true;

    console.log("isOnline", this.isOnline);
    console.log("installedVersion", this.installedVersion);
    console.log("newestOfficialVersion", this.newestOfficialVersion);
    console.log("newestOfficialVersionUrl", this.newestOfficialVersionUrl);
    console.log("displayHtml", this.displayHtml);
  }

  async checkForUpdates() {
    this.init();
    // check if user is connected to internet
    this.isOnline = await this.checkInternetConnection();

    if(this.isOnline) {
      this.installedVersion = await this.dataService.getStoxVersion().toPromise();

      // get last line from a file on url
      const lastLine: string =  await this.readLastLineFromURL("https://raw.githubusercontent.com/StoXProject/StoX/master/Official_StoX_versions.md");
      // console.log("lastLine", lastLine);
      if(lastLine) {
        const delimiter: string = "|";
        const resultArray: string[] = lastLine.split(delimiter);
        const filteredArray: string[] = resultArray.filter(Boolean);
        this.newestOfficialVersion = filteredArray[0].trim();
        const lastElement = filteredArray[filteredArray.length-1].trim();
        const startIndex: number = lastElement.indexOf("(");
        const endIndex: number = lastElement.indexOf(")"); 
        this.newestOfficialVersionUrl = lastElement.substring(startIndex + 1, endIndex);        

        if(this.installedVersion === this.newestOfficialVersion) {
          this.displayHtml = "<p>The installed StoX version " +  this.installedVersion + " is the latest official StoX version</p>";
        } else if(this.installedVersion > this.newestOfficialVersion) {
          this.displayHtml = "<p>The installed StoX version " +  this.installedVersion + " is a pre-release version</p>";
        } else {
          this.displayHtml = "<p>There is a newer official StoX version available. Go to <a href=\"" + this.newestOfficialVersionUrl + "\">" + this.newestOfficialVersionUrl + "</a> to download and install</p>";
        }
      }
    } else {
      this.displayHtml = "<p>You are not connected to internet.</p>";
    }    
  }

  newVersionAvailable(): boolean {
    if(this.installedVersion != null && this.newestOfficialVersion != null && this.newestOfficialVersion > this.installedVersion) { 
      return true;
    }

    return false;
  } 

  async checkInternetConnection(): Promise<boolean> {
    try {
      await fetch('https://www.google.com', { mode: 'no-cors' });

      return true;
    } catch {
      return false;
    }
  }

  async readLastLineFromURL(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch file from ${url}. Status: ${response.status}`);
        }

        const text = await response.text();
        const lines = text.split('\n');
        // console.log("lines", lines);
        // Check if there is at least one line in the file
        if (lines.length > 0) {
            // Extract the last non-empty line
            const lastLine = lines[lines.length - 2].trim();

            return lastLine !== '' ? lastLine : null;
        } else {
            return null; // Empty file
        }
    } catch (error) {
        console.error(`Error reading file from ${url}: ${error.message}`);
        throw error;
    }
  }
}
