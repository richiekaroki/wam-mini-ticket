import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { IsNotBlank } from '../../common/decorators';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @IsNotBlank()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsIn(['open', 'in_progress', 'closed'])
  status?: 'open' | 'in_progress' | 'closed';

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: 'low' | 'medium' | 'high';
}
