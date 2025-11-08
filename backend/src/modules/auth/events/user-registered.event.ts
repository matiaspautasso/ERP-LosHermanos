export class UserRegisteredEvent {
  constructor(
    public readonly userId: bigint,
    public readonly email: string,
    public readonly username: string,
  ) {}
}
