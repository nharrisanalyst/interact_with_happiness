// this compnent affects the top
var state={data:null}
var feign_data = [];
    state.countrySelected=[];

for(var i =0; i<5; i++){
     var holder_array =[];
    for(var j =0; j<10; j++){
     holder_array.push(j);
    }

    feign_data.push(holder_array);
}


 const data_call_1 = d3.csv('whr_2018_sheet1.csv'
 ,function(d){
   return {
     country: d.country,
     year :parseInt(d.year),
     life_ladder : parseFloat(d['Life Ladder']),
     log_gdp_per: parseFloat(d['Log GDP per capita']),
     democratic_q: parseFloat(d['Democratic Quality']),
     gini_index : parseFloat(d['GINI index (World Bank estimate)']),
     healthy_life_expectancy: parseFloat(d['Healthy life expectancy at birth']),
     perception_of_corruption: parseFloat(d['Perceptions of corruption']),
     freedom_life_choice: parseFloat(d['Freedom to make life choices']),
     social_support : parseFloat(d['Social support']),
     generosity: parseFloat(d['Generosity']),
     confidence_gov : parseFloat(d['Confidence in national government'])


   }
 },
 function(data_1){
   const data_call_2 = d3.csv('happiness_score.csv', function(d){
     return {
       country: d.Country,
       happiness_score: parseFloat(d['Happiness score']),
       e_by_freedom: parseFloat(d['Explained by: Freedom to make life choices']),
       e_by_gdp_per : parseFloat(d['Explained by: GDP per capita']),
       e_health_life_expectancy : parseFloat(d['Explained by: Healthy life expectancy']),
       e_social_support : parseFloat(d['Explained by: Social support']),
       base : parseFloat(d['Dystopia (1.92) + residual'])

     }
   },
   function(data_2){

     const data_call_3 = d3.csv('wdvp.csv', function(d){
       return {
         country: d.indicator,
         gini_index: parseFloat(d['GINI index'])
       }
     },function(data_3){


        data_1.forEach((val,i)=>{

          let happiness_var =data_2.filter(function(data,j){

              return data.country === val.country;
          })

          let gini_index = data_3.filter(function(data,k){


             return data.country === val.country;
          })




             happiness_var[0] = happiness_var[0] != undefined ? happiness_var[0]:{};
             gini_index[0]    = gini_index[0] != undefined ? gini_index[0]:{gini_index:undefined};

             val['gini_index'] =gini_index[0].gini_index;

           const joined_data = Object.assign({},happiness_var[0],val);

           data_1[i] = joined_data;
          })

             let data_joined =data_1;




              data_joined = democratic2017(data_joined);

             let data_joined_2017 = filterDataYear(data_joined, 2017);

            state.data = updateData(data_joined_2017)
            state.main = updateData(data_joined);

              data_joined_2017 = data_joined_2017.filter(function(d){
                  return d.happiness_score != undefined;
              })
              data_joined_2017.forEach(function(val){
              val =  addUnExplained(val, ['base','e_social_support','e_by_gdp_per','e_health_life_expectancy','e_by_freedom']);
              })



              const  point_1 = new Point({contEl:document.querySelector('#scatter-plot-1'), data:data_joined_2017, title:{x:'log gdp per person'}, explain:'log_gdp_per',id:0,radius_var:'gini_index', color_var:'healthy_life_expectancy'})
                    point_1.draw();
              const menu_1 = new Menu({data:data_joined_2017, contEl:document.querySelector('#scatter-menu-1'),id:'one', selected:point_1.getVariables()});
                    menu_1.draw();


              const point_2 = new Point({contEl:document.querySelector('#scatter-plot-2'), data:data_joined_2017, title:{x:'life_ladder'}, explain:'generosity',id:1,radius_var:'democratic_q', color_var:'life_ladder'})
                    point_2.draw();
              const menu_2 = new Menu({data:data_joined_2017, contEl:document.querySelector('#scatter-menu-2'), id:'two',selected:point_2.getVariables()});
                    menu_2.draw();

              const box_swarm = new BoxSwarm({contEl:document.querySelector('#container-box-swarm'), data:data_joined_2017,brushed:brushed})
                   box_swarm.draw();



              const year_menu = new YearMenu({contEl:document.querySelector('#year-button-container'), currentYear:'2017'})
                    year_menu.draw();
// this.contEl = opts.contEl
// this.data   = opts.data;
// this.xTitle = opts.title.x;
// this.explain= opts.explain
// this.yTitle = 'Happiness Score';
// this.id     =  opts.id;
                      //{contEl:document.querySelector('#scatter-plot-1'), data:data_joined_2017, title{x:'log gdp per person'}, explain:'log_gdp_per',this.id:1}


               // point_1.brushed(state.data)
               // point_2.brushed(state.data)


            const stacked_bar = new StackedBar({data:data_joined_2017, country:'Peru', contEl:document.querySelector('#country-stacked-bar')})
                  stacked_bar.draw();

//event handelers
          function brushed(){

            const xScale = box_swarm.getScales()
             const selection = d3.event.selection;
             const start = xScale.invert(selection[0])-.001;
             const stop  = xScale.invert(selection[1])+.001;

            state.data = updateData(brushFilter(data_joined_2017,start,stop))

             box_swarm.brushed(selection,start,stop);
             point_1.brushed(state.data)
             point_2.brushed(state.data)

          }


       function menuClick(){
         //d3.selectAll('.button-div-years').on('click', yearMenuClick)

       }


       function yearMenuClick(){
              const year = d3.select(this).text();
              year_menu.rerender(year);
       }
//mouseover events for the beeSwarm

        function beeSwarmMouse(){
          d3.selectAll('.countries').on('mouseover',beeSwarmMouseover);
          d3.selectAll('.countries').on('mouseout',beeSwarmMouseout);
        }

        function beeSwarmMouseover(selection){

          d3.select(this).transition().attr('r',5);

          const data =d3.select(this).datum();
          const x = d3.event.x;
          const y = d3.event.y;


          //tooltips
          const tooltip = d3.select('body').append('div')
                                                .attr('class', 'beeswarm-tooltip')
                                                .attr('style',function(){
                                                  return 'top:'+(y-58)+'px;'+'left:'+(x-90)+'px;';
                                                })

                tooltip.html(formatBeeSwarmText(data))
        }

        function beeSwarmMouseout(selection){
          d3.selectAll('.beeswarm-tooltip').remove();
          d3.select(this).transition().attr('r',3);
        }

        function nullMouseover(){
          d3.selectAll('.beeswarm-tooltip').remove();
          return null
        }



//click events for beeswarm
      function beeSwarmClick(){
        d3.selectAll('.countries').on('click', beeSwarmClicked);
      }

      function beeSwarmClicked(){

         if(d3.select(this).attr("data") ==='true'){
            countryOff(this);
            d3.select(this).on('mouseout',beeSwarmMouseout);
         }else{
           countryOn(this);
           d3.select(this).on('mouseout',nullMouseover);

         }
      }


      function countryOn(self){

        d3.select(self).attr("data",'true');
         d3.select(self).attr('r',5)


         const country = d3.select(self).attr('name');

          state.countrySelected.push(country);



        point_1.renderSelectedCountries(state.countrySelected);
        point_2.renderSelectedCountries(state.countrySelected);

        const explained_happiness_data = filterDataCountry(box_swarm.getData(), state.countrySelected[state.countrySelected.length-1])
        stacked_bar.updateStack(explained_happiness_data);
      }

    function countryOff(self){



      d3.select(self).attr("data",'false');
      d3.select(self).transition().attr('r',3);

      const country = d3.select(self).attr('name');

       state.countrySelected = state.countrySelected.filter(function(d){
            return d != country;
       });



     point_1.renderSelectedCountries(state.countrySelected);
     point_2.renderSelectedCountries(state.countrySelected);

     const explained_happiness_data = filterDataCountry(box_swarm.getData(), state.countrySelected[state.countrySelected.length-1])
     stacked_bar.updateStack(explained_happiness_data);
    }

//select change

function selectChange(){
       d3.selectAll('.select-option').on('change',handleSelectChange);


}

function handleSelectChange(){


        const explain_1= d3.select('#select-0-one').node().value;
        const radius_var_1 = d3.select('#select-1-one').node().value;
        const color_var_1 = d3.select('#select-2-one').node().value;

        const explain_2= d3.select('#select-0-two').node().value;
        const radius_var_2 = d3.select('#select-1-two').node().value;
        const color_var_2 = d3.select('#select-2-two').node().value;

         point_1.updateVariables(explain_1,radius_var_1,color_var_1);
         point_2.updateVariables(explain_2,radius_var_2,color_var_2);




}

    function stakedBarHandleMouse(){

    }

    function selectCountryChange(){
      d3.select('.select-country-select').on('change',handleBeeSwarmSelectChange);
    }

    function handleBeeSwarmSelectChange(){
       var country = d3.select(this).node().value;
           var country  = country.replace(/\s/g, "");
               country = country.replace(")","");
               country = country.replace("(","");


      if(d3.select(this).node().value=='No Country'){
        handleBeeSwarmOff();
      }else{

        state.countrySelected=[d3.select(this).node().value]

        point_1.renderSelectedCountries(state.countrySelected);
        point_2.renderSelectedCountries(state.countrySelected);

        const explained_happiness_data = filterDataCountry(state.data, state.countrySelected[state.countrySelected.length-1])
        stacked_bar.updateStack(explained_happiness_data);
         d3.selectAll('.countries').attr('r',3);

        d3.select('#countries-'+country).attr('r', 5)
      }


    }

    function handleBeeSwarmOff(){
      d3.selectAll('.countries').attr('r',3);
      state.countrySelected=[];
      point_1.renderSelectedCountries(state.countrySelected);
      point_2.renderSelectedCountries(state.countrySelected);

      state.countrySelected=[]
      stacked_bar.updateStack([]);
    }

    //stacked bar nullMouseover
   function handleStackedMouse(){
       d3.selectAll('.stacked-bars-chart').on('mouseover', stackedMouseOn)
       d3.selectAll('.stacked-bars-chart').on('mouseout', stackedMouseOut)
   }

   function stackedMouseOn(){

       const key = d3.select(this).datum().key;
       const value  = d3.select(this).datum()[0].data[key];

       const x = d3.event.x;
       const y = d3.event.y;


       //tooltips
       const tooltip = d3.select('body').append('div')
                                             .attr('class', 'stack-bar-tooltip')
                                             .attr('style',function(){
                                               return 'top:'+(y-58)+'px;'+'left:'+(x-90)+'px;';
                                             })

             tooltip.html(formatStackedText(key,value))


   }

   function stackedMouseOut(){
      d3.selectAll('.stack-bar-tooltip').remove();
   }
        menuClick();
        beeSwarmMouse();
        beeSwarmClick()
        selectChange();
        selectCountryChange();
        handleStackedMouse();

        const dataHTML = "data is form the World Happiness Report  <a href='http://worldhappiness.report/ed/2018/'>World Happinness report 2018</a><br><a href='https://s3.amazonaws.com/happiness-report/2018/WHR2018Chapter2OnlineData.xls'>Excel File of Data</a>"

       d3.select("#data-disclosure-id").html(dataHTML);
     }
   )}
  );
 }
);




   function project(){

    }
