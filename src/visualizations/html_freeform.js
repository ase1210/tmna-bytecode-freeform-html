const { config } = require("process");

let vis = looker.plugins.visualizations.add({
    options: {
        html_freeform: {
          type: "string",
          label: "Freeform HTML. Use strings like ~1, ~2, or ~3 to access data inside the html",
          display: "text",
          default: "<div>Your custom HTML</div>"
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
        }`
      },
        use_html_from_fields: {
          type: "boolean",
          label: "Use html from fields",
          default: false
      },
        current_page: {
          type:"number",
          label: "Current Page of Viz",
          default:1
        },
        rows_per_page: {
          type:"number",
          label:"Rows per Page",
          default:5
        },
        pagination_toggle: {
          type:"boolean",
          label:"Pagination?",
          default:true
        }
  },

	create: function(element, config){
    element.innerHTML = `<div class="html_freeform">Rendering...</div>`;
    },
	updateAsync: function(data, element, config, queryResponse, details, doneRendering){
      console.log("current page",config.current_page)
        const totalPages = Math.ceil(data.length / config.rows_per_page);

        console.log(data);
        
        element.innerHTML = ''
        let measure_fields = queryResponse.fields.measure_like.map((field) => {
            // let key =    field.label
            return field.name
        })
        let dimension_fields = queryResponse.fields.dimension_like.map((field) => {
          // let key =    field.label
          return field.name
         
      })
        let fields = dimension_fields.concat(measure_fields)

        let existingStyleRef =  document.getElementById("freeformStyle") 
        if (existingStyleRef) existingStyleRef.remove()
        
        var styleEl = document.createElement('style');
        styleEl.setAttribute('type',"text/css")
        styleEl.setAttribute('id',"freeformStyle")
        styleEl.innerHTML = config.styles_freeform

        document.head.appendChild(styleEl);

        let html = ''
         let lastRow = config.current_page * config.rows_per_page;
         let firstRow = lastRow - config.rows_per_page;

        let filteredData=data;
        if (config.pagination_toggle){
          filteredData = data.filter((d,i) => {
              return i < lastRow && firstRow <= i
          })
        }


        for(var row of filteredData) {
          let rowHtml = config.html_freeform || ' ';
          fields.map((field, i) => {
            let cellHtml = ' '
            var cell = row[field];
            cellHtml = LookerCharts.Utils.htmlForCell(cell);
            console.log(cellHtml);
            rowHtml = rowHtml.replace(`~${i+1}`
            , cellHtml)
          })
          html = html + rowHtml;
        }

        if (config.pagination_toggle) {
          let firstPage = config.current_page == 1? "disabled":"";
          let lastPage = config.current_page == totalPages? "disabled":"";
          console.log(config.current_page, totalPages)
          const test = `
          <div style="position:absolute; display:flex; bottom:0;">
            <div>
              <button ${firstPage} id="prev">Prev</button>
            </div>
            <div>${config.current_page}</div>
            <div>
              <button ${lastPage} id="next">Next</button>
            </div>
          </div>
          `
          html += test;
        }

       element.innerHTML = html;

       
       document.getElementById("next").addEventListener("click", () => nextPage(config));
       document.getElementById("prev").addEventListener("click", () => prevPage(config));
       const nextPage = (config) => {
          let newPage = config.current_page + 1
          this.trigger("updateConfig", [{current_page:newPage}])
          config.current_page = newPage
          this.updateAsync(data,element,config,queryResponse,details,doneRendering)
        }
        const prevPage = (config) => {
          let newPage = config.current_page - 1
          this.trigger("updateConfig", [{current_page:newPage}])
          config.current_page = newPage
          this.updateAsync(data,element,config,queryResponse,details,doneRendering)
        }
		doneRendering()
	}  
});


