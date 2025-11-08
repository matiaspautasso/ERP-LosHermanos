export class UserLoggedInEvent {
  constructor(
    public readonly userId: bigint,
    public readonly email: string,
  ) {}
}
