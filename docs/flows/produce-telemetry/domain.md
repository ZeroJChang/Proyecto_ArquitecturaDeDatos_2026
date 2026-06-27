# Produce Telemetry — Domain

The simulation rules that shape the generated telemetry. These exist to make the demo data behave plausibly; in production they are replaced by real vehicle behavior.

## Concepts

- **Vehicle:** an in-memory object with a VIN, an assigned zone, a position, battery level, ignition state, fault code, odometer, and last bearing.
- **Zone:** one of five Guatemala areas with a center coordinate and a radius; vehicles stay within their zone.

## Business rules and invariants

- **Fleet size:** `TOTAL_VEHICLES` vehicles (default 20), distributed round-robin across the 5 zones.
- **VIN format:** `ACME` prefix + zero-padded index, total length 17 (e.g. `ACME0000000000001`).
- **Movement:** only when ignition is on. Each tick moves up to `0.2 km` with a bearing that drifts ±35°; if the next point would leave the zone radius, the vehicle steers back toward the zone center.
- **Battery:** decreases 0.01–0.07% per tick while on; while off, may recharge 0.1–0.5% with 3% probability per tick. Bounded to [0, 100].
- **Ignition:** 2% probability of toggling on/off each tick.
- **Odometer:** increases by the step distance travelled.

## Fault code rules

- `000` — no fault (the common case).
- `101` — low battery: emitted with 35% probability when battery ≤ 15% and ignition is on.
- `001`–`999` (random, excluding the above) — generic fault with 3% probability per tick when on.
- When ignition is off, the fault code is always `000`.

## Edge cases

- A vehicle that is off does not move and reports `000` regardless of battery.
- Battery is clamped so it never goes negative or above 100.
- Geographic clamping guarantees a vehicle never drifts outside its zone, even with random bearing.

## Zones

| Zone | Department | Center (lat, lng) | Radius |
|------|-----------|-------------------|--------|
| Ciudad de Guatemala | Guatemala | 14.6349, -90.5069 | 7 km |
| Villa Nueva | Guatemala | 14.5251, -90.5875 | 6 km |
| Mixco | Guatemala | 14.6333, -90.6064 | 6 km |
| Antigua Guatemala | Sacatepéquez | 14.5586, -90.7295 | 5 km |
| Escuintla | Escuintla | 14.3009, -90.7850 | 7 km |
