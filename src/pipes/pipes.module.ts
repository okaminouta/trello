import { NgModule } from '@angular/core';
import { KeysPipe } from './keys/keys';
import { MinuteSecondsPipe } from './minute-seconds/minute-seconds';
import { OrderByPipe } from './order-by/order-by';
@NgModule({
	declarations: [KeysPipe,
    MinuteSecondsPipe,
    OrderByPipe],
	imports: [],
	exports: [KeysPipe,
    MinuteSecondsPipe,
    OrderByPipe]
})
export class PipesModule {}
