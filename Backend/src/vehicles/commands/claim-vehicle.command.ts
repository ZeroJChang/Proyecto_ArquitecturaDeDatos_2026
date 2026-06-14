export class ClaimVehicleCommand {
  constructor(
    public readonly vin: string,
    public readonly userId: number,
  ) {}
}
