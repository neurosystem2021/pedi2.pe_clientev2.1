export class PedidoModel {
    IdProducto:number;
    Producto:string;
    Descripcion:string;
    Ranking:number;
    Cantidad:number;
    ProductoImagenUrl:string;
    Precio:number;
    Indicacion:string;
    IdEmpresa:number;
    IdAlmacen:number;
    RazonSocial:string;
    FacturaUrl:string;
    EmpresaImagenUrl:string;
    HorarioInicio:string;
    HorarioFin:string;
    Latitud:number;
    Longitud:number;
    TieneSistema:number;

    constructor(IdProducto:number,Producto:string, Descripcion:string, Ranking:number,Cantidad:number, 
        ProductoImagenUrl:string, Precio:number, Indicacion:string, IdEmpresa:number,IdAlmacen:number,
        RazonSocial:string, FacturaUrl:string,EmpresaImagenUrl:string, HorarioInicio:string, HorarioFin:string,Latitud:number,
        Longitud:number, TieneSistema:number) { 
        this.IdProducto =IdProducto;
        this.Producto =Producto;
        this.Descripcion =Descripcion;
        this.Ranking = Ranking;
        this.Cantidad =Cantidad;
        this.ProductoImagenUrl = ProductoImagenUrl;
        this.Precio = Precio;
        this.Indicacion = Indicacion;
        this.IdEmpresa = IdEmpresa;
        this.IdAlmacen = IdAlmacen;
        this.RazonSocial = RazonSocial;
        this.FacturaUrl  = FacturaUrl;
        this.EmpresaImagenUrl = EmpresaImagenUrl;
        this.HorarioInicio = HorarioInicio;
        this.HorarioFin = HorarioFin;
        this.Latitud = Latitud;
        this.Longitud = Longitud;
        this.TieneSistema = TieneSistema;
    }


}