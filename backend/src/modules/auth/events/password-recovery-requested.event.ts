export class PasswordRecoveryRequestedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly temporaryPassword: string,
  ) {}
}