//finding max values for the radial chart axias


class BoxSwarm{
   constructor(opts){
     this.contEl = opts.contEl;
     this.data = opts.data;
     this.data = this.data.sort(function(a,b){
                                  return a.happiness_score- b.happiness_score;
                               })
      this.brushedF = opts.brushed;


   }

   draw(){
      this.margin = {l:25,t:0,r:25,b:25};
      this.width  = this.contEl.offsetWidth - (this.margin.l+this.margin.r);
      this.height = 175- (this.margin.t+this.margin.b);
     //create svg
    this.svg = d3.select(this.contEl)
                 .append('svg')

                 .attr('width', this.width +(this.margin.l+this.margin.r))
                 .attr('height',this.height+(this.margin.t+this.margin.b));

    this.g = this.svg
                 .append('g')
                 .attr('class', 'main-g')
                 .attr('transform', 'translate(' + this.margin.l + ',' + this.margin.t + ')')
                 .attr('width', this.width +(this.margin.l+this.margin.r))
                 .attr('height',this.height+(this.margin.t+this.margin.b));

   this.makeQantiles();
   this.makeScales();
   this.makeAxis();
   this.brush(this.brushedF);
   this.makeBoxPlot();
   this.makeSwarm();
   this.makeSelectInput();
   }
   makeQantiles(){
     this.fiveQ = d3.quantile(this.data,0.05, function(d){return d.happiness_score});
     this.twenty_fiveQ = d3.quantile(this.data,0.25, function(d){return d.happiness_score});
     this.median = d3.median(this.data, function(d){return d.happiness_score});
     this.seventy_fiveQ = d3.quantile(this.data,0.75, function(d){return d.happiness_score});
     this.ninety_fiveQ = d3.quantile(this.data,0.95, function(d){return d.happiness_score});




   }

