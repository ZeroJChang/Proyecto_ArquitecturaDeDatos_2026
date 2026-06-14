import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('gps_events')
export class GpsEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'id_vehiculo', length: 50 })
  idVehiculo: string;

  @Column({ length: 50 })
  vin: string;

  @Column({ name: 'event_timestamp', type: 'timestamp' })
  eventTimestamp: Date;

  @Column({ name: 'tipo_trama', length: 20 })
  tipoTrama: string;

  @Column({ name: 'zona_referencia', length: 100 })
  zonaReferencia: string;

  @Column({ length: 100 })
  departamento: string;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ name: 'processed_at', type: 'timestamp' })
  processedAt: Date;
}
