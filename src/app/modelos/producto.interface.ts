export interface ProductoInterface {
    id: string;
    empresa_ruc: string;
    empresa_razon_social: string;
    nombre: string;
    descripcion: string;
    categoria_menu:string;
    url_imagen: string;
    precio_unitario: number
    ranking: number;
    horario_inicio:string;
    horario_fin:string;
    fecha_inicio:string;
    fecha_fin:string;

/*
    constructor(id: string, empresa_ruc: string, empresa_razon_social: string, nombre: string,
        descripcion: string, url_imagen: string, precio_unitario: number, ranking: number) {

        this.id=id;
        this.empresa_ruc=empresa_ruc;
        this.empresa_razon_social=empresa_razon_social;
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.url_imagen=url_imagen;
        this.precio_unitario=precio_unitario;
        this.ranking=ranking;

    }
*/

}





