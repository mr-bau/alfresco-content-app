// tslint:disable-next-line: adf-license-banner

import { ChangeDetectorRef, AfterContentInit, AfterViewInit, Component, OnInit, ViewChild, Inject, LOCALE_ID } from '@angular/core';
import { NodeEntry, NodePaging } from '@alfresco/js-api';
import { AlfrescoApiService } from '@alfresco/adf-core';
import { ContentApiService } from '@alfresco/aca-shared';
import { FOER_CONST } from '../mrbau-foerdermanager-declarations';
import { CONST } from '../mrbau-global-declarations';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { formatCurrency } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';

// filter implementation based on https://www.freakyjolly.com/angular-material-table-custom-filter-using-select-box/
//NodesApi
interface FoerderungenDataTableEntry {
  name: string;
  startDate: Date;
  status: string;
  statusProgress: number;
  foerderschiene: string;
  sum: number;
  foerderungswerber: string;
  projectnr: string;
  zustaendig: string;
  desc: string;
  id: string;
}

@Component({
  selector: 'aca-mrbau-foerdermanager',
  templateUrl: './foerdermanager.component.html',
  styleUrls: ['./foerdermanager.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class FoerdermanagerComponent implements OnInit, AfterContentInit, AfterViewInit {
  constructor(
    private apiService: AlfrescoApiService,
    private contentApi: ContentApiService,
    private changeDetector: ChangeDetectorRef,
    @Inject(LOCALE_ID) public locale: string
  ) {
    this.resetFilterSelectObj();
  }
  includeAusfallbonusIII = true;
  includeBeendet = false;

  loaderVisible = true;
  errorMessage: string = null;
  isSiteMember = true;

  dataTableSource = new MatTableDataSource<FoerderungenDataTableEntry>();
  documentListStartFolder = '-sites-';
  foerderungFolderId: string;
  siteTitle: string;
  siteStatus: string;
  siteGuid: string;
  siteLink = '/#/libraries/';
  expandedElement: FoerderungenDataTableEntry = null;
  //********************************************************************************/
  // Chart
  //********************************************************************************/
  chartAInstance: any;
  chartBInstance: any;

  optionsChartA = {
    //title: {
    //text: 'Fördersumme pro Firma',
    //subtext: 'Erhaltene Förderungen',
    //x: 'center'
    //},
    tooltip: {
      trigger: 'item',
      //formatter: "{a} <br/>{b} : {c} ({d | currency}%)"
      formatter: (params) => {
        return (
          params.name +
          '<br>' +
          params.seriesName +
          ': ' +
          formatCurrency(params.value, this.locale, '€', 'EUR', '1.2-2') +
          ' (' +
          params.percent +
          '%) <br>'
        );
      }
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: []
    },
    calculable: true,
    series: [
      {
        name: 'Förderbetrag',
        type: 'pie',
        radius: [30, 110],
        roseType: 'area',
        data: []
      }
    ]
  };

  optionsChartB = {
    //title: {
    //  text: 'Förderstatus',
    //  subtext: 'Status aktuell',
    //  x: 'center'
    //},
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    legend: {
      x: 'center',
      y: 'bottom',
      data: []
    },
    calculable: true,
    series: [
      {
        name: 'Förderstatus',
        type: 'pie',
        radius: [30, 110],
        roseType: 'area',
        data: []
      }
    ]
  };
  //********************************************************************************/
  // Data Table
  //********************************************************************************/

  //displayedColumns: string[] = ['Name', 'Datum', 'Status', 'Progress', 'Förderschiene','Fördersumme','Projektnummer','Zuständig','Anmerkung'];
  displayedColumns: string[] = ['name', 'foerderungswerber', 'projectnr', 'statusProgress', 'status', 'sum'];
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterSelectObj = [];
  filterValues = {};

  ngAfterViewInit(): void {}

  ngAfterContentInit(): void {}

  ngOnInit(): void {
    this.contentApi.sitesApi.listSites({maxItems:999})
    .then(sitePaging => {
        const entries = sitePaging.list.entries;
        for (let i=0; i<entries.length; i++)
        {
          const entry = entries[i];
          if (entry.entry.id == 'foerdermanager')
          {
            this.isSiteMember = true;
            return this.contentApi.getNodeInfo('-root-', {
                includeSource: true,
                include: ['path', 'properties'],
                relativePath: '/Sites/foerdermanager/documentLibrary'
              })
              .toPromise();
          }
        }
        this.isSiteMember = false;
        return Promise.reject();
    })
    .then((node) => {
        this.siteGuid = node.id;
        this.siteLink = '/#/libraries/' + node.id;
        return this.contentApi
        .getNodeInfo('-root-', {
          includeSource: true,
          include: ['path', 'properties'],
          relativePath: '/Sites/foerdermanager/documentLibrary/Förderungen'
        }).toPromise();
    })
    .then((node) => {
        //console.log(node);
        this.foerderungFolderId = node.id;
        this.documentListStartFolder = node.id;
        this.reloadData();
        this.changeDetector.detectChanges();
    })
    .catch((err) => this.setErrorMessage(err));

    // Override default filter behaviour of Material Datatable
    this.dataTableSource.filterPredicate = this.createFilter();
  }

  async reloadData() {
    this.loaderVisible = true;
    this.resetFilters();
    this.resetFilterSelectObj();
    this.loadData();
  }

  //********************************************************************************/
  // Load Data
  //********************************************************************************/

  isFoerderungsordner(node: NodeEntry): boolean {
    return node.entry.aspectNames.indexOf(FOER_CONST.FOER_FOERDERUNGSORDNER) > -1;
  }

  async loadData() {
    try {
      if (this.apiService.getInstance().isLoggedIn()) {
        //let siteEntry : SiteEntry = await this.contentApi.getSite("foerdermanager").toPromise()
        //let nodes : NodePaging =  await this.contentApi.getNodeChildren(this.foerderungFolderId).toPromise();

        const [siteEntry, nodes] = await Promise.all([
          this.contentApi.getSite('foerdermanager').toPromise(),
          this.contentApi.getNodeChildren(this.foerderungFolderId, {maxItems: 999, skipCount: 0}).toPromise()
        ]);
        this.siteTitle = siteEntry.entry.title;
        this.siteStatus =
          'User: ' +
          this.apiService.getInstance().getEcmUsername() +
          ' - Site Title: ' +
          siteEntry.entry.title +
          ' - Site Id: ' +
          siteEntry.entry.guid +
          ' - DocLib Id: ' +
          this.siteGuid;
        this.dataTableSource.data.length = 0;

        for (let i = 0; i < nodes.list.entries.length; i++) {
          const dirNode: NodeEntry = nodes.list.entries[i];
          if (!dirNode.entry.isFolder) continue;

          const foerNodes: NodePaging = await this.contentApi
            .getNodeChildren(dirNode.entry.id, {
              include: ['aspectNames, properties']
            })
            .toPromise();
          for (let j = 0; j < foerNodes.list.entries.length; j++) {
            const foerNode: NodeEntry = foerNodes.list.entries[j];

            if (foerNode.entry.isFolder && this.isFoerderungsordner(foerNode)) {
              let includeNode = true;
              if (
                this.includeAusfallbonusIII === false &&
                foerNode.entry.properties[FOER_CONST.FOER_FOERDERSCHIENE] === FOER_CONST.FOER_COFAG_AUSFALLBONUS_III
              ) {
                includeNode = false;
              }
              if (this.includeBeendet === false && foerNode.entry.properties[FOER_CONST.FOER_FOERDERSTATUS] === 'Beendet - Zurückgezogen') {
                includeNode = false;
              }
              if (includeNode) {
                const entry: FoerderungenDataTableEntry = {
                  name: foerNode.entry.name,
                  startDate: foerNode.entry.createdAt,
                  status: foerNode.entry.properties[FOER_CONST.FOER_FOERDERSTATUS],
                  statusProgress: FOER_CONST.getStatusProgress(foerNode.entry.properties[FOER_CONST.FOER_FOERDERSTATUS]),
                  foerderschiene: foerNode.entry.properties[FOER_CONST.FOER_FOERDERSCHIENE],
                  foerderungswerber: foerNode.entry.properties[FOER_CONST.FOER_FOERDERUNGSWERBER],
                  sum: (foerNode.entry.properties[FOER_CONST.FOER_FOERDERSUMME]) ? (foerNode.entry.properties[FOER_CONST.FOER_FOERDERSUMME]) : 0,
                  projectnr: foerNode.entry.properties[FOER_CONST.FOER_PROJECTNR],
                  zustaendig: foerNode.entry.properties[FOER_CONST.FOER_ZUSTAENDIG],
                  desc: foerNode.entry.properties[CONST.CM_DESC],
                  id: foerNode.entry.id
                };
                this.dataTableSource.data.push(entry);
              }
            }
          }
        }

        this.filterSelectObj.filter((o) => {
          o.options = this.getFilterObject(this.dataTableSource.data, o.columnProp);
        });

        this.dataTableSource.sort = this.sort;

        this.dataTableSource.paginator = this.paginator;
        this.table.renderRows();
        //options for Chart A
        this.optionsChartA.legend.data = this.getFilterObject(this.dataTableSource.data, 'foerderungswerber');
        {
          this.optionsChartA.series[0].data.length = 0;
          for (let i = 0; i < this.optionsChartA.legend.data.length; i++) {
            const company: string = this.optionsChartA.legend.data[i];
            this.optionsChartA.series[0].data.push({ value: this.getSum(company), name: company });
          }
        }
        if (this.chartAInstance) {
          this.chartAInstance.setOption(this.optionsChartA);
        }

        //options for Chart B
        this.optionsChartB.legend.data = this.getFilterObject(this.dataTableSource.data, 'status');
        {
          this.optionsChartB.series[0].data.length = 0;
          for (let i = 0; i < this.optionsChartB.legend.data.length; i++) {
            const status: string = this.optionsChartB.legend.data[i];
            this.optionsChartB.series[0].data.push({ value: this.getNum(status), name: status });
          }
        }
        if (this.chartBInstance) {
          this.chartBInstance.setOption(this.optionsChartB);
        }

        this.loaderVisible = false;
      } else {
        this.setErrorMessage('Not logged in - aborting ...');
      }
    } catch (err) {
      this.setErrorMessage(err);
    }
  }

  setErrorMessage(msg: string) {
    this.loaderVisible = false;
    this.errorMessage = msg;
    //console.error(msg);
  }

  onChartEvent(event: any, type: string) {
    switch (type) {
      case 'initA':
        this.chartAInstance = event;
        break;
      case 'initB':
        this.chartBInstance = event;
        break;
      default:
        break;
    }

    //console.log('chart event:', type, event);
  }

  getSum(firma: string): number {
    let sum = 0;
    for (let i = 0; i < this.dataTableSource.data.length; i++) {
      if (this.dataTableSource.data[i].foerderungswerber === firma) {
        sum += this.dataTableSource.data[i].sum;
      }
    }
    return sum;
  }

  getNum(status: string): number {
    let num = 0;
    for (let i = 0; i < this.dataTableSource.data.length; i++) {
      if (this.dataTableSource.data[i].status === status) {
        num++;
      }
    }
    return num;
  }

  // Custom filter method for Angular Material Datatable
  createFilter() {
    const filterFunction = function (data: any, filter: string): boolean {
      const searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }
      //console.log(searchTerms);
      const nameSearch = () => {
        let found = 0;
        let num = 0;
        if (isFilterSet) {
          for (const col in searchTerms) {
            if (searchTerms.hasOwnProperty(col)) {
              //searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
              //  if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
              //    found = true
              //  }
              //});
              num++;
              if (data[col].toString().toLowerCase().indexOf(searchTerms[col].trim().toLowerCase()) !== -1) {
                found = found + 1;
              }
            }
          }
          return found === num;
        } else {
          return true;
        }
      };
      return nameSearch();
    };
    return filterFunction;
  }

  // Called on Filter change
  filterChange(filter, event) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase();
    this.dataTableSource.filter = JSON.stringify(this.filterValues);
  }

  // Reset table filters
  resetFilters() {
    this.filterValues = {};
    this.filterSelectObj.forEach((value) => {
      value.modelValue = undefined;
    });
    this.dataTableSource.filter = '';
  }

  resetFilterSelectObj() {
    this.filterSelectObj = [
      {
        name: 'Firma',
        columnProp: 'foerderungswerber',
        //options: CONST.FOER_FOERDERUNGSWERBER_VALUES
        options: []
      },
      {
        name: 'Status',
        columnProp: 'status',
        //options: CONST.FOER_FOERDERSTATUS_VALUES
        options: []
      },
      {
        name: 'Förderschiene',
        columnProp: 'foerderschiene',
        //options: CONST.FOER_FOERDERSCHIENE_VALUES
        options: []
      }
    ];
  }

  // Populate filterSelectObj
  getFilterObject(fullObj, key) {
    const uniqChk = [];
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }

  /** Gets the total cost of all transactions. */
  getTotalCost() {
    //return this.dataTableSource.data.map(t => t.sum).reduce((acc, value) => acc + value, 0);
    return this.dataTableSource.filteredData.map((t) => t.sum).reduce((acc, value) => acc + value, 0);
  }

  rowClicked(row) {
    if (this.expandedElement === row) {
      this.expandedElement = null;
    } else {
      this.expandedElement = row;
    }
  }

  dataSettingsChanged() {
    this.reloadData();
  }
}

