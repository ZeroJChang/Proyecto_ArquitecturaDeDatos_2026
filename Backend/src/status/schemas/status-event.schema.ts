import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ collection: 'status_events', timestamps: false })
export class StatusEvent extends Document {
  @Prop({ required: true })
  id_vehiculo: string;

  @Prop({ required: true })
  vin: string;

  @Prop({ required: true, type: Date })
  event_timestamp: Date;

  @Prop()
  tipo_trama: string;

  @Prop()
  zona_referencia: string;

  @Prop()
  departamento: string;

  @Prop({ required: true })
  bateria: number;

  @Prop({ required: true })
  encendido: boolean;

  @Prop({ default: '' })
  codigo_problema: string;

  @Prop({ required: true })
  kilometraje: number;

  @Prop({ type: Date })
  processed_at: Date;
}

export const StatusEventSchema = SchemaFactory.createForClass(StatusEvent);