    makeScales(){
     this.extent = d3.extent(this.data, function(d){return d.happiness_score;});

     this.xScale = d3.scaleLinear()
                      .domain(this.extent)
                      .range([0,this.width])

     this.color= palette(this.extent[0], this.extent[1])

    }
    makeAxis(){
      this.xAxis = d3.axisBottom(this.xScale);

      this.g.append('g')
            .attr('class','x-axis-boxplot')
            .attr('transform', 'translate(' + 0+ ',' + this.height  + ')')
            .call(this.xAxis);

    }



    makeBoxPlot(){
       this.box_one = this.g.append('g')
                       .attr('class', 'boxplot-box-one')
                       .attr('transform', 'translate(' + 0+ ',' + (this.height-15)  + ')')
                       .append('rect')
                       .attr('x',this.xScale(this.twenty_fiveQ))
                       .attr('width',this.xScale(this.median)-this.xScale(this.twenty_fiveQ))
                       .attr('fill','red')
                       .attr('y',0)
                       .attr('height', '15')
                       .attr('stroke', 'black')
                       .attr('stroke-width', '1px')


        this.box_two = this.g.append('g')
                        .attr('class', 'boxplot-box-two')
                        .attr('transform', 'translate(' + 0+ ',' + (this.height-15)  + ')')
                        .append('rect')
                        .attr('x',this.xScale(this.median))
                        .attr('width',this.xScale(this.seventy_fiveQ)-this.xScale(this.median))
                        .attr('fill','green')
                        .attr('y',0)
                        .attr('height', '15')
                        .attr('stroke', 'black')
                        .attr('stroke-width', '1px')
    //boxplot wiskers
        this.whisker_one = this.g.append('g')
                                  .attr('class', 'boxplot-line-one')
                                  .attr('transform', 'translate(' + 0+ ',' + (this.height-7.5)  + ')')
                                  .append('line')
                                  .attr('x1',this.xScale(this.fiveQ))
                                  .attr('x2',this.xScale(this.twenty_fiveQ))
                                  .attr('y1',0)
                                  .attr('y2',0)
                                  .attr('stroke', 'black')
                                  .attr('stroke-width', '1px')

        this.whisker_two = this.g.append('g')
                                  .attr('class', 'boxplot-line-two')
                                  .attr('transform', 'translate(' + 0+ ',' + (this.height-7.5)  + ')')
                                  .append('line')
                                  .attr('x1',this.xScale(this.seventy_fiveQ))
                                  .attr('x2',this.xScale(this.ninety_fiveQ))
                                  .attr('y1',0)
                                  .attr('y2',0)
                                  .attr('stroke', 'black')
                                  .attr('stroke-width', '1px')




    }
    makeVoronoi(){
      this.varoni = d3.voroni()
                      .x(function(d) { return d.x; })
                      .y(function(d) { return d.y; })
                      .extent([[0, 0], [this.width, this.height]])

    }
   makeSwarm(){
     const data = this.data;
     const xScale = this.xScale;
     const h = this.height;
     const marginLeft = this.margin.l
     const color = this.color;



     var simulation = d3.forceSimulation(data)
       .force("x", d3.forceX(function(d) { return xScale(+d.happiness_score)}).strength(1))
         .force("y", d3.forceY((h / 2)))
         .force("collide", d3.forceCollide(4))
         .stop();



     for (var i = 0; i < data.length+35; ++i) simulation.tick();

     //voronoi



     this.countriesCircles = this.g.
      selectAll(".countries")
       .data(data, function(d) { return d.happiness_score});

     this.countriesCircles.exit()
       .transition()
         .duration(1000)
         .attr("cx", 0)
       .attr("cy", (h / 2)+25)
       .remove();

     this.countriesCircles.enter()
       .append("circle")
       .attr("data",'false')
       .attr('id', function(d){
          var country  = d.country.replace(/\s/g, "");
              country = country.replace(")","");
              country = country.replace("(","");
          return 'countries-'+country;
       })
       .attr("class", "countries")
       .attr("cx", 0)
       .attr("cy", (h / 2)+25)
       .attr("r", 3)
       .attr('stroke', 'black')
       .attr('stroke-width', '0.5')
       .attr("fill", function(d){ return color(d.happiness_score)})
       .merge(this.countriesCircles)
         .transition()
         .attr("cx", function(d) { return d.x; })
         .attr("cy", function(d) { return d.y; })
         .attr('name', function(d) {return d.country});





        }

