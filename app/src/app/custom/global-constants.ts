export class CONST {

  public static readonly DMS_SERVER_URL:       string = "https://mrdms01.mrbau.at";

  public static readonly FOER_FOERDERUNGSORDNER:string = "foer:Foerderungsordner";

  public static readonly FOER_FOERDERSCHIENE:   string = "foer:Foerderschiene";
  public static readonly FOER_FOERDERSTATUS:    string = "foer:Foerderstatus";
  public static readonly FOER_FOERDERSUMME:     string = "foer:Foerdersumme";
  public static readonly FOER_FOERDERUNGSWERBER:string = "foer:Foerderungswerber";
  public static readonly FOER_PROJECTNR:        string = "foer:ProjektNr";
  public static readonly FOER_ZUSTAENDIG:       string = "foer:Zustaendig";

  public static readonly CM_DESC:               string = "cm:description";

  public static readonly FOER_OFFEN: string = "Offen";
  public static readonly FOER_BEANTRAGT: string = "Beantragt";
  public static readonly FOER_POSITIV: string = "Positiv Entschieden";
  public static readonly FOER_ABGERECHNET: string = "Abgerechnet";
  public static readonly FOER_AUSBEZAHLT: string = "Ausbezahlt - Aufrechter Vertrag";
  public static readonly FOER_BEENDET: string = "Beendet - Vertrag Abgelaufen";
  public static readonly FOER_FOERDERSTATUS_VALUES = [
	  CONST.FOER_OFFEN,
	  CONST.FOER_BEANTRAGT,
	  CONST.FOER_POSITIV,
	  CONST.FOER_ABGERECHNET,
	  CONST.FOER_AUSBEZAHLT,
	  CONST.FOER_BEENDET
  ];

  public static getStatusProgress(val:string) : number {
    console.log(val);
    switch (val)
    {
      case CONST.FOER_OFFEN:
        return 0.01;
      case CONST.FOER_BEANTRAGT:
        return 0.25;
      case CONST.FOER_POSITIV:
        return 0.5;
      case CONST.FOER_ABGERECHNET:
        return 0.75;
      case CONST.FOER_AUSBEZAHLT:
        return 1.0;
      case CONST.FOER_BEENDET:
        return 1.0;
      default:
        return 0;
    }
  }

  public static readonly FOER_HOLDING: string = "Bauholding";
  public static readonly FOER_MOBIL: string = "Mobilbau";
  public static readonly FOER_GLOBAL: string = "Globalbau";
  public static readonly FOER_HT: string = "HT Bau";
  public static readonly FOER_MRGU: string = "M&R GU";
  public static readonly FOER_GUBAU: string = "GU Bau";
  public static readonly FOER_IMMO: string = "Immo";
  public static readonly FOER_OG: string = "Moser-Rauter OG";
  public static readonly FOER_SCHWAB: string = "Schwab";
  public static readonly FOER_FOERDERUNGSWERBER_VALUES = [
    CONST.FOER_HOLDING,
    CONST.FOER_MOBIL,
    CONST.FOER_GLOBAL,
    CONST.FOER_HT,
    CONST.FOER_MRGU,
    CONST.FOER_GUBAU,
    CONST.FOER_IMMO,
    CONST.FOER_OG,
    CONST.FOER_SCHWAB
  ];

  public static readonly FOER_AWS_COVID_INVEST: string = "AWS COVID Investitionsprämie";
  public static readonly FOER_OEMAG_PV_INV_ZUSCHUSS: string = "OEMAG PV Investitionszuschuss";
  public static readonly FOER_OEKOFIT_KAERNTEN: string = "ÖKO Fit Kärnten";
  public static readonly FOER_COFAG_AUSFALLBONUS_III: string = "COFAG Ausfallbonus III";
  public static readonly FOER_FOERDERSCHIENE_VALUES = [
    CONST.FOER_AWS_COVID_INVEST,
    CONST.FOER_OEMAG_PV_INV_ZUSCHUSS,
    CONST.FOER_OEKOFIT_KAERNTEN,
    CONST.FOER_COFAG_AUSFALLBONUS_III,
  ];
}
