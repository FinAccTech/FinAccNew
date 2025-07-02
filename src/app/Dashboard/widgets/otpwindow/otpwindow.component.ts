import { Component, OnInit, QueryList, ViewChildren, ElementRef, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AutoUnsubscribe } from 'src/app/auto-unsubscribe.decorator';
import { GlobalsService } from 'src/app/Services/globals.service';

@AutoUnsubscribe
@Component({
  selector: 'app-otpwindow',  
  templateUrl: './otpwindow.component.html',
  styleUrl: './otpwindow.component.scss'
})

export class OtpwindowComponent {
otpForm!: FormGroup;

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  constructor(private fb: FormBuilder,
    public dialogRef: MatDialogRef<OtpwindowComponent>,
    private dialog: MatDialog,
    private globals: GlobalsService,
    @Inject(MAT_DIALOG_DATA) public data: string,    
  ) {}

  ngOnInit(): void {
    this.otpForm = this.fb.group({
      0: ['', [Validators.required, Validators.pattern('[0-9]')]],
      1: ['', [Validators.required, Validators.pattern('[0-9]')]],
      2: ['', [Validators.required, Validators.pattern('[0-9]')]],
      3: ['', [Validators.required, Validators.pattern('[0-9]')]]
    });
  }

  get otpControls() {
    return Object.keys(this.otpForm.controls);
  }

  onInput(event: any, index: number): void {
    const input = event.target.value;

    // Automatically move to next box if current has a digit
    if (input && index < this.otpInputs.length - 1) {
      this.otpInputs.get(index + 1)?.nativeElement.focus();
    }

    // Move back on Backspace
    if (!input && event.inputType === 'deleteContentBackward' && index > 0) {
      this.otpInputs.get(index - 1)?.nativeElement.focus();
    }
  }

  submitOTP(): void {
    const otp = Object.values(this.otpForm.value).join('');      
    console.log(otp);
    console.log(this.data);
    
    
    if (+otp !== +this.data){
      this.globals.SnackBar("error", "Invalid OTP");
      return;
    }
    this.dialogRef.close(+otp);    
  }}