      brush(brushed){
        const xScale = this.xScale;
        const brush = d3.brushX()
                        .extent([[0, 0], [this.width, this.height]])
                        .on("start brush end", brushed);

        const initBrush = this.g.append("g")
                            .attr("class", "brush")
                            .call(brush)

            initBrush.call(brush.move, [this.extent[0],this.extent[1]].map(xScale));

        d3.select('.selection').attr('fill-opacity', 0.2).attr('fill', '#a0a0a0')

      }

      getScales(){
        return this.xScale
      }

     brushed(selection,start,stop){




                        d3.selectAll('.countries')
                                .attr('fill', (d,i)=>{
                                  if(d.happiness_score<start || d.happiness_score>stop){
                                    return 'gray';
                                  }
                                  return this.color(d.happiness_score);
                                });

     }

     makeSelectInput(){
        let countries = getAllCountries(this.data);
            countries = ['No Country'].concat(countries);

        d3.select('#select-country-container').append('div')
                                              .attr('class', 'select-country-div')
                                              .append('select')
                                              .attr('class', 'select-country-select')
                                              .selectAll('option')
                                              .data(countries)
                                              .enter()
                                              .append('option')
                                              .attr('class', 'select-country-option')
                                              .text(function(d){return d})




     }

     getData(){
       return this.data;
     }

  }












//this function sorts and filters the data for the boxplot
function sort_and_filter(data){

}

function palette(min, max) {
    var d = (max-min)/5;
    return d3.scaleThreshold()
        .range(['#dc143c','#f37778','#f9dfb1','#669658','#006400'])
        .domain([min+1*d,min+2*d,min+3*d,min+4*d,min+5*d]);
}





class Point{
    constructor(opts){
         this.contEl = opts.contEl
         this.data   = opts.data;
         this.xTitle = opts.title.x;
         this.explain_var= opts.explain

         this.yTitle = 'Happiness Score';
         this.id     =  opts.id;



         this.mean   = d3.mean(this.data, function(d){return d.happiness_score})
         this.radius_var = opts.radius_var;
         this.color_var = opts.color_var;
         this.selectedCountries = [];



    }

    draw(){
       this.margin = {l:35,t:25,r:25,b:25};
       this.width = this.contEl.offsetWidth - (this.margin.l+this.margin.r);
       this.height = this.width;
       this.svg = d3.select(this.contEl)
                    .append('svg')
                    .attr('class','xy-chart svg-point-'+this.id)
                    .attr('width', this.width+(this.margin.l+this.margin.r))
                    .attr('height', this.height+(this.margin.l+this.margin.r))

        this.g  = this.svg.append('g')
                          .attr('class', 'g-xy-plot')
                          .attr('width', this.width)
                          .attr('height', this.height)
                          .attr('transform', 'translate(' + this.margin.l + ',' + this.margin.t + ')')



      this.makeScales();
      this.makeAxis();
      this.makePoints();
      this.makeAverageLine();
      this.makeLabels();

    }