//********************************************************************************/
// Utility Scripts to modify model paramters
//********************************************************************************/

/**
 * Change the model to a new version with new prefix but the same properties and but retain the property values.
 * Start with a root node and apply to all sub nodes.
 * Call examples:
 * const OLD_PREFIX = "foer2:";
 * const NEW_PREFIX = "foer:";
 * const alfrescoApi = new AlfrescoApi({hostEcm:'https://mrdms01.mrbau.at'});
 * const nodesApi = new NodesApi(alfrescoApi);
 * getNodesRecursive(nodesApi,"-root-", OLD_PREFIX, NEW_PREFIX);
 * @param nodesApi
 * @param id
 * @param OLD_PREFIX
 * @param NEW_PREFIX
 */
/*
async function getNodesRecursive(nodesApi: NodesApi, id: string, OLD_PREFIX:string, NEW_PREFIX:string) {
  const opts = { 'include': ['aspectNames'],};
  let data = await nodesApi.listNodeChildren(id, opts);
  for (let i=0; i<data.list.entries.length; i++)
  {
    let item = data.list.entries[i];
    let containsOldPrefix : boolean = false;
    for (let j=0; j<item.entry.aspectNames.length; j++)
    {
      if (item.entry.aspectNames[j].startsWith(OLD_PREFIX))
      {
        containsOldPrefix = true;
        break;
      }
    }
    if (containsOldPrefix)
    {
        console.log(item.entry.name);
        await updateFoerDocument(nodesApi, item.entry.id, OLD_PREFIX, NEW_PREFIX);
    }
    if (item.entry.isFolder)
    {
      await getNodesRecursive(nodesApi, item.entry.id, OLD_PREFIX, NEW_PREFIX);
    }
  }
}*/

