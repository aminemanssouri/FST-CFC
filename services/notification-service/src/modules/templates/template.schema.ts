import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TemplateDocument = HydratedDocument<Template>;

@Schema({ timestamps: true, collection: 'templates' })
export class Template {
  @Prop({ required: true, index: true })
  key!: string;

  @Prop({ required: true })
  channel!: 'email';

  @Prop({ required: true })
  language!: string;

  @Prop({ required: true })
  subjectTemplate!: string;

  @Prop({ required: true })
  bodyTemplate!: string;
}

export const TemplateSchema = SchemaFactory.createForClass(Template);
TemplateSchema.index({ key: 1, channel: 1, language: 1 }, { unique: true });