    makeScales(){

      this.xScale = d3.scaleLinear()
                      .domain([d3.min(this.data,d => {return d[this.explain_var]}),d3.max(this.data,d => {return d[this.explain_var]})])
                      .range([0,this.width])
                      .nice();

     this.yScale  = d3.scaleLinear()
                      .domain([d3.min(this.data,d =>{return d.happiness_score}),d3.max(this.data,d =>{return d.happiness_score})])
                      .range([this.height,0])
                      .nice();
      this.radiusScale = d3.scaleLinear()
                           .domain(d3.extent(this.data,d=>{return d[this.radius_var]}))
                         .range([2.5,10])

      this.colorScale =d3.scaleLinear()
                           .domain(d3.extent(this.data,d=>{return d[this.color_var]}))
                         .range([0,1])
                 }
    makeAxis(){
          this.xAxis = d3.axisBottom(this.xScale)
                          .ticks(5);

          this.yAxis = d3.axisLeft(this.yScale)
                         .ticks(5);
           const xTickData = this.xAxis.scale().ticks().map(v=>{
                return this.xScale(v);
           })

           const yTickData = this.yAxis.scale().ticks().map(v=>{
                return this.xScale(v);
           })


          this.g.append('g')
                 .attr('class', 'x-axis '+'x-axis-'+this.id)
                 .attr('transform', 'translate(' + 0 + ',' + this.height + ')')
                 .call(this.xAxis);

          this.g.append('g')
                 .attr('class', 'y-axis '+this.id)

                 .call(this.yAxis);


        ///give the plots a grid

        this.g.append('g')
              .selectAll('line')
              .data(xTickData)
              .enter()
              .append('line')
              .attr('class', 'x-line-grid')
              .attr('x1', d=>{
                return d;
              })
              .attr('y1', 0)
              .attr('x2', d=>{
                return d;
              })
              .attr('y2',this.height+5)
              .attr('stroke-width', 1)
              .attr('stroke', '#f0f0f0')

      this.g.append('g')
            .selectAll('line')
            .data(xTickData)
            .enter()
            .append('line')
            .attr('class', 'x-line-grid')
            .attr('y1', d=>{
              return d;
            })
            .attr('x1', -5)
            .attr('y2', d=>{
              return d;
            })
            .attr('x2',this.width)
            .attr('stroke-width', 1)
            .attr('stroke', '#f0f0f0')

    }
    updateAxis(){
      //make new d3 axis
    this.xAxis = d3.axisBottom(this.xScale)
                                  .ticks(5);

      const xTickData = this.xAxis.scale().ticks().map(v=>{
           return this.xScale(v);
      })

     this.g.selectAll('x-line-grid').data(xTickData)
                                     .transition().attr('x1', d=>{
                                         return d;
                                       })
                                      .attr('x2', d=>{
                                         return d;
                                       })
     //call new d3 axis
    this.g.select('.x-axis-'+this.id).transition(this.trans).call(this.xAxis);

    }
    makePoints(){

        this.countries = this.g.selectAll('.countrie-circles')
                               .data(this.data)
                               .enter()
                               .append('circle')
                               .attr('class', 'countrie-circles')
                               .attr('cx', d=>{
                                if(isNaN(this.xScale(d[this.explain_var]))){
                                  return 0;
                                }
                                 return this.xScale(d[this.explain_var]);
                               })
                               .attr('cy', d=>{
                                 if(isNaN(this.yScale(d.happiness_score))){
                                   return 0;
                                 }
                                 return this.yScale(d.happiness_score);
                               })
                               .attr("r",d=>{

                                 if(isNaN(this.xScale(d[this.explain_var]))||isNaN(this.radiusScale(d[this.radius_var]))||isNaN(this.colorScale(d[this.color_var])) || isNaN(this.yScale(d.happiness_score)) ){

                                   return 0;
                                 }
                                 return this.radiusScale(d[this.radius_var]);
                               })
                               .attr('stroke', d=>{
                                 if(this.selectedCountries.includes(d.name)){
                                   return 'red'
                                 }
                                 return'black';})
                               .attr('stroke-width', d=>{
                                 if(this.selectedCountries.includes(d.name)){
                                   return 2.0;
                                 }
                                 return 0.5;})
                               .attr('fill', d=>{

                                 if(isNaN(this.colorScale(d[this.color_var]))){
                                   return 'white';
                                 }
                                 return point_colors[this.id](this.colorScale(d[this.color_var]))
                               })

    }

    makeAverageLine(){
      this.line = this.g.append('line')
                         .attr('x1', '0')
                         .attr('x2', this.width)
                         .attr('y1', this.yScale(this.mean))
                         .attr('y2', this.yScale(this.mean))
                         .attr('stroke','lightgray')
                         .attr('stroke-width', 1)
                         .attr('stroke-dasharray', '5 3 5')


    }

