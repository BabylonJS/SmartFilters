import { Observable } from "@babylonjs/core/Misc/observable";

export interface IEffect {
  readonly isStarted: boolean;
  start(): void;
  stop(notifyEffectCompleted: boolean): void;

  readonly onEffectCompleted: Observable<void>;
}
