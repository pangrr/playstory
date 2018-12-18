import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { JsonComponent } from '../json/json.component';
import { MatIconRegistry } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';
import { ScriptService } from '../script.service';
import { Router } from '@angular/router';
import { Script, Script4Edit, buildScript4Edit, validateScript, buildScript, Event4Edit, sortEvents } from '../script';


@Component({
  selector: 'app-edit',
  templateUrl: 'edit.component.html',
  styleUrls: ['edit.component.css']
})
export class EditComponent implements OnInit {
  script: Script4Edit = {
    firstEvent: '0',
    events: [{ id: '0', description: '', actions: [], notes: [], nextEvent: '0' }]
  };

  constructor(
    public json: MatDialog,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    public snackBar: MatSnackBar,
    private service: ScriptService,
    private router: Router
  ) {
    iconRegistry.addSvgIcon('delete', sanitizer.bypassSecurityTrustResourceUrl('assets/delete.svg'));
  }

  ngOnInit() {
    if (this.service.getScript()) {
      this.script = buildScript4Edit(this.service.getScript());
    }
  }

  playScript(): void {
    if (validateScript(this.script)) {
      this.service.setScript(buildScript(this.script));
      this.router.navigate(['/play']);
    } else {
      this.openSnackBarForInvalidScript();
    }
  }

  openScriptJsonEditor(): void {
    if (validateScript(this.script)) {
      this.openJsonEditor(buildScript(this.script), (script: Script) => {
        if (script) {
          this.script = buildScript4Edit(script);
        }
      });
    } else {
      this.openSnackBarForInvalidScript();
    }
  }

  addEvent(): void {
    this.script.events.push({
      // data
      id: undefined,
      description: undefined,
      actions: [],
      nextEvent: undefined,
      notes: [],
      // helper
      open: true
    });
  }

  deleteEvent(eventIndex: number): void {
    this.script.events.splice(eventIndex, 1);
  }

  sortEvents(): void {
    if (validateScript(this.script)) {
      this.script.events = sortEvents(this.script.events, this.script.firstEvent);
    } else {
      this.openSnackBarForInvalidScript();
    }
  }

  addAction(event: Event4Edit): void {
    event.actions.push({
      // data
      description: undefined,
      triggerEvent: undefined,
      think: undefined
    });
  }

  addNote(event: Event4Edit): void {
    event.notes.push({
      title: undefined,
      content: undefined
    });
  }

  deleteAction(event: Event4Edit, actionIndex: number): void {
    event.actions.splice(actionIndex, 1);
  }

  deleteNote(event: Event4Edit, noteIndex: number): void {
    event.notes.splice(noteIndex, 1);
  }

  closeEvents(): void {
    this.script.events.forEach(event => event.open = false);
  }

  validateScript(): void {
    if (validateScript(this.script)) {
      this.openSnackBarForValidScript();
    } else {
      this.openSnackBarForInvalidScript();
    }
  }

  private openSnackBarForInvalidScript(): void {
    this.snackBar.open('Invalid Script', '', {
      duration: 1000,
      panelClass: 'red'
    });
  }

  private openSnackBarForValidScript(): void {
    this.snackBar.open('Valid Script', '', {
      duration: 1000,
      panelClass: 'green'
    });
  }

  private openJsonEditor(data: any, done?: (data: any) => any): void {
    const jsonRef = this.json.open(JsonComponent, {
      width: '900px',
      data
    });

    if (done) {
      jsonRef.afterClosed().subscribe(done);
    }
  }
}
