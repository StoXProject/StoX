import { Injectable } from '@angular/core';
import { DataService } from '../../service/data.service';
import { ProjectService } from '../../service/project.service';
import { UserLogEntry } from '../../data/userlogentry';
import { UserLogType } from '../../enum/enums';

@Injectable({
    providedIn: 'root'
})
export class InstallRPackagesDlgService {

    constructor(private dataService: DataService, private ps: ProjectService) {
    }

    display: boolean = false;
    isInstalling: boolean = false;
    rpath: string;

    async showDialog() {

        this.display = true;
    }

    async apply() {
        let project: string = this.ps.selectedProject?.projectPath;
        try {
            await this.ps.activateProject(null, true);
            this.isInstalling = true;
            let res = await this.dataService.installRstoxFramework().toPromise();
            this.dataService.log.push(new UserLogEntry(UserLogType.MESSAGE, res));
            await this.ps.checkRstoxFrameworkAvailability();
            this.isInstalling = false;
            this.display = false;
        } finally {
            if (project != null) {
                await this.ps.openProject(project, true, true, false);
            }
        }
    }

}