    brushed(data){
      this.brushedData = data;

      const circles = this.g.selectAll('.countrie-circles')
                            .data(this.brushedData);

              circles.exit().remove();

             circles.enter().append('circle')
                    .attr('class', 'countrie-circles')
                     .merge(circles)
                     .attr('class', 'countrie-circles')
                     .attr('cx', d=>{
                      if(isNaN(this.xScale(d[this.explain_var]))){
                        return 0;
                      }
                       return this.xScale(d[this.explain_var]);
                     })
                     .attr('cy', d=>{
                       if(isNaN(this.yScale(d.happiness_score))){
                         return 0;
                       }
                       return this.yScale(d.happiness_score);
                     })
                    .attr("r",d=>{
                      if(isNaN(this.xScale(d[this.explain_var]))||isNaN(this.radiusScale(d[this.radius_var]))||isNaN(this.colorScale(d[this.color_var])) || isNaN(this.yScale(d.happiness_score)) ){
                        return 0;
                      }
                      return this.radiusScale(d[this.radius_var]);
                    })
                    .attr('stroke', d=>{
                      if(this.selectedCountries.includes(d.country)){
                        return 'red'
                      }
                      return'black';})
                    .attr('stroke-width', d=>{
                      if(this.selectedCountries.includes(d.country)){
                        return 2.0;
                      }
                      return 0.5;})
                     .attr('fill', d=>{
                       if(isNaN(this.colorScale(d[this.color_var]))){
                         return 'white';
                       }
                       return point_colors[this.id](this.colorScale(d[this.color_var]))
                     })
           }
    renderSelectedCountries(countryArray){

          this.selectedCountries = countryArray;
          this.g.selectAll('.countrie-circles').transition()
                            .attr('stroke', d=>{
                              if(this.selectedCountries.includes(d.country)){
                                return 'red'
                              }
                              return'black';})
                            .attr('stroke-width', d=>{
                              if(this.selectedCountries.includes(d.country)){
                                return 2.0;
                              }
                              return 0.5;})
        }

       updateVariables(explain,radius_var,color_var){
           this.explain_var= explain;
           this.radius_var = radius_var;
           this.color_var = color_var;



           this.makeScales();
           this.updateAxis();

            this.g.selectAll('.countrie-circles').transition()
                                                  .attr('cx', d=>{
                                                   if(isNaN(this.xScale(d[this.explain_var]))){
                                                     return 0;
                                                   }
                                                    return this.xScale(d[this.explain_var]);
                                                  })
                                                  .attr('cy', d=>{
                                                    if(isNaN(this.yScale(d.happiness_score))){
                                                      return 0;
                                                    }
                                                    return this.yScale(d.happiness_score);
                                                  })
                                                  .attr("r",d=>{
                                                    if(isNaN(this.xScale(d[this.explain_var]))||isNaN(this.radiusScale(d[this.radius_var]))||isNaN(this.colorScale(d[this.color_var])) || isNaN(this.yScale(d.happiness_score)) ){
                                                      return 0;
                                                    }
                                                    return this.radiusScale(d[this.radius_var]);
                                                  })
                                                 .attr('stroke', d=>{
                                                   if(this.selectedCountries.includes(d.country)){
                                                     return 'red'
                                                   }
                                                   return'black';})
                                                 .attr('stroke-width', d=>{
                                                   if(this.selectedCountries.includes(d.country)){
                                                     return 2.0;
                                                   }
                                                   return 0.5;})
                                                  .attr('fill', d=>{
                                                    if(isNaN(this.colorScale(d[this.color_var]))){
                                                      return 'white';
                                                    }
                                                    return point_colors[this.id](this.colorScale(d[this.color_var]))
                                                  })


       }

  getVariables(){
    return [this.explain_var,this.radius_var,this.color_var]
  }

   makeLabels(){
     this.yLabel = this.svg.append('g')
                       .attr('transform', 'translate(' + 15 + ',' + 125 + ') rotate(270)')
                       .append('text')
                       .text('Happines Score');


   }


}


class StackedBar{
  constructor(opts){
    this.data =opts.data

    this.data = sumAll(this.data);

    this.max = 8;
    this.contEl = opts.contEl;
    this.data = stackedData(this.data)
    this.country = 'Avarage of All';
    this.aveData = this.data;
    this.keys =['un_explained','base','e_social_support','e_by_gdp_per','e_health_life_expectancy','e_by_freedom'];
  }
  draw(){
    this.margin = {l:25,t:25,r:25,b:25};
    this.width  =  this.contEl.offsetWidth - (this.margin.l+this.margin.r);
    this.height = 75;

    this.svg = d3.select(this.contEl)
               .append('svg')
               .attr('width', this.width+(this.margin.l+this.margin.r))
               .attr('height', this.height+(this.margin.t+this.margin.b))

    this.g = this.svg
                 .append('g')
                 .attr('width', this.width)
                 .attr('height', this.height)
                 .attr('transform', 'translate(' + this.margin.l + ',' + this.margin.t + ')')



   this.makeScales();
   this.makeAxis();
   this.stackBars();
   this.makeMenu();
   this.makeTitle();
   }

