const { config } = require("process");

looker.plugins.visualizations.add({
  options: {
    html_freeform: {
      type: "string",
      label:
        "Freeform HTML. Use strings like ~1, ~2, or ~3 to access data inside the html",
      display: "text",
      default: "<div>Your custom HTML</div>",
    },

    styles_freeform: {
      type: "string",
      label: "Freeform Styles",
      display: "text",
      default: `@font-face {
          font-family: Open Sans;
          src: url( https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.woff2 );
        }
        div {
          background-color: white;
          text-align: center;
        }`,
    },
    use_html_from_fields: {
      type: "boolean",
      label: "Use html from fields",
      default: false, 
    },
    rows_per_page: {
      type: "number",
      label: "Rows per page ß",
      default: 5,
    },
    current_page: {
      type: "number",
      label: "Current page",
      default: 1,
    },
    showPage: {
      type: "boolean",
      label: "Show Page",
      default: true,
    },
    totalPages: {
      type: "number",
      label: "Total pages", 
      default: 1
    },
    showToggleButton: {
      type: "boolean",
      label: "Show Toggle pagination button",
      default: true,
    }
  },

  create: function (element, config) {
    element.innerHTML = `<div class="html_freeform">Rendering...</div>`;
  },
  updateAsync: function (
    data,
    element,
    config,
    queryResponse,
    details,
    doneRendering
  ) {
    element.innerHTML = "";
    let measure_fields = queryResponse.fields.measure_like.map((field) => {
      // let key =    field.label
      return field.name;
    });
    let dimension_fields = queryResponse.fields.dimension_like.map((field) => {
      // let key =    field.label
      return field.name;
    });

    let fields = dimension_fields.concat(measure_fields);

    let existingStyleRef = document.getElementById("freeformStyle");
    if (existingStyleRef) existingStyleRef.remove();

    var styleEl = document.createElement("style");
    styleEl.setAttribute("type", "text/css");
    styleEl.setAttribute("id", "freeformStyle");
    styleEl.innerHTML = config.styles_freeform;

    document.head.appendChild(styleEl);

    let html = "";
    
    let totalpages = Math.ceil(data.length / config.rows_per_page);
    console.log("Totalpages: ", totalpages);
    console.log('ppoo')
    this.trigger("updateConfig", [{ totalPages: totalpages }]);
    // let pagination = `
    //   <div class="center" style="position: absolute; bottom: 0;">
    if(totalpages > 0) {
    let pagination = `
      <div class="center" id="pageButtons">
        <div class="pagination" style="display: ${config.showPage ? 'block' : 'none'}">
          <a href="#" id="firstPageButton">&laquo;</a>
          <a href="#" id="prevPageButton">&lsaquo;</a>
          <a href="#"><span style="font-weight: bold">${config.current_page}</span> of <span id="vis_totalpages">${totalpages}</span></a>
          <a href="#" id="nextPageButton">&rsaquo;</a>            
          <a href="#" id="lastPageButton">&raquo;</a>            
          <!--<span>Total Pages: ${totalpages}</span>         
          <span>Rows: ${data.length}</span>-->
        </div>
        <div class="pagination" style="float: right;display: ${config.showToggleButton ? 'block' : 'none'}">
          <a href="#" id="pageToggle">Toggle Pagination</a>
        </div>
      </div> </br>`;
    html += pagination;

    let lastRow = config.current_page * config.rows_per_page - 1;
    let firstRow = lastRow - config.rows_per_page;

    let filteredData = data.filter((row, i) => {
      return i <= lastRow && i > firstRow;
    });
    for (var row of filteredData) {
      let rowHtml = config.html_freeform || " ";
      fields.map((field, i) => {
        let cellHtml = " ";
        var cell = row[field];
        cellHtml = LookerCharts.Utils.htmlForCell(cell);
        rowHtml = rowHtml.replace(`~${i + 1}~`, cellHtml);
      });
      html = html + rowHtml;
    }

    // let htmlWithPageBreak = html + `
    //   <div style="page-break-before:always">&nbsp;</div> 
    //   <div style="page-break-after:always">&nbsp;</div> 
    // `
    // element.innerHTML = htmlWithPageBreak;
    element.innerHTML = html;
  } else {
    html = `<span style="font-weight: bold">No Records found</span>`
    element.innerHTML = html;
  }
    
    document.getElementById("pageToggle").addEventListener("click", (e) => togglePage(e,config));

      const togglePage = (e, config) => {
        e.preventDefault();
        let pages = Math.ceil(data.length / config.rows_per_page);
        if(pages == 1) {
          this.trigger("updateConfig", [{ rows_per_page:  5, current_page: 1, showPage: true }]);
          config.rows_per_page = 5;
          config.current_page = 1;
          config.showPage = true;
        } else {
          this.trigger("updateConfig", [{ rows_per_page:  data.length, current_page: 1, showPage: false }]);
          config.rows_per_page = data.length;
          config.current_page = 1;
          config.showPage = false;
        }
        this.updateAsync(
          data,
          element,
          config,
          queryResponse,
          details,
          doneRendering
        );
      };

    document.getElementById("nextPageButton").addEventListener("click", (e) => nextPage(e,config));
      
    document.getElementById("prevPageButton").addEventListener("click", (e) => prevPage(e,config));

    document.getElementById("firstPageButton").addEventListener("click", (e) => firstPage(e,config));
      
    document.getElementById("lastPageButton").addEventListener("click", (e) => lastPage(e,config));

      const nextPage = (e, config) => {
        e.preventDefault();
        let pages = Math.ceil(data.length / config.rows_per_page);
        if(pages <= config.current_page) {
          
        } else {
        let newPage = config.current_page + 1;
        this.trigger("updateConfig", [{ current_page: newPage }]);
        config.current_page = newPage;
        this.updateAsync(
          data,
          element,
          config,
          queryResponse,
          details,
          doneRendering
        );
        }
      };
      
      const prevPage = (e, config) => {
        e.preventDefault();
        if(config.current_page != 1) {
        let newPage = config.current_page - 1;
        this.trigger("updateConfig", [{ current_page: newPage }]);
        config.current_page = newPage;
        this.updateAsync(
          data,
          element,
          config,
          queryResponse,
          details,
          doneRendering
        );
        }
      };

      const firstPage = (e, config) => {
        e.preventDefault();
        this.trigger("updateConfig", [{ current_page: 1 }]);
        config.current_page = 1;
        this.updateAsync(
          data,
          element,
          config,
          queryResponse,
          details,
          doneRendering
        );
      };
      const lastPage = (e, config) => {
        e.preventDefault();
        let pages = Math.ceil(data.length / config.rows_per_page);
        let newPage = pages;
        this.trigger("updateConfig", [{ current_page: newPage }]);
        config.current_page = newPage;
        this.updateAsync(
          data,
          element,
          config,
          queryResponse,
          details,
          doneRendering
        );
      };


    doneRendering();
  },
});