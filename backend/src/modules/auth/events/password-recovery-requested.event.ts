export class PasswordRecoveryRequestedEvent {
  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly temporaryPassword: string,
  ) {}
}
