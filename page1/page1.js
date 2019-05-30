const filterValue = document.querySelector("#filter-value");

class TableMaker {

  constructor() {
  }

  flattenData(data) {
    var output = [];
    function flattenRow(row) {
      var outputRow = {};
      for (var prop in row) {
        if (typeof row[prop] !== "object") {
          outputRow[prop] = row[prop];
        } else {
          var flat = flattenRow(row[prop]);
          for (var flatProp in flat) {
            outputRow[prop + "_" + flatProp] = flat[flatProp];
          }
        }
      }
      return outputRow;
    }
    data.forEach(row => output.push(flattenRow(row)));
    return output;
  }

  async fetchManifest() {
    const manifest = await fetch("./data/manifest.json");
    const manifest_json = await manifest.json();
    return manifest_json;
  }

  async fetchDataForAutocomplete() {
    const manifestJson = await this.fetchManifest();
    const promises = [];

    for (let i = manifestJson.length - 1; i >= 0; i--) {
      promises.push(
        fetch(`./data/${manifestJson[i]}`).then(response => {
          return response.json().then(function (array) {
            return array;
          });
        })
      );
    }
    return await Promise.all(promises);
  }

  async fetchDataForTableView() {
    const manifestJson = await this.fetchManifest();
    const promises = [];

    for (let i = manifestJson.length - 1; i >= 0; i--) {
      promises.push(
        fetch(`./data/${manifestJson[i]}`).then(response => {
          return response.json().then(function (array) {
            array["fileName"] = manifestJson[i]; // with file name
            return array;
          });
        })
      );
    }
    return await Promise.all(promises);
  }

  async fetchAll(json) {
    const promises = [];

    for (let i = json.length - 1; i >= 0; i--) {
      promises.push(
        fetch(`./data/${json[i]}`).then(response => {
          return response.json().then(function (array) {
            return array;
          });
        })
      );
    }
    return await Promise.all(promises);
  }

  async fetchData() {
    const manifest = await fetch("./data/manifest.json");
    const manifest_json = await manifest.json();
    const json = await this.fetchAll(manifest_json);
    return json;
  }

  getJsonValues(array) {
    let jsonValues = [];
    for (let index = 0; index < array.length; index++) {
      let element = Object.values(array[index]);
      this.getNonObjJsonValues(element, jsonValues);
    }
    return jsonValues;
  }

  getNonObjJsonValues(e, jsonValues) {
    if (typeof e == 'object') {
      let val = Object.values(e);
      for (let j = 0; j < val.length; j++) {
        let ele = val[j];
        this.getNonObjJsonValues(ele, jsonValues);
      }
    } else {
      jsonValues.push(e);
    }
    return jsonValues;
  }

  download() {
    let table = new Tabulator("#sensorTable", {
    //   ...this.config,
    //   data: data, //assign data to table
    //   columns: this.columns
    });
    table.download("csv", "data.csv");
  }

  filter() {
    this.table.setFilter(
      filterValue.value
    );
  }

  clearFilter() {
    filterValue.value = "";
    this.table.clearFilter();
  }

  async init() {
    const data = await this.fetchData();
    const flattenedData = this.flattenData(data);
    return flattenedData;
  }
}