/**
 * Change the model to a new version with new prefix but the same properties and but retain the property values.
 * Call examples
 * updateFoerDocument(nodesApi, "022c3797-bde1-465c-905b-3046acc9fa3c",OLD_PREFIX, NEW_PREFIX);
 * updateFoerDocument(nodesApi, "4d2b46d4-38c0-4407-85a3-5408edc2c539",OLD_PREFIX, NEW_PREFIX);
 * @param nodesApi
 * @param id
 * @param OLD_PREFIX
 * @param NEW_PREFIX
 * @returns
 */
/*
async function updateFoerDocument(nodesApi: NodesApi, id: string, OLD_PREFIX: string, NEW_PREFIX: string) : Promise<NodeEntry>
{
  // get node
  let node = await nodesApi.getNode(id);
  let nodeBodyUpdate = new NodeBodyUpdate();
  console.log(id);
  console.log(node.entry.aspectNames);
  console.log(node.entry.properties);
  if (node.entry.aspectNames.find(val => val.startsWith(OLD_PREFIX)) === undefined)
  {
    return null;
  }

  // add new Aspect
  nodeBodyUpdate.aspectNames = node.entry.aspectNames;
  for (let i=0; i<nodeBodyUpdate.aspectNames.length;i++)
  {
    if (nodeBodyUpdate.aspectNames[i].startsWith(OLD_PREFIX))
    {
      nodeBodyUpdate.aspectNames.push(NEW_PREFIX+nodeBodyUpdate.aspectNames[i].substring(OLD_PREFIX.length)); // 2nd parameter means remove one item only;
    }
  }
  console.log("Add Aspect");

  console.log(nodeBodyUpdate);
  let data = await nodesApi.updateNode(id, nodeBodyUpdate);
  console.log('API called successfully. Returned data: ');
  console.log(data);

  // Add Properties and remove Aspect
  nodeBodyUpdate.properties =  {};
  for (let i=0; i<nodeBodyUpdate.aspectNames.length;i++)
  {
    if (nodeBodyUpdate.aspectNames[i].startsWith(OLD_PREFIX))
    {
      nodeBodyUpdate.aspectNames.splice(i,1);
    }
  }
  for (const [key , value] of Object.entries(node.entry.properties)) {
    if (key.startsWith(OLD_PREFIX))
    {
      let key2 : string = NEW_PREFIX+key.substring(OLD_PREFIX.length);
      Object.defineProperty(nodeBodyUpdate.properties, key2, {value: value, writable : true, enumerable : true, configurable : true});
    }
  }
  console.log("Add Properties and remove Aspect");
  console.log(nodeBodyUpdate);
  data = await nodesApi.updateNode(id, nodeBodyUpdate);
  console.log('API called successfully. Returned data: ');
  console.log(data);
  return data;
}*/
