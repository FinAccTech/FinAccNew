import { Component } from "@angular/core";
import { CanDeactivateFn } from "@angular/router";

export const DeactivateGuard: CanDeactivateFn<unknown> = (Component,currentRoute, currentState, nextState) =>{
    return true;
}