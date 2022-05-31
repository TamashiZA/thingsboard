///
/// Copyright © 2016-2022 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Component, Input, OnInit } from '@angular/core';
import { PageComponent } from '@shared/components/page.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  createDefaultEntityTypesVersionLoad,
  EntityTypeVersionLoadRequest,
  VersionLoadRequestType,
  VersionLoadResult
} from '@shared/models/vc.models';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { EntitiesVersionControlService } from '@core/http/entities-version-control.service';
import { TranslateService } from '@ngx-translate/core';
import { entityTypeTranslations } from '@shared/models/entity-type.models';

@Component({
  selector: 'tb-complex-version-load',
  templateUrl: './complex-version-load.component.html',
  styleUrls: ['./complex-version-load.component.scss']
})
export class ComplexVersionLoadComponent extends PageComponent implements OnInit {

  @Input()
  branch: string;

  @Input()
  versionName: string;

  @Input()
  versionId: string;

  @Input()
  onClose: (result: Array<VersionLoadResult> | null) => void;

  @Input()
  onContentUpdated: () => void;

  loadVersionFormGroup: FormGroup;

  versionLoadResults: Array<VersionLoadResult> = null;

  constructor(protected store: Store<AppState>,
              private entitiesVersionControlService: EntitiesVersionControlService,
              private translate: TranslateService,
              private fb: FormBuilder) {
    super(store);
  }

  ngOnInit(): void {
    this.loadVersionFormGroup = this.fb.group({
      entityTypes: [createDefaultEntityTypesVersionLoad(), []],
    });
  }

  versionLoadResultMessage(result: VersionLoadResult): string {
    const entityType = result.entityType;
    let message = this.translate.instant(entityTypeTranslations.get(entityType).typePlural) + ': ';
    const resultMessages: string[] = [];
    if (result.created) {
      resultMessages.push(this.translate.instant('version-control.created', {created: result.created}));
    }
    if (result.updated) {
      resultMessages.push(this.translate.instant('version-control.updated', {updated: result.updated}));
    }
    if (result.deleted) {
      resultMessages.push(this.translate.instant('version-control.deleted', {deleted: result.deleted}));
    }
    message += resultMessages.join(', ') + '.';
    return message;
  }

  cancel(): void {
    if (this.onClose) {
      this.onClose(this.versionLoadResults);
    }
  }

  restore(): void {
    const request: EntityTypeVersionLoadRequest = {
      branch: this.branch,
      versionId: this.versionId,
      entityTypes: this.loadVersionFormGroup.get('entityTypes').value,
      type: VersionLoadRequestType.ENTITY_TYPE
    };
    this.entitiesVersionControlService.loadEntitiesVersion(request).subscribe((result) => {
      this.versionLoadResults = (result || []).filter(res => res.created || res.updated || res.deleted);
      if (this.onContentUpdated) {
        this.onContentUpdated();
      }
    });
  }
}