   makeScales(){
     this.xScale= d3.scaleLinear()
                    .domain([0,this.max])
                    .range([0,this.width])
                    .nice();
    this.colors = d3.schemeSet3;
   }
   makeAxis(){
     this.xAxis = d3.axisBottom(this.xScale);


     this.g.append('g')
            .attr('class', 'stacked-x-axis')
           .attr('transform', 'translate(' + 0 + ',' + 65 + ')')
           .call(this.xAxis);
   }
   stackBars(){
       this.g.append('g')
             .append('g')
             .attr('class', 'stacked-bars-chart-group')
             .selectAll('.stacked-bars-chart')
             .data(this.data)
             .enter()
             .append('g')
             .attr('class', 'stacked-bars-chart')
             .style("fill",(d, i) => { return this.colors[i]; })
             .selectAll('rect')
             .data(d=>{return d})
             .enter()
             .append('rect')
             .attr('class','stacked-rects')
             .attr('x', d=>{
                return this.xScale(d[0]);
             })
             .attr('y',20)
             .attr('width', d=>{
               return this.xScale(d[1])- this.xScale(d[0]);
             })
             .attr('height', 40)
             .attr('strokey', 'black')
             .attr('stroke-width', 1)
   }
   updateStack(data){

         if(data.length ===1){
         this.data = stackedData(data);
         this.country = data[0].country;
         }else{
           this.data = this.aveData
           this.country = 'Avarage of All';
         }




      this.bars= d3.selectAll('.stacked-bars-chart')
            .data(this.data)



      const rect =
            this.bars.selectAll('rect')
            .data(function(d){return d})
            .transition()
            .attr('x', d=>{
               return this.xScale(d[0]);
            })
            .attr('width', d=>{
              return this.xScale(d[1])- this.xScale(d[0]);
            })
            .attr('height', 40)

       this.makeTitle();
   }
   makeTitle(){
      this.svg.select('.main-title').remove();

      const title =this.g.append('text').attr('class', 'main-title')
                                  .attr('x', 0)
                                  .attr('y', 15)
                title.text('Happiness Explained for: '+this.country);




   }
   makeMenu(){
     const colors = this.colors;
   const newDiv = d3.select(this.contEl).append('div')
                                        .attr('class', 'stacked-menu-container');
    const svg   =    newDiv.append('svg')
                            .attr('width',500)
                            .attr('height',60)
                            .attr('class', 'stacked-menu-svg')

          svg.selectAll('g')
              .data(this.keys)
              .enter()
              .append('g')
              .attr('transform', function(d,i){
                return 'translate(' + setLegend(i)   + ',' + (Math.floor(i/3)*25) + ')';
              })
              .each(function(d,j){
               d3.select(this).append('rect')
                .attr('width', '20px')
                .attr('height', '20px')
                .attr('fill', (d, i) => { return colors[j]; })

               d3.select(this)
                  .append('text')
                 .text(function(d){return var_name_map[d]})
                 .attr('transform', 'translate(' + 25 + ',' + 15 + ')')
                  .attr('font-size','10px')
              })

            }

}


function stackedData(data){

      const stack = d3.stack()
                      .keys(['un_explained','base','e_social_support','e_by_gdp_per','e_health_life_expectancy','e_by_freedom'])
      return stack(data);
}

function countryFilter(data, country){

  const countries = crossfilter(data);
  const countryDimension = countries.dimension(function(d){return d.country});
  const filter           =  countryDimension.filter(country);

  return countryDimension.top(Infinity);
}


function sumAll(data){
     let sum = {'un_explained':0,'base':0,'e_social_support':0,'e_by_gdp_per':0,'e_health_life_expectancy':0,'e_by_freedom':0};

     data.forEach(function(d){
          sum['un_explained']+=d['un_explained'];
          sum['base']+=d['base'];
          sum['e_social_support']+=d['e_social_support'];
          sum['e_by_gdp_per'] += d['e_by_gdp_per'];
          sum['e_health_life_expectancy'] += d['e_health_life_expectancy'];
          sum['e_by_freedom'] += d['e_by_freedom'];
     })
          sum['un_explained']=(sum['un_explained']/data.length);
          sum['base']=(sum['base']/data.length);
          sum['e_social_support']=(sum['e_social_support']/data.length);
          sum['e_by_gdp_per'] = (sum['e_by_gdp_per']/data.length);
          sum['e_health_life_expectancy'] = (sum['e_health_life_expectancy']/data.length);
          sum['e_by_freedom'] = (sum['e_by_freedom']/data.length);

          sum.happiness_score = sum['un_explained']+ sum['base']+sum['e_social_support']+sum['e_by_gdp_per']+sum['e_health_life_expectancy']+sum['e_by_freedom'];
          sum =[sum]
          return sum;
}


