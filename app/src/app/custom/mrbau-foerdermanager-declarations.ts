export class FOER_CONST {

  public static readonly FOER_FOERDERUNGSORDNER:string = "foer:Foerderungsordner";

  public static readonly FOER_FOERDERSCHIENE:   string = "foer:Foerderschiene";
  public static readonly FOER_FOERDERSTATUS:    string = "foer:Foerderstatus";
  public static readonly FOER_FOERDERSUMME:     string = "foer:Foerdersumme";
  public static readonly FOER_FOERDERUNGSWERBER:string = "foer:Foerderungswerber";
  public static readonly FOER_PROJECTNR:        string = "foer:ProjektNr";
  public static readonly FOER_ZUSTAENDIG:       string = "foer:Zustaendig";



  public static readonly FOER_OFFEN: string = "Offen";
  public static readonly FOER_BEANTRAGT: string = "Beantragt";
  public static readonly FOER_POSITIV: string = "Positiv Entschieden";
  public static readonly FOER_ABGERECHNET: string = "Abgerechnet";
  public static readonly FOER_AUSBEZAHLT: string = "Ausbezahlt - Aufrechter Vertrag";
  public static readonly FOER_BEENDET: string = "Beendet - Vertrag Abgelaufen";
  public static readonly FOER_FOERDERSTATUS_VALUES = [
	  FOER_CONST.FOER_OFFEN,
	  FOER_CONST.FOER_BEANTRAGT,
	  FOER_CONST.FOER_POSITIV,
	  FOER_CONST.FOER_ABGERECHNET,
	  FOER_CONST.FOER_AUSBEZAHLT,
	  FOER_CONST.FOER_BEENDET
  ];

  public static getStatusProgress(val:string) : number {
    console.log(val);
    switch (val)
    {
      case FOER_CONST.FOER_OFFEN:
        return 0.01;
      case FOER_CONST.FOER_BEANTRAGT:
        return 0.25;
      case FOER_CONST.FOER_POSITIV:
        return 0.5;
      case FOER_CONST.FOER_ABGERECHNET:
        return 0.75;
      case FOER_CONST.FOER_AUSBEZAHLT:
        return 1.0;
      case FOER_CONST.FOER_BEENDET:
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
    FOER_CONST.FOER_HOLDING,
    FOER_CONST.FOER_MOBIL,
    FOER_CONST.FOER_GLOBAL,
    FOER_CONST.FOER_HT,
    FOER_CONST.FOER_MRGU,
    FOER_CONST.FOER_GUBAU,
    FOER_CONST.FOER_IMMO,
    FOER_CONST.FOER_OG,
    FOER_CONST.FOER_SCHWAB
  ];

  public static readonly FOER_AWS_COVID_INVEST: string = "AWS COVID Investitionsprämie";
  public static readonly FOER_OEMAG_PV_INV_ZUSCHUSS: string = "OEMAG PV Investitionszuschuss";
  public static readonly FOER_OEKOFIT_KAERNTEN: string = "ÖKO Fit Kärnten";
  public static readonly FOER_COFAG_AUSFALLBONUS_III: string = "COFAG Ausfallbonus III";
  public static readonly FOER_FOERDERSCHIENE_VALUES = [
    FOER_CONST.FOER_AWS_COVID_INVEST,
    FOER_CONST.FOER_OEMAG_PV_INV_ZUSCHUSS,
    FOER_CONST.FOER_OEKOFIT_KAERNTEN,
    FOER_CONST.FOER_COFAG_AUSFALLBONUS_III,
  ];
}
