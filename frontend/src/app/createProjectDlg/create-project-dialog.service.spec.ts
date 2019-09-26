import { TestBed } from '@angular/core/testing';

import { CreateProjectDialogService } from './create-project-dialog.service';

describe('CreateProjectDialogService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CreateProjectDialogService = TestBed.get(CreateProjectDialogService);
    expect(service).toBeTruthy();
  });
});
