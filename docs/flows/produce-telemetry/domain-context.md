# Produce Telemetry — Domain Context

This flow generates the telemetry described by [Domain → Telemetry Ingestion](../../knowledge/domain.md#telemetry-ingestion). The canonical registry owns the concepts, invariants, and [fault code semantics](../../knowledge/domain.md#fault-code-semantics); this file documents only the simulation mechanics that shape the demo data. **Everything here is simulator-only and is replaced by real vehicle behavior in production** — it does not constrain real devices.

## Canonical rules applied

- **VIN format** (canonical invariant): the simulator applies the `ACME` prefix plus a zero-padded index to produce the fixed 17-character VIN, e.g. `ACME0000000000001`.
- **Tipo de trama** (canonical invariant): GPS frames carry `tipo_trama = "GPS"` and status frames `"ESTADO"`.
- **Fault code semantics:** the meaning of `000`, `101`, and other codes is canonical; the *probabilistic generation* below is local simulation only.

## Local simulation behavior

### Vehicle and zone model

- **Vehicle:** an in-memory object with a VIN, an assigned zone, a position, battery level, ignition state, fault code, odometer, and last bearing.
- **Zone:** one of five Guatemala areas with a center coordinate and a radius; vehicles stay within their zone.
- **Fleet size:** `TOTAL_VEHICLES` vehicles (default 20), distributed round-robin across the 5 zones.

### Movement and state generation (per tick)

- **Movement:** only when ignition is on. Each tick moves up to `0.2 km` with a bearing that drifts ±35°; if the next point would leave the zone radius, the vehicle steers back toward the zone center.
- **Battery:** decreases 0.01–0.07% per tick while on; while off, may recharge 0.1–0.5% with 3% probability per tick. Bounded to [0, 100].
- **Ignition:** 2% probability of toggling on/off each tick.
- **Odometer:** increases by the step distance travelled.

### Fault code generation (simulator only)

- `000` — emitted in the common case, and always when ignition is off.
- `101` — emitted with 35% probability when battery ≤ 15% and ignition is on.
- `001`–`999` (random, excluding the above) — a generic fault with 3% probability per tick when on.

### Edge cases

- A vehicle that is off does not move and reports `000` regardless of battery.
- Battery is clamped so it never goes negative or above 100.
- Geographic clamping guarantees a vehicle never drifts outside its zone, even with a random bearing.

### Guatemala zones

| Zone | Department | Center (lat, lng) | Radius |
|------|-----------|-------------------|--------|
| Ciudad de Guatemala | Guatemala | 14.6349, -90.5069 | 7 km |
| Villa Nueva | Guatemala | 14.5251, -90.5875 | 6 km |
| Mixco | Guatemala | 14.6333, -90.6064 | 6 km |
| Antigua Guatemala | Sacatepéquez | 14.5586, -90.7295 | 5 km |
| Escuintla | Escuintla | 14.3009, -90.7850 | 7 km |

---

[Previous: Components](components.md) · [Flow Index](index.md) · [Next: Contract Usage](contract-usage.md)
