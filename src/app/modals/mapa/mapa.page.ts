import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
declare let L: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
})
export class MapaPage implements OnInit {
  public mymap2: any;
  banderaIcon: any;
  casaIcon: any;
  motoIcon: any;
  public clientelayer: any;
  public empresaLayer: any;
  public loaderToShow: any;
  @Input() public lat:any;
  @Input() public lon:any;
  @Input() public razonSocial:any;
  @Input() public direccion:any;
  @Input() public distrito:any;
  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    setTimeout(async () => {
      this.mymap2 = new L.map("mapid", {
        scrollWheelZoom: false,
        attributionControl: false,
        zoomControl: false
      }).setView(new L.LatLng(Number(this.lat), Number(this.lon)), 13);
      new L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token="+environment.tokenMapa,
        {
          maxZoom: 19,
          id: "mapbox/streets-v11",
          accessToken:
            "pk.eyJ1IjoicmVuem85MjIxIiwiYSI6ImNraDRhZ2NxbzA5eHEycW92d2Y1cGhldWUifQ.1zWCqGLtZfq_VSSWJx23Pg",
        }
      ).addTo(this.mymap2);
      this.clientelayer = L.layerGroup().addTo(this.mymap2);
      this.empresaLayer = L.layerGroup().addTo(this.mymap2);
      this.banderaIcon = new L.Icon({
        iconUrl: "../assets/img/bandera2.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.casaIcon = new L.Icon({
        iconUrl: "../assets/img/casa.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.motoIcon = new L.Icon({
        iconUrl: "../assets/img/moto.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
        this.cargarUbicacionEmpresa(this.lat,this.lon);
      },200);
    }

    cargarUbicacionEmpresa(lat: string, lon: string) {
      if (this.empresaLayer !== undefined) {
        this.empresaLayer.clearLayers();
  
        L.marker([Number(lat), Number(lon)], { icon: this.casaIcon })
          .addTo(this.empresaLayer)
          .bindPopup("<b>"+this.razonSocial+"</b>").openPopup();
      }
    }

    async closeModal() {
      await this.modalController.dismiss();
    }
  }


