import {MatPaginatorIntl} from '@angular/material/paginator';

export function cocinaPaginator():MatPaginatorIntl {
  const intl=new MatPaginatorIntl();
  intl.itemsPerPageLabel='Pedidos por página:';
  intl.nextPageLabel='Siguiente página';intl.previousPageLabel='Página anterior';
  intl.firstPageLabel='Primera página';intl.lastPageLabel='Última página';
  intl.getRangeLabel=(page,size,total)=>total===0?'0 de 0':
    (page*size+1)+' – '+Math.min((page+1)*size,total)+' de '+total;
  return intl;
}