class Menu{
    constructor(opts){
      this.data = opts.data;
      this.id = opts.id;
      this.keys = Object.keys(this.data[0]);
      this.contEl = opts.contEl;
      this.explained_var = opts.selected[0];
      this.radius_var = opts.selected[1];
      this.color_var = opts.selected[2];



      this.keys = this.keys.filter(function(val){
        return val != 'country' && val != 'year';
      })

       this.menuData = [{name:'X-variable', values:this.keys}, {name:'radius', values:this.keys},{name:'color', values:this.keys}]
    }
    draw(){
        const explained_var = this.explained_var;
        const radius_var    = this.radius_var;
        const color_var     = this.color_var;

        this.menu = d3.select(this.contEl)
                       .selectAll('select')
                       .data(this.menuData)
                       .enter()
                       .append('div')
                       .attr('class', 'select-div div-'+this.id)
                       .append('select')
                       .attr('class', 'select-option')
                       .attr('id', (d,i)=>{
                         return 'select-'+i+'-'+this.id;
                     })
                       .selectAll('option')
                       .data(d=>{return d.values})
                       .enter()

                       .append('option')
                       .attr('id', (d,i)=>{
                         return 'option-'+i+'-'+this.id;
                       })
                       .each(function(d){
                         if(parseInt(this.parentNode.id.slice(7,8)) ==0){
                           if(d===explained_var){
                          d3.select(this).attr('selected','')
                          }
                         }

                         if(parseInt(this.parentNode.id.slice(7,8)) ==1){
                           if(d===radius_var){
                          d3.select(this).attr('selected','')
                          }
                         }

                         if(parseInt(this.parentNode.id.slice(7,8)) ==2){
                           if(d===color_var){
                          d3.select(this).attr('selected','')
                          }
                         }
                       })
                       .attr('value', d=>{return d})
                       .text(d=>{return var_name_map[d];})

          const text_labels = ['X Axis', 'Bubble Size', 'Bubble Color','X Axis', 'Bubble Size', 'Bubble Color'];
          d3.selectAll('.div-'+this.id).each(function(d,i){
            const label = d3.select(this).insert('label',":first-child")

                   label.attr('class', 'select-label').text(text_labels[i]+":")
          })
    }





  rerender(){

  }
}


function brushed(){


}

class YearMenu{
 constructor(opts){
   this.currentYear = opts.currentYear;
   this.years = ['2018'];
   this.contEl = opts.contEl;



 }

 draw(){

   this.makeButtons();
 }
 makeButtons(){
   this.menu=d3.select(this.contEl)
                .selectAll('.button-div-years')
                .data(this.years).
                enter()
                .append('div')
                .attr('class', 'button-div-years')
                .style('background-color', d=>{
                  if(d===this.currentYear){return 'white'}
                  return 'white';
                }).text(d=>{
                  return d;
                })
 }


rerender(year){
        this.currentYear = year;

          this.divs = d3.select(this.contEl)
                 .selectAll('.button-div-years');
                 this.divs
                 .style('background-color', d=>{

                   if(d===this.currentYear){return '#b9b7b7'}
                   return 'white';
                 })

}


}








function brushFilter(data, start,stop){
   //this function uses crossfilter to filter data by happiness start stop
  const countries = crossfilter(data);
  const countryDimension = countries.dimension(function(d){return d.happiness_score});
  const countryFilter    = countryDimension.filterRange([start,stop]);

  return countryDimension.top(Infinity);
}


function updateData(data){
// this function copies an array without keeping it connected
        return Object.assign([],data)
}


function filterDataYear(data, year){
  //this function uses crossfilter to filter data by year;
  const countries     = crossfilter(data);
  const yearDimension = countries.dimension (function(d){return d.year});
  const yearFilter    = yearDimension.filter(year);

  return yearDimension.top(Infinity);
}


function filterDataCountry(data,country){
  //this function uses crossfilter to filter data by year;
  const countries = crossfilter(data);
  const countryDimension = countries.dimension(function(d){return d.country});
  const countryFilter    = countryDimension.filter(country);

  return countryDimension.top(Infinity);
}


function formatBeeSwarmText(data){
        const country = data['country'];
        const happiness = data['happiness_score'];

        const html  = 'Country: '+country+" <br> Happiness Score: "+happiness

        return html;
}

function addUnExplained(data, keys){
  //this function adds unexplained happiness to our data
  let sum = 0;
  keys.forEach(function(val){
    sum += data[val];
  })

  const happiness = data.happiness_score;

  const un_explained = happiness - sum;

       data['un_explained'] = un_explained;

      return data;
}


function getAllCountries(data){
     const countries = [];

     data.forEach(function(val){
       countries.push(val.country);
     })

     return countries;
}

function democratic2017(data){
  //this function gives 2017 2016 generousity numbers has there is no data for 2017

          data.forEach(function(val,i){
              if(val.year === 2017){
                const democratic_q_2016 = data[i-1].democratic_q;
                data[i].democratic_q = democratic_q_2016;

              }
          })

          return data;
}


//hashmap to make names more readable

var var_name_map ={
  'happiness_score':'Happiness Score',
  'e_by_freedom':'Explained by Freedom',
  'e_by_gdp_per':'Explained by GDP Per Person',
  'e_health_life_expectancy':'Explained by Life Expectancy',
  'e_social_support':'Explained by Social Support',
  'base': 'Explained by Dystopia+residual',
  'life_ladder':'Life Ladder',
  'log_gdp_per':'Log GDP Per Person',
  'democratic_q':'Democratic Quality',
  'gini_index':'Gini Index',
  'healthy_life_expectancy':'Healthy Life Expectancy',
  'perception_of_corruption':'Perception of Corruption',
  'freedom_life_choice':'Freedom To Make Life Choices',
  'social_support':'Social Support',
  'generosity':'Generosity',
  'confidence_gov':'Confidence in Government',
  'un_explained':'Un Explained Happiness'

}

function setLegend(i){
  if(i<3){return (i*160);}
  if(i>=3){ return  ((i-3)*160);}
}


function formatStackedText(key,value){

         value = Math.round((value*100))/100;

       return var_name_map[key]+" <br> Value: "+value;
     }


var point_colors = {0:d3.interpolateBlues,1:d3.interpolatePurples};
